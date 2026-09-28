import { test, expect } from "@playwright/test";
import { createUIMessageStreamResponse, validateUIMessages } from "ai";
import { slides } from "../../src/lib/talk";
import { createDemoStream } from "../../src/lib/loop";
import { createRailTools } from "../../src/lib/tools";
import type { DemoMessage } from "../../src/lib/chat-types";
import { happyRailModel } from "../mock-model";

test("navigation, sommaire et tous les écrans", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Comprendre et développer des boucles d’outils agentiques.");
  await page.screenshot({ path: testInfo.outputPath("hero.png"), fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Entrer dans la boucle" }).click();
  await expect(page).toHaveURL(/#montre$/);
  await page.getByRole("button", { name: "04 La réponse" }).click();
  await expect(page.getByRole("heading", { name: "Il est 14 h 07." })).toBeVisible();
  await page.getByRole("button", { name: "Ouvrir le sommaire" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/#contexte");
  await page.getByRole("button", { name: "Écran suivant" }).click();
  await expect(page).toHaveURL(/#outil$/);
  await page.getByRole("button", { name: "Écran précédent" }).click();
  await expect(page).toHaveURL(/#contexte$/);
  await page.getByRole("button", { name: "Écran suivant" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comment déclarer un outil ?");
  const parts = page.getByRole("group", { name: "Explorer la déclaration" }).getByRole("button");
  for (let index = 0; index < 5; index++) {
    await parts.nth(index).click();
    await expect(parts.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".tool-code-highlight").first()).toBeVisible();
    await expect(page).toHaveURL(/#outil$/);
  }
  await parts.nth(3).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#tool-part-detail")).toContainText('"heure": "14:07"');
  await expect(page.locator(".tool-code-highlight").first()).toContainText("const sortie = z.object");
  await page.screenshot({ path: testInfo.outputPath("outil.png"), fullPage: true, animations: "disabled" });
  for (const slide of slides.slice(2)) {
    await page.goto(`/#${slide.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(slide.title.replace("\n", " "));
    await expect(page.locator("main")).not.toContainText(/Bedrock|Converse/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("compaction séparée et diagramme interactif", async ({ page }, testInfo) => {
  await page.goto("/#compaction");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alléger le contexte.");
  const before = await page.locator(".compact-columns > div").first().innerText();
  await page.getByRole("button", { name: "Compacter la vue modèle" }).click();
  await expect(page.locator(".summary")).toContainText("budget ≤ 900");
  expect(await page.locator(".compact-columns > div").first().innerText()).toEqual(before);
  await page.getByRole("button", { name: "Étape suivante" }).click();
  await expect(page.locator(".diagram-caption")).toContainText("Le modèle produit une réponse");
  await page.screenshot({ path: testInfo.outputPath("compaction.png"), fullPage: true, animations: "disabled" });
});

test("le diagramme sélectionne le nœud de la page après chaque navigation", async ({ page }) => {
  for (const [id, node] of [
    ["boucle", "Contexte"],
    ["contraintes", "Application"],
    ["contexte", "Contexte"],
    ["cache", "Contexte"],
    ["compaction", "Contexte"],
    ["interface", "Application"],
    ["raisonnement", "Modèle"],
  ]) {
    await page.goto(`/#${id}`);
    const selected = page.locator(".loop-node[aria-pressed=true]");
    await expect(selected).toHaveCount(1);
    await expect(selected).toContainText(node);
    await page.locator(".loop-node").filter({ hasText: "Observation" }).click();
    await expect(selected).toContainText("Observation");
    await expect(page.locator(".diagram-caption")).toContainText("Le résultat réel");
  }
  await page.getByRole("button", { name: "Étape suivante" }).click();
  await expect(page.locator(".loop-node[aria-pressed=true]")).toContainText("Réinjection");
});

test("chat SSE réel du SDK avec modèle de test, carte, suivi et historique", async ({ page }, testInfo) => {
  let requests = 0;
  await page.route("**/api/chat", async (route) => {
    requests++;
    const payload = route.request().postDataJSON();
    const messages = await validateUIMessages<DemoMessage>({ messages: payload.messages, tools: createRailTools().tools });
    const model = happyRailModel(requests > 1);
    const response = createUIMessageStreamResponse({ stream: createDemoStream({ model, messages }) });
    await route.fulfill({ status: 200, headers: Object.fromEntries(response.headers), body: await response.text() });
  });
  await page.goto("/#demo");
  await page.getByRole("textbox", { name: "Votre demande de voyage" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#demo$/);
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.locator(".journey")).toHaveCount(2);
  await expect(page.locator(".step-card")).toHaveCount(4);
  await expect(page.getByRole("log")).toContainText("Aurore et Pélagia");
  await page.screenshot({ path: testInfo.outputPath("live-demo.png"), fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Écran suivant" }).click();
  await page.getByRole("button", { name: "Écran précédent" }).click();
  await expect(page.locator(".journey")).toHaveCount(2);
  await page.getByRole("button", { name: "Sans correspondance", exact: true }).click();
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.locator(".journey")).toHaveCount(1);
  await expect(page.locator(".journey")).toContainText("Pélagia");
  expect(requests).toBe(2);
  await page.getByRole("button", { name: "Nouvelle conversation" }).click();
  await expect(page.locator(".journey")).toHaveCount(0);
  await expect(page.locator(".step-card")).toHaveCount(0);
});

test("une erreur HTTP est affichée, sans réponse fictive", async ({ page }) => {
  await page.route("**/api/chat", (route) => route.fulfill({ status: 503, body: "Modèle indisponible pour ce test." }));
  await page.goto("/#demo");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.locator(".error-box")).toContainText("Modèle indisponible");
  await expect(page.locator(".journey")).toHaveCount(0);
  await page.getByRole("button", { name: "Reprendre la demande" }).click();
  await expect(page.getByRole("textbox", { name: "Votre demande de voyage" })).not.toHaveValue("");
});

test("version mobile sans débordement horizontal", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ["depart", "outil", "boucle", "compaction", "demo", "patterns"]) {
    await page.goto(`/#${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".page-controls")).toContainText("/ 17");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (id === "outil") {
      await page.getByRole("button", { name: "05 Fonction d’exécution execute" }).click();
      await expect(page.locator("#tool-part-detail")).toContainText("lit l’horloge");
      await page.screenshot({ path: testInfo.outputPath("outil-mobile.png"), fullPage: true, animations: "disabled" });
    }
  }
  await page.screenshot({ path: testInfo.outputPath("mobile.png"), fullPage: true, animations: "disabled" });
});
