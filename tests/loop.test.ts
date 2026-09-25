import assert from "node:assert/strict";
import test from "node:test";
import { createUIMessageStreamResponse, readUIMessageStream, safeValidateUIMessages } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { DemoMessage } from "../src/lib/chat-types";
import { createDemoStream } from "../src/lib/loop";
import { createRailTools } from "../src/lib/tools";
import { MAX_STEPS } from "../src/lib/policy";
import { happyRailModel, scriptedModel } from "./mock-model";

const messages: DemoMessage[] = [{ id: "user1", role: "user", parts: [{ type: "text", text: "Un train de nuit au calme sous 900 crédits, puis affiche les trajets." }] }];

test("la vraie boucle exécute les outils, réinjecte les résultats et streame la carte", async () => {
  const model = happyRailModel();
  let answer: DemoMessage | undefined;
  for await (const message of readUIMessageStream<DemoMessage>({ stream: createDemoStream({ model, messages }), terminateOnError: true })) answer = message;
  assert.equal(model.doStreamCalls.length, 4);
  assert.deepEqual(model.doStreamCalls[0].tools?.map((tool) => tool.name), ["searchTrains"]);
  assert.deepEqual(model.doStreamCalls[1].tools?.map((tool) => tool.name), ["searchTrains", "checkConnections"]);
  assert.deepEqual(model.doStreamCalls[2].tools?.map((tool) => tool.name), ["searchTrains", "checkConnections", "showItinerary"]);
  assert.equal(model.doStreamCalls[3].toolChoice?.type, "none");
  assert.match(JSON.stringify(model.doStreamCalls[1].prompt), /priceUnit/);
  assert.ok(answer);
  const map = answer.parts.find((part) => part.type === "tool-showItinerary");
  assert.ok(map && map.type === "tool-showItinerary" && map.state === "output-available");
  assert.deepEqual(map.output, { destinationIds: ["aurore", "pelagia"], status: "command-prepared" });
  const conversation = [...messages, answer, { id: "user2", role: "user" as const, parts: [{ type: "text" as const, text: "Et sans correspondance ?" }] }];
  assert.equal((await safeValidateUIMessages<DemoMessage>({ messages: conversation, tools: createRailTools().tools })).success, true);
  const nextModel = happyRailModel(true);
  await createUIMessageStreamResponse({ stream: createDemoStream({ model: nextModel, messages: conversation }) }).text();
  assert.match(JSON.stringify(nextModel.doStreamCalls[0].prompt), /sans correspondance/);
  assert.match(JSON.stringify(nextModel.doStreamCalls[0].prompt), /command-prepared/);
  assert.deepEqual(nextModel.doStreamCalls[0].tools?.map((tool) => tool.name), ["searchTrains"]);
});

test("la trace décrit les steps et les vraies métriques du modèle de test", async () => {
  const response = await createUIMessageStreamResponse({ stream: createDemoStream({ model: happyRailModel(), messages }) }).text();
  assert.match(response, /"type":"data-step"/);
  assert.match(response, /"inputTokens":100/);
  assert.match(response, /"cacheReadTokens":0/);
  assert.match(response, /"state":"done"/);
  assert.doesNotMatch(response, /reasoning-delta/);
});

test("un incident observé peut entraîner une autre recherche puis un autre trajet", async () => {
  const model = scriptedModel([
    { toolName: "searchTrains", input: { maxPrice: 800, destinationId: "sirocco" } },
    { toolName: "checkConnections", input: { destinationIds: ["sirocco"] } },
    { toolName: "searchTrains", input: { maxPrice: 800, mood: "aventure" } },
    { toolName: "checkConnections", input: { destinationIds: ["sylve"] } },
    { toolName: "showItinerary", input: { destinationIds: ["sylve"] } },
    { text: "Sirocco est fermée. Le trajet vers Sylve est disponible." },
  ]);
  const response = await createUIMessageStreamResponse({ stream: createDemoStream({ model, messages }) }).text();
  assert.equal(model.doStreamCalls.length, MAX_STEPS);
  assert.match(JSON.stringify(model.doStreamCalls[2].prompt), /pluie de météorites/);
  assert.match(response, /"destinationIds":\["sylve"\],"status":"command-prepared"/);
  assert.equal(model.doStreamCalls[5].toolChoice?.type, "none");
});

test("même après des recherches répétées, le sixième appel est le dernier et sans outil", async () => {
  const actions = Array.from({ length: 5 }, () => ({ toolName: "searchTrains" as const, input: { maxPrice: 100 } }));
  const model = scriptedModel([...actions, { text: "Aucun trajet dans ce budget." }]);
  const response = await createUIMessageStreamResponse({ stream: createDemoStream({ model, messages }) }).text();
  assert.equal(model.doStreamCalls.length, MAX_STEPS);
  assert.equal(model.doStreamCalls.at(-1)?.toolChoice?.type, "none");
  assert.match(response, /Aucun trajet dans ce budget/);
});

test("les erreurs fournisseur sont explicites sans révéler leurs détails", async () => {
  const model = new MockLanguageModelV4({ doStream: async () => { throw new Error("FAKE_PRIVATE_PROVIDER_DETAIL"); } });
  const response = await createUIMessageStreamResponse({ stream: createDemoStream({ model, messages }) }).text();
  assert.match(response, /"type":"error"/);
  assert.match(response, /Appel au modèle interrompu ou refusé/);
  assert.doesNotMatch(response, /FAKE_PRIVATE_PROVIDER_DETAIL/);
});
