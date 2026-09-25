import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { ToolName } from "../src/lib/policy";

type Chunk = Awaited<ReturnType<MockLanguageModelV4["doStream"]>>["stream"] extends ReadableStream<infer Part> ? Part : never;
type Action = { toolName: ToolName; input: object } | { text: string };

export function scriptedModel(actions: Action[]) {
  let index = 0;
  return new MockLanguageModelV4({
    doStream: async () => {
      const action = actions[index++];
      if (!action) throw new Error("Le modèle de test a dépassé le scénario prévu.");
      const chunks: Chunk[] = [{ type: "stream-start", warnings: [] }];
      if ("toolName" in action) {
        chunks.push({ type: "tool-call", toolCallId: `call-${index}`, toolName: action.toolName, input: JSON.stringify(action.input) });
      } else {
        chunks.push(
          { type: "text-start", id: "answer" },
          { type: "text-delta", id: "answer", delta: action.text },
          { type: "text-end", id: "answer" },
        );
      }
      chunks.push({
        type: "finish",
        finishReason: { unified: "toolName" in action ? "tool-calls" : "stop", raw: undefined },
        usage: {
          inputTokens: { total: 100, noCache: 100, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 20, text: 20, reasoning: 0 },
        },
      });
      return { stream: simulateReadableStream({ chunks, initialDelayInMs: 0, chunkDelayInMs: 0 }) };
    },
  });
}

export function happyRailModel(directOnly = false) {
  const destinationIds = directOnly ? ["pelagia"] : ["aurore", "pelagia"];
  return scriptedModel([
    { toolName: "searchTrains", input: { maxPrice: 900, mood: "calme", nightTrain: true, directOnly } },
    { toolName: "checkConnections", input: { destinationIds } },
    { toolName: "showItinerary", input: { destinationIds } },
    { text: directOnly ? "Pélagia : un train direct, 860 crédits aller-retour par personne, hors hébergement." : "Aurore et Pélagia : deux trains de nuit sous 900 crédits aller-retour par personne, hors hébergement." },
  ]);
}
