"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chapters, formatTime, slides, slideStart, sources } from "@/lib/talk";
import { Concept, HumanScene } from "./experiments";
import { LoopDiagram } from "./loop-diagram";
import { Demo } from "./demo";

const code = `const session = createRailTools();

const result = streamText({
  model: selectedModel,
  instructions,
  messages: await convertToModelMessages(messages),
  tools: session.tools,
  stopWhen: isStepCount(6),

  prepareStep: ({ stepNumber }) => {
    const activeTools = session.activeTools(stepNumber);
    return {
      activeTools,
      toolChoice: activeTools.length ? "auto" : "none",
    };
  },
});`;

function Timer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [running]);
  return <div className={`timer ${elapsed >= 1800 ? "over-time" : ""}`}>
    <button aria-label={running ? "Mettre le chrono en pause" : "Démarrer le chrono"} title={running ? "Pause" : "Démarrer le chrono"} onClick={() => { start.current = Date.now() - elapsed * 1000; setRunning(!running); }}><span aria-hidden="true">{running ? "Ⅱ" : "▷"}</span> {formatTime(elapsed)} <small>/ 30:00</small></button>
    <button className="timer-reset" aria-label="Réinitialiser le chrono" onClick={() => { setRunning(false); setElapsed(0); }}>↺</button>
  </div>;
}

function Hero({ onStart }: { onStart: () => void }) {
  return <div className="hero">
    <div className="hero-copy">
      <h1>Comprendre et développer des boucles d’outils agentiques.</h1>
      <br />
      <button className="primary-button hero-cta" onClick={onStart}>Entrer dans la boucle <span>↗</span></button>
    </div>
    <div className="hero-art" aria-hidden="true">
      <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
      <div className="planet"><div className="planet-grid" /><span>↻</span></div>
      <div className="orbital-tag orbital-context"><span>01</span> contexte</div>
      <div className="orbital-tag orbital-model"><span>02</span> modèle</div>
      <div className="orbital-tag orbital-tool"><span>03</span> outil</div>
      <div className="orbit-note">DÉCIDER → AGIR → OBSERVER</div>
    </div>
  </div>;
}

function Assistants() {
  return <div className="assistants">
    <div className="assistant-cards">
      <article className="panel"><span className="card-index">01 / CODE</span><h2>« Corrige ce bug. »</h2><div className="action-chain">lire → modifier → tester → corriger</div><p>Le résultat d’un test modifie la prochaine action. Le terminal devient une source d’observations.</p><small>Assistant de code avec outils autorisés</small></article>
      <article className="panel"><span className="card-index">02 / RECHERCHE</span><h2>« Compare ces options. »</h2><div className="action-chain">chercher → lire → croiser → répondre</div><p>Une interface de chat peut orchestrer recherche web, documents ou exécution de code.</p><small>ChatGPT, Claude… selon le mode et les permissions</small></article>
      <article className="panel accent-panel"><span className="card-index">03 / NOTRE PRODUIT</span><h2>« Où partir ? »</h2><div className="action-chain">explorer → vérifier → afficher</div><p>Le chat porte la conversation. La carte matérialise les propositions. La boucle relie les deux.</p><small>Recherche inspirationnelle de voyages</small></article>
    </div>
    <div className="comparison-strip"><span><strong>Workflow</strong> · la trajectoire est écrite dans le code</span><span>← degrés de contrôle →</span><span><strong>Boucle agentique</strong> · une partie des actions est choisie par le modèle</span></div>
    <p className="footnote">Une capacité du système, pas une propriété de chaque message : répondre sans outil reste possible.</p>
  </div>;
}

