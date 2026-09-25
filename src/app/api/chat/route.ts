import {
  createUIMessageStreamResponse,
  safeValidateUIMessages,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { DemoMessage } from "@/lib/chat-types";
import { createDemoStream } from "@/lib/loop";
import { MAX_MESSAGES, MAX_PROMPT_CHARACTERS, MAX_REQUEST_BYTES } from "@/lib/policy";
import { createRailTools } from "@/lib/tools";

export const runtime = "nodejs";
export const maxDuration = 90;

const requestSchema = z.object({
  messages: z.array(z.object({
    id: z.string().min(1).max(200),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.unknown()).min(1).max(100),
  })).min(1).max(MAX_MESSAGES),
});

function problem(message: string, status: number) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  console.log("Origin:", origin);
  console.log("Shouldbe", new URL(request.url).origin);
  if (origin && origin !== new URL(request.url).origin) {
    return problem("Cette démo locale refuse les requêtes d’une autre origine.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) return problem("Conversation trop volumineuse. Ouvrez une nouvelle conversation.", 413);

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
      return problem("Conversation trop volumineuse. Ouvrez une nouvelle conversation.", 413);
    }
    raw = JSON.parse(body);
  } catch {
    return problem("Corps JSON illisible.", 400);
  }

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return problem(`Conversation invalide (maximum ${MAX_MESSAGES} messages).`, 400);

  const session = createRailTools();
  const validated = await safeValidateUIMessages<DemoMessage>({
    messages: parsed.data.messages,
    tools: session.tools,
  });
  if (!validated.success) return problem("Les messages ou les appels d’outils sont invalides.", 400);
  const messages = validated.data;
  if (messages.at(-1)?.role !== "user") return problem("Le dernier message doit être une demande utilisateur.", 400);

  for (const message of messages) {
    if (message.role === "user") {
      if (message.parts.some((part) => part.type !== "text")) return problem("Seuls les messages texte sont acceptés.", 400);
      const text = message.parts.filter((part) => part.type === "text").map((part) => part.text).join("");
      if (!text.trim() || text.length > MAX_PROMPT_CHARACTERS) {
        return problem(`Chaque demande doit contenir entre 1 et ${MAX_PROMPT_CHARACTERS} caractères.`, 400);
      }
    } else if (message.parts.some((part) => !["text", "step-start", "tool-searchTrains", "tool-checkConnections", "tool-showItinerary"].includes(part.type))) {
      return problem("Ce type de contenu assistant n’est pas accepté dans la démo.", 400);
    }
  }

  const modelId = process.env.DEMO_MODEL_ID?.trim() || "gpt-4.1-mini";
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return problem("La démo n’est pas configurée. Renseignez OPENAI_API_KEY dans .env.local, puis redémarrez le serveur.", 503);
  }
  const openai = createOpenAI({ apiKey });
  const stream = createDemoStream({ model: openai(modelId), messages, signal: request.signal, session });

  return createUIMessageStreamResponse({ stream });
}
