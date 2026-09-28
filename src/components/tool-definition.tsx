"use client";

import { useState } from "react";

const parts = [
  {
    id: "name", label: "Nom", field: "montre", scope: "POUR LE MODÈLE",
    explanation: "La clé dans tools donne le nom que le modèle peut appeler. Ajouter montre à cet objet rend l’outil disponible à l’agent.",
    exampleLabel: "NOM DANS L’APPEL", example: '"montre"',
  },
  {
    id: "description", label: "Description", field: "description", scope: "POUR LE MODÈLE",
    explanation: "Elle explique ce que fait l’outil et aide le modèle à décider quand l’utiliser. Précisez sa capacité et ses limites.",
    exampleLabel: "CAPACITÉ ANNONCÉE", example: '"Lit l’heure dans un fuseau horaire."',
  },
  {
    id: "input", label: "Schéma d’entrée", field: "inputSchema", scope: "DU MODÈLE VERS LE CODE",
    explanation: "Il décrit les arguments à fournir. Ici, fuseau est obligatoire et accepte deux valeurs. Le SDK valide les arguments proposés avant l’exécution.",
    exampleLabel: "EXEMPLE D’ARGUMENTS", example: '{ "fuseau": "Europe/Paris" }',
  },
  {
    id: "output", label: "Schéma de sortie", field: "outputSchema", scope: "DU CODE VERS LE MODÈLE",
    explanation: "Il décrit la forme du résultat : un objet avec une heure de type chaîne. outputSchema sert au typage ; sortie.parse(...) vérifie le résultat à l’exécution.",
    exampleLabel: "EXEMPLE DE RÉSULTAT", example: '{ "heure": "14:07" }',
  },
  {
    id: "execute", label: "Fonction d’exécution", field: "execute", scope: "DANS VOTRE APPLICATION",
    explanation: "Elle reçoit les arguments validés, lit l’horloge dans le fuseau demandé et retourne le résultat. C’est ici que votre code réalise l’action.",
    exampleLabel: "DE L’ENTRÉE AU RÉSULTAT", example: 'fuseau → horloge → { heure }',
  },
] as const;

const declaration: { text: string; part?: typeof parts[number]["id"]; relatedPart?: typeof parts[number]["id"] }[] = [
  { text: 'import { tool, ToolLoopAgent } from "ai";' },
  { text: 'import { z } from "zod";' },
  { text: 'const sortie = z.object({ heure: z.string() });', part: "output" },
  { text: 'const agent = new ToolLoopAgent({' },
  { text: '  model: selectedModel,' },
  { text: '  tools: {', part: "name" },
  { text: '    montre: tool({', part: "name" },
  { text: '      description: "Lit l’heure dans un fuseau horaire.",', part: "description" },
  { text: '      inputSchema: z.object({', part: "input" },
  { text: '        fuseau: z.enum(["Europe/Paris", "UTC"]),', part: "input" },
  { text: '      }),', part: "input" },
  { text: '      outputSchema: sortie,', part: "output" },
  { text: '      execute: async ({ fuseau }) => {', part: "execute" },
  { text: '        const heure = new Date().toLocaleTimeString("fr-FR", {', part: "execute" },
  { text: '          timeZone: fuseau, hour: "2-digit", minute: "2-digit",', part: "execute" },
  { text: '        });', part: "execute" },
  { text: '        return sortie.parse({ heure });', part: "output", relatedPart: "execute" },
  { text: '      },', part: "execute" },
  { text: '    }),' },
  { text: '  },' },
  { text: '});' },
];

export function ToolDefinition() {
  const [selected, setSelected] = useState(0);
  const part = parts[selected];

  return <div className="tool-intro">
    <section className="tool-anatomy panel" aria-label="Les cinq parties d’un outil">
      <p className="tool-definition-copy">Un outil est une fonction que votre application met à disposition de l’agent.</p>
      <div className="tool-part-picker" role="group" aria-label="Explorer la déclaration">
        {parts.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} aria-pressed={selected === index} aria-controls="tool-part-detail tool-declaration">
          <span className="tool-part-number">0{index + 1}</span><span>{item.label}</span><code>{item.field}</code>
        </button>)}
      </div>
      <div id="tool-part-detail" className="tool-part-detail" aria-live="polite" aria-atomic="true">
        <span className="panel-label">{part.scope}</span>
        <p>{part.explanation}</p>
        <div className="tool-part-example"><small>{part.exampleLabel}</small><code>{part.example}</code></div>
      </div>
    </section>
    <section className="tool-declaration code-window" aria-label="Déclaration complète de l’outil montre">
      <div className="code-title"><span><i /><i /><i /></span><code>montre.ts</code><span>AI SDK + Zod</span></div>
      <pre id="tool-declaration"><code>{declaration.map((line, index) => <span key={index} className={line.part === part.id || line.relatedPart === part.id ? "tool-code-highlight" : undefined}>{line.text}{index < declaration.length - 1 ? "\n" : ""}</span>)}</code></pre>
      <div className="tool-code-footer"><span>selectedModel : le modèle choisi</span><a href="https://ai-sdk.dev/docs/reference/ai-sdk-core/tool" target="_blank" rel="noreferrer">Documentation tool() ↗</a></div>
    </section>
  </div>;
}
