import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../src/app/api/chat/route";
import { MAX_MESSAGES, MAX_PROMPT_CHARACTERS, MAX_REQUEST_BYTES, MAX_STEPS, allowedTools } from "../src/lib/policy";
import { connectionFor, searchTrains } from "../src/lib/rail";
import { formatTime, slides, slideStart } from "../src/lib/talk";
import { createRailTools } from "../src/lib/tools";

const options = { toolCallId: "test", messages: [], context: {} };
const user = (text = "Un train pour Aurore.") => ({ id: "u1", role: "user", parts: [{ type: "text", text }] });
const request = (body: unknown, headers?: HeadersInit) => new Request("http://localhost/api/chat", {
  method: "POST", body: JSON.stringify(body), headers,
});

test("le déroulé fait exactement 30 minutes avec des ancres uniques", () => {
  assert.equal(slideStart(slides.length), 1800);
  assert.equal(new Set(slides.map((slide) => slide.id)).size, slides.length);
  assert.equal(formatTime(1470), "24:30");
  assert.equal(slides.find((slide) => slide.id === "demo")?.seconds, 300);
});

test("les trains respectent budget, ambiance, nuit et correspondances", () => {
  assert.deepEqual(searchTrains({ maxPrice: 900, mood: "calme", nightTrain: true }).map((item) => item.id), ["aurore", "pelagia"]);
  assert.deepEqual(searchTrains({ maxPrice: 900, mood: "calme", nightTrain: true, directOnly: true }).map((item) => item.id), ["pelagia"]);
  assert.equal(searchTrains({ maxPrice: 100 }).length, 0);
  assert.equal(searchTrains({ maxPrice: 789, destinationId: "aurore" }).length, 0);
  assert.equal(searchTrains({ maxPrice: 790, destinationId: "aurore" }).length, 1);
  assert.equal(connectionFor("sirocco").available, false);
});

test("la politique réserve le dernier appel à une synthèse sans outil", () => {
  assert.deepEqual(allowedTools({ stepNumber: 0, searched: false, verified: false, mapPrepared: false }), ["searchTrains"]);
  for (const stepNumber of [MAX_STEPS - 1, MAX_STEPS, 100]) {
    assert.deepEqual(allowedTools({ stepNumber, searched: true, verified: true, mapPrepared: false }), []);
  }
});

test("impossible de vérifier hors recherche ou d’afficher sans contrôle métier", async () => {
  const session = createRailTools();
  await assert.rejects(async () => session.tools.checkConnections.execute!({ destinationIds: ["aurore"] }, options), /Recherchez/);
  await assert.rejects(async () => session.tools.showItinerary.execute!({ destinationIds: ["aurore"] }, options), /pas été vérifié/);
  await session.tools.searchTrains.execute!({ maxPrice: 900, mood: "calme", nightTrain: true }, options);
  assert.deepEqual(session.activeTools(1), ["searchTrains", "checkConnections"]);
  await session.tools.checkConnections.execute!({ destinationIds: ["aurore", "pelagia"] }, options);
  assert.deepEqual(session.activeTools(2), ["searchTrains", "checkConnections", "showItinerary"]);
  assert.deepEqual(await session.tools.showItinerary.execute!({ destinationIds: ["aurore", "aurore", "pelagia"] }, options), {
    destinationIds: ["aurore", "pelagia"], status: "command-prepared",
  });
  assert.deepEqual(session.activeTools(3), []);
  assert.deepEqual(createRailTools().activeTools(0), ["searchTrains"]);
});

test("la fermeture est une observation exploitable mais interdit le tracé", async () => {
  const session = createRailTools();
  await session.tools.searchTrains.execute!({ maxPrice: 800, destinationId: "sirocco" }, options);
  const result = await session.tools.checkConnections.execute!({ destinationIds: ["sirocco"] }, options);
  assert.deepEqual(result, { fictional: true, results: [connectionFor("sirocco")] });
  await assert.rejects(async () => session.tools.showItinerary.execute!({ destinationIds: ["sirocco"] }, options), /pas été vérifié/);
  assert.deepEqual(session.activeTools(2), ["searchTrains", "checkConnections"]);
});

test("la route refuse le JSON incorrect et les origines étrangères", async () => {
  const invalid = await POST(new Request("http://localhost/api/chat", { method: "POST", body: "{" }));
  assert.equal(invalid.status, 400);
  assert.equal((await POST(request({ messages: [user()] }, { origin: "https://foreign.invalid" }))).status, 403);
});

test("les limites portent sur les octets, les messages et la demande", async () => {
  assert.equal((await POST(request({ messages: [user()] }, { "content-length": String(MAX_REQUEST_BYTES + 1) }))).status, 413);
  assert.equal((await POST(request({ messages: [user("é".repeat(MAX_REQUEST_BYTES / 2))] }))).status, 413);
  assert.equal((await POST(request({ messages: Array.from({ length: MAX_MESSAGES + 1 }, () => user()) }))).status, 400);
  assert.equal((await POST(request({ messages: [user("a".repeat(MAX_PROMPT_CHARACTERS + 1))] }))).status, 400);
  assert.equal((await POST(request({ messages: [user("   ")] }))).status, 400);
  assert.equal((await POST(request({ messages: [{ ...user(), role: "system" }] }))).status, 400);
  assert.equal((await POST(request({ messages: [{ ...user(), parts: [{ type: "file", url: "https://foreign.invalid", mediaType: "text/plain" }] }] }))).status, 400);
});

test("sans clé OpenAI, erreur explicite et aucune fausse réponse", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await POST(request({ messages: [user()] }));
    assert.equal(response.status, 503);
    const body = await response.text();
    assert.match(body, /n’est pas configurée/);
    assert.match(body, /OPENAI_API_KEY/);
  } finally {
    if (previousKey !== undefined) process.env.OPENAI_API_KEY = previousKey;
    else delete process.env.OPENAI_API_KEY;
  }
});