const patterns = [
  { name: "ReAct", caption: "Observer pour décider", flow: ["Raisonner", "Agir", "Observer", "↻"], description: "Entrelace décision, action et observation. Adapté aux prochaines étapes qui dépendent du résultat précédent.", limit: "Des allers-retours au modèle ; trajectoire et coût variables.", detail: "Notre démo en est proche : l’observation « ligne fermée » peut déclencher une nouvelle recherche. Pas besoin de montrer une chaîne de pensée." },
  { name: "Plan-and-Execute", caption: "Séparer les rôles", flow: ["Planifier", "Exécuter", "Replanifier ?"], description: "Un plan explicite organise les sous-tâches. L’exécuteur peut lui-même utiliser une boucle d’outils.", limit: "Un plan peut devenir obsolète. Il faut prévoir les retours d’exécution.", detail: "Exemple : planifier trois étapes d’un voyage, déléguer les vérifications, puis réviser le plan si une liaison est indisponible." },
  { name: "ReWOO", caption: "Préparer les dépendances", flow: ["Plan + #E1", "Exécuter", "Synthétiser"], description: "Le plan référence des résultats futurs. Les outils résolvent ces dépendances avant la synthèse.", limit: "Moins de réactivité pendant le plan initial ; structure et dépendances à fiabiliser.", detail: "Exemple : #E1 = destinations ; #E2 = correspondances de #E1 ; puis synthèse. « Without Observations » concerne la planification, pas l’absence de résultats." },
  { name: "Reflexion", caption: "Apprendre entre les essais", flow: ["Essayer", "Évaluer", "Mémoriser", "↻"], description: "Un retour d’évaluation alimente une mémoire textuelle utilisée à la tentative suivante.", limit: "Nécessite un signal d’évaluation utile et un budget de nouvelles tentatives.", detail: "Exemple : après l’échec d’un itinéraire, conserver une leçon exploitable pour le prochain essai. Ce n’est pas une mise à jour des poids du modèle." },
];

function Patterns() {
  const [selected, setSelected] = useState(0);
  return <div className="patterns">
    <div className="pattern-grid">{patterns.map((pattern, index) => <button className={`pattern-card panel ${index === selected ? "selected" : ""}`} key={pattern.name} onClick={() => setSelected(index)} aria-pressed={index === selected}>
      <span className="card-index">0{index + 1}</span><h2>{pattern.name}</h2><span className="pattern-caption">{pattern.caption}</span><div className="pattern-flow">{pattern.flow.map((item, index) => <span key={index}>{item}</span>)}</div><p>{pattern.description}</p><small>{pattern.limit}</small>
    </button>)}</div>
    <div className="pattern-detail" aria-live="polite"><span>CONCRÈTEMENT</span><p>{patterns[selected].detail}</p></div>
    <p className="footnote">Des stratégies combinables, pas quatre niveaux d’autonomie. La boucle d’outils est un mécanisme, pas un concurrent de ces patterns.</p>
  </div>;
}

function CodeSlide() {
  return <div className="code-slide"><div className="code-window"><div className="code-title"><span><i /><i /><i /></span><code>lib/loop.ts — extrait simplifié</code><span>AI SDK 7</span></div><pre><code>{code}</code></pre></div><div className="code-annotations"><article><span>01</span><h3>Le contrat</h3><p>Des descriptions, des schémas d’entrée et des fonctions d’exécution.</p></article><article><span>02</span><h3>La politique</h3><p>Les outils autorisés dépendent des observations. Les validations restent dans le code.</p></article><article><span>03</span><h3>Les limites</h3><p>Six appels maximum ; le dernier sans outil pour synthétiser. Timeout et annulation dans la route complète.</p></article><div className="callout">Le flux transporte le texte, les appels d’outils et les métriques jusqu’à React.</div></div></div>;
}

