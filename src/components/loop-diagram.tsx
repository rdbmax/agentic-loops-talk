"use client";

import { useState } from "react";

const nodes = [
  { title: "Contexte", sub: "messages + outils", x: 17, y: 23 },
  { title: "Modèle", sub: "génération", x: 50, y: 23 },
  { title: "Tool call", sub: "nom + arguments", x: 83, y: 23 },
  { title: "Application", sub: "valide & exécute", x: 83, y: 76 },
  { title: "Observation", sub: "résultat ou erreur", x: 50, y: 76 },
  { title: "Réinjection", sub: "enrichit le contexte", x: 17, y: 76 },
];
const captions = [
  "Le code assemble les instructions, les messages et les outils autorisés.",
  "Le modèle produit une réponse ou propose un ou plusieurs appels d’outils.",
  "Un appel est une donnée structurée. Ce n’est pas une fonction déjà exécutée.",
  "L’application vérifie le schéma, les permissions et les préconditions métier.",
  "Le résultat réel — y compris un échec — devient une nouvelle observation.",
  "Le résultat rejoint le contexte du prochain appel. La boucle peut continuer.",
];
const features: Record<string, string> = {
  contraintes: "POLITIQUE → outils autorisés à chaque step",
  contexte: "CONTEXTE → reconstruit pour chaque appel",
  cache: "CACHE → réutilisation possible du préfixe",
  compaction: "COMPACTION → une vue dérivée du contexte",
  interface: "UI → une commande typée vers React",
  raisonnement: "OBSERVABILITÉ → événements, pas pensées",
};

export function LoopDiagram({ feature = "boucle" }: { feature?: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="diagram panel">
      <div className="panel-label"><span>LE MÊME MOTEUR</span><span className="tag">1 tour ≠ 1 appel</span></div>
      <div className="loop-canvas">
        <svg viewBox="0 0 600 330" preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id={`arrow-${feature}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#8498bb" /></marker></defs>
          {["M 168 76 H 228", "M 366 76 H 431", "M 498 111 V 211", "M 431 251 H 370", "M 233 251 H 170", "M 102 212 V 115"].map((path) => <path key={path} d={path} className="loop-path" markerEnd={`url(#arrow-${feature})`} />)}
          <path d="M 300 111 V 149" className="loop-branch" markerEnd={`url(#arrow-${feature})`} />
        </svg>
        {nodes.map((node, index) => (
          <button key={node.title} className={`loop-node ${active === index ? "active" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setActive(index)} aria-pressed={active === index}>
            <span className="node-number">0{index + 1}</span><strong>{node.title}</strong><small>{node.sub}</small>
          </button>
        ))}
        <div className="final-node">↳ réponse finale <span>→ utilisateur</span></div>
      </div>
      {features[feature] && <div className="feature-ribbon">{features[feature]}</div>}
      <div className="diagram-caption" aria-live="polite"><span>0{active + 1}</span><p>{captions[active]}</p></div>
      <button className="text-button" onClick={() => setActive((active + 1) % nodes.length)}>Étape suivante <span>↗</span></button>
    </div>
  );
}
