import {
  convertToModelMessages,
  createUIMessageStream,
  isStepCount,
  streamText,
  type LanguageModel,
} from "ai";
import type { DemoMessage, StepTrace } from "./chat-types";
import { instructions } from "./instructions";
import { MAX_STEPS } from "./policy";
import { createRailTools } from "./tools";

function streamError(error: unknown) {
  console.error("[model-stream]", error instanceof Error ? error.name : "UnknownError");
  return "Appel au modèle interrompu ou refusé. Vérifiez la clé, l’accès au modèle et sa compatibilité avec les outils ; puis réessayez. Aucun résultat de remplacement n’a été généré.";
}

export function createDemoStream({
  model, messages, signal, session = createRailTools(),
}: {
  model: LanguageModel;
  messages: DemoMessage[];
  signal?: AbortSignal;
  session?: ReturnType<typeof createRailTools>;
}) {
  return createUIMessageStream<DemoMessage>({
    originalMessages: messages,
    onError: streamError,
    execute: async ({ writer }) => {
      const stepStarts = new Map<number, { time: number; trace: StepTrace }>();
      const result = streamText({
        model,
        instructions,
        messages: await convertToModelMessages(messages, { ignoreIncompleteToolCalls: true }),
        tools: session.tools,
        stopWhen: isStepCount(MAX_STEPS),
        abortSignal: signal,
        timeout: { totalMs: 85_000 },
        maxOutputTokens: 1200,
        maxRetries: 0,
        onError: ({ error }) => { streamError(error); },
        prepareStep: ({ stepNumber, messages: context }) => {
          const activeTools = session.activeTools(stepNumber);
          const trace: StepTrace = {
            number: stepNumber + 1, state: "running", activeTools, messageCount: context.length,
          };
          stepStarts.set(stepNumber, { time: performance.now(), trace });
          writer.write({ type: "data-step", data: trace, transient: true });
          return { activeTools, toolChoice: activeTools.length === 0 ? "none" : "auto" };
        },
        onStepEnd: (step) => {
          const started = stepStarts.get(step.stepNumber);
          if (!started) throw new Error("État de step manquant.");
          writer.write({
            type: "data-step",
            transient: true,
            data: {
              ...started.trace, state: "done",
              durationMs: Math.round(performance.now() - started.time),
              inputTokens: step.usage.inputTokens,
              outputTokens: step.usage.outputTokens,
              cacheReadTokens: step.usage.inputTokenDetails.cacheReadTokens,
              finishReason: step.finishReason,
            },
          });
        },
        onEnd: ({ finishReason }) => {
          if (finishReason !== "stop") {
            writer.write({
              type: "data-notice", transient: true,
              data: { message: `Fin non standard (${finishReason}). La réponse peut être incomplète ; vérifiez le journal avant de conclure.` },
            });
          }
        },
      });
      writer.merge(result.toUIMessageStream<DemoMessage>({ sendReasoning: false, onError: streamError }));
    },
  });
}