export function Presentation({ configured }: { configured: boolean }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const menu = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const slide = slides[index];

  const goTo = useCallback((next: number) => {
    const bounded = Math.max(0, Math.min(slides.length - 1, next));
    window.location.hash = slides[bounded].id;
  }, []);

  useEffect(() => {
    function syncHash() {
      const next = slides.findIndex((item) => `#${item.id}` === window.location.hash);
      setIndex(next < 0 ? 0 : next);
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    }
    const frame = requestAnimationFrame(syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", syncHash); };
  }, []);

  const fullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setFeedback("Le plein écran n’est pas disponible dans ce navigateur.");
    } catch {
      setFeedback("Le navigateur a refusé le plein écran. Utilisez le mode présentation de votre navigateur.");
    }
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || menu.current?.open) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.closest("input, textarea, select, button, a, summary") || target.isContentEditable)) return;
      if (["ArrowRight", "PageDown", "ArrowLeft", "PageUp", "Home", "End", " "].includes(event.key)) {
        event.preventDefault();
        if (event.key === "Home") goTo(0);
        else if (event.key === "End") goTo(slides.length - 1);
        else goTo(index + (["ArrowLeft", "PageUp"].includes(event.key) ? -1 : 1));
      } else if (event.key.toLowerCase() === "f") void fullscreen();
      else if (event.key.toLowerCase() === "m") menu.current?.showModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, fullscreen]);

  return <div className={`presentation ${slide.id === "demo" ? "demo-mode" : ""}`}>
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>Aller au contenu</a>
    <header className="site-header">
      <button className="brand" onClick={() => goTo(0)} aria-label="Revenir à l’ouverture"><span className="brand-symbol">↻</span><span>dans la boucle<span className="brand-dot">.</span></span></button>
      <div className="header-actions"><Timer /><button className="utility-button fullscreen-button" onClick={() => void fullscreen()} title="Plein écran (F)" aria-label="Basculer en plein écran">⛶</button><button className="utility-button" onClick={() => menu.current?.showModal()} title="Sommaire (M)" aria-label="Ouvrir le sommaire">☷</button></div>
    </header>
    <nav className="chapter-nav" aria-label="Chapitres du talk">
      {chapters.map((chapter, chapterIndex) => <button key={chapter} className={chapterIndex === slide.chapter ? "current" : ""} aria-current={chapterIndex === slide.chapter ? "step" : undefined} onClick={() => goTo(slides.findIndex((item) => item.chapter === chapterIndex))}><span>0{chapterIndex + 1}</span>{chapter}<i /></button>)}
    </nav>
    <main id="main-content" tabIndex={-1}>
      {index === 0 ? <Hero onStart={() => goTo(1)} /> : <div className="slide-heading"><div><span className="eyebrow">{chapters[slide.chapter]} <span>/</span> {formatTime(slideStart(index))} — {formatTime(slideStart(index) + slide.seconds)}</span><h1 ref={heading} tabIndex={-1}>{slide.title}</h1><p>{slide.subtitle}</p></div></div>}
      <div key={slide.id} className="slide-body">
        {(slide.id === "montre" || slide.id === "calendrier") && <HumanScene calendar={slide.id === "calendrier"} />}
        {slide.chapter === 1 && <div className="lab-grid"><Concept id={slide.id} /><LoopDiagram feature={slide.id} /></div>}
        {slide.id === "assistants" && <Assistants />}
        {slide.id === "code" && <CodeSlide />}
        {slide.id === "patterns" && <Patterns />}
        {slide.id === "retenir" && <div className="takeaways">{[
          ["01", "La boucle", "Proposer → exécuter → observer → décider."],
          ["02", "Le contexte", "Une vue construite, pas une mémoire magique."],
          ["03", "Le contrôle", "Peu d’outils, des limites, une trace vérifiable."],
        ].map(([number, title, description]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}</div>}
        {slide.id === "questions" && <div className="questions"><div className="question-card"><span className="eyebrow">LE POINT DE DÉPART</span><h2>Une action utile.<br />Une observation fiable.<br /><em>Et une limite claire.</em></h2><p>Merci d’avoir fait le voyage.</p></div><div className="sources panel"><span className="panel-label">POUR ALLER PLUS LOIN</span>{sources.map((source) => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.label}<span>↗</span></a>)}</div></div>}
      </div>
      <div hidden={slide.id !== "demo"}><Demo configured={configured} /></div>
    </main>
    <footer className="deck-footer">
      <div className="page-controls"><button className="nav-arrow" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Écran précédent">←</button><span><strong>{(index + 1).toString().padStart(2, "0")}</strong> / {slides.length.toString().padStart(2, "0")}</span><button className="nav-arrow" onClick={() => goTo(index + 1)} disabled={index === slides.length - 1} aria-label="Écran suivant">→</button></div><div className="deck-progress" style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></footer>
    <div className="sr-only" role="status">{feedback}</div>
    <dialog ref={menu} className="outline-dialog"><div className="dialog-header"><div><span className="eyebrow">LE VOYAGE EN 30 MINUTES</span><h2>Choisir une escale.</h2></div><form method="dialog"><button className="utility-button" aria-label="Fermer le sommaire">×</button></form></div><div className="outline-list">{slides.map((item, slideIndex) => <button key={item.id} onClick={() => { goTo(slideIndex); menu.current?.close(); }} aria-current={index === slideIndex ? "step" : undefined}><span>{formatTime(slideStart(slideIndex))}</span><strong>{item.title.replace("\n", " ")}</strong><small>{item.speaker}</small></button>)}</div></dialog>
  </div>;
}
