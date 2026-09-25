"use client";

import { useState } from "react";
import { RailMap } from "./rail-map";

export function HumanScene({ calendar = false }: { calendar?: boolean }) {
  const [step, setStep] = useState(0);
  const items = calendar ? [
    { label: "La question", title: "On est en retard ?", detail: "Hypothèse : nous sommes déjà sur place.", kind: "question" },
    { label: "Les outils", title: "montre() + calendrier()", detail: "Deux informations indépendantes peuvent être récupérées en parallèle.", kind: "tools" },
    { label: "Les observations", title: "14:07 / rendez-vous à 14:00", detail: "Les outils apportent des faits absents de la question.", kind: "observation" },
    { label: "La réponse", title: "Oui, de 7 minutes.", detail: "La réponse s’appuie maintenant sur des observations.", kind: "answer" },
  ] : [
    { label: "La question", title: "Tu as l’heure ?", detail: "Une demande simple… mais une information qui change.", kind: "question" },
    { label: "L’outil", title: "consulterMontre()", detail: "Décider de consulter une source, plutôt qu’inventer.", kind: "tools" },
    { label: "L’observation", title: "14:07", detail: "L’outil renvoie une information utilisable.", kind: "observation" },
    { label: "La réponse", title: "Il est 14 h 07.", detail: "La source a été consultée. On peut répondre.", kind: "answer" },
  ];
  return (
    <div className="human-scene">
      <div className="conversation-stage">
        <div className="human-person"><span className="avatar">A</span><small>DEMANDE</small></div>
        <div className={`speech-card ${items[step].kind}`} aria-live="polite">
          <span className="eyebrow">{items[step].label}</span><h2>{items[step].title}</h2><p>{items[step].detail}</p>
        </div>
        <div className="human-person"><span className="avatar second">B</span><small>RÉPONSE</small></div>
      </div>
      <div className="scene-track">
        {items.map((item, index) => <button key={item.label} onClick={() => setStep(index)} aria-pressed={step === index}><span>0{index + 1}</span>{" "}{item.label}</button>)}
      </div>
      <p className="footnote">Scène jouée · heure fixe pour l’exemple · analogie, pas modèle du cerveau</p>
    </div>
  );
}

export function Concept({ id }: { id: string }) {
  const [enabled, setEnabled] = useState(false);
  const [phase, setPhase] = useState(0);
  if (id === "contraintes") {
    return <div className="concept panel">
      <span className="panel-label">UNE POLITIQUE DANS LE CODE</span>
      <div className="segmented">{["Chercher", "Vérifier", "Afficher"].map((label, index) => <button key={label} onClick={() => setPhase(index)} aria-pressed={phase === index}>{label}</button>)}</div>
      <div className="tool-stack">{["searchTrains", "checkConnections", "showItinerary"].map((tool, index) => <div key={tool} className={index <= phase ? "unlocked" : ""}><span>{index <= phase ? "✓" : "—"}</span><code>{tool}</code><small>{index <= phase ? "autorisé" : "indisponible"}</small></div>)}</div>
      <p>Un schéma valide ne suffit pas. <strong>Les préconditions métier restent vérifiées dans l’outil.</strong></p>
      <div className="callout">6 steps max · timeout · annulation<br />Une vraie réservation demanderait une confirmation.</div>
    </div>;
  }
  if (id === "contexte") {
    return <div className="concept panel">
      <span className="panel-label">REQUÊTE VERS LE MODÈLE</span>
      <div className="context-stack"><div className="stable">Instructions + outils</div><div>Utilisateur : « Au calme, en train de nuit. »</div><div>Assistant : appels + résultats d’outils</div><div>Assistant : « Aurore ou Pélagia. »</div>{enabled && <div className="fresh">Utilisateur : « Et sans correspondance ? »</div>}</div>
      <button className="secondary-button" onClick={() => setEnabled(!enabled)}>{enabled ? "Revenir au premier tour" : "+ Un nouveau message"}</button>
      <p>Dans cette boucle, <strong>l’application construit le contexte fourni au modèle</strong>. Il n’est pas toujours identique au chat visible.</p>
      <small className="footnote">Schéma simplifié · selon l’API, l’historique est renvoyé ou référencé côté service.</small>
    </div>;
  }
  if (id === "cache") {
    return <div className="concept panel">
      <span className="panel-label">DEUX REQUÊTES, UN PRÉFIXE STABLE</span>
      <div className="cache-request"><small>APPEL A</small><span>Instructions</span><span>Outils</span><i>Message A</i></div>
      <div className={`cache-request ${enabled ? "cache-hit" : ""}`}><small>APPEL B</small><span>Instructions</span><span>Outils</span><i>Message B</i></div>
      <button className="secondary-button" onClick={() => setEnabled(!enabled)}>{enabled ? "Masquer la zone réutilisable" : "Repérer le préfixe réutilisable"}</button>
      <p>{enabled ? "Cette zone est candidate au cache. Seules les métriques du fournisseur prouvent un cache hit." : "La nouvelle question reste traitée. La réponse est toujours générée."}</p>
      <div className="callout">Si le fournisseur le permet · seuil et durée variables<br />Pas une mémoire. Pas une réponse stockée.</div>
    </div>;
  }
  if (id === "compaction") {
    return <div className="concept panel">
      <span className="panel-label">HISTORIQUE ≠ CONTEXTE</span>
      <div className="compact-columns"><div><small>VUE UTILISATEUR</small>{["Un week-end au calme", "Moins de 900 crédits A/R", "En train de nuit", "Aurore ou Pélagia ?", "Sans correspondance"].map((text) => <p key={text}>{text}</p>)}</div><div><small>VUE MODÈLE</small>{enabled ? <><p className="summary">Résumé : calme, train de nuit, budget ≤ 900 crédits A/R. Candidats : Aurore, Pélagia.</p><p>« Sans correspondance »</p></> : <><p>Messages précédents</p><p>Appels + résultats complets</p><p>Réponses précédentes</p><p>« Sans correspondance »</p></>}</div></div>
      <button className="secondary-button" onClick={() => setEnabled(!enabled)}>{enabled ? "Restaurer le contexte illustré" : "Compacter la vue modèle"}</button>
      <p>Le chat ne change pas. <strong>Le résumé peut perdre de l’information.</strong></p><small className="footnote">Illustration préécrite, non appliquée au chat live.</small>
    </div>;
  }
  if (id === "interface") {
    return <div className="concept panel">
      <span className="panel-label">UN OUTIL SANS RECHERCHE MÉTIER</span>
      <RailMap compact selected={enabled ? ["aurore", "pelagia"] : []} />
      <button className="secondary-button" onClick={() => setEnabled(!enabled)}>{enabled ? "Réinitialiser l’illustration" : "Illustrer showItinerary()"}</button>
      <p><code>{'{ destinationIds: ["aurore", "pelagia"] }'}</code></p><p>Commande préparée côté serveur → flux → rendu React. <strong>Pas un acquittement du navigateur.</strong></p>
    </div>;
  }
  if (id === "raisonnement") {
    return <div className="concept panel">
      <span className="panel-label">CE QUE NOUS POUVONS VÉRIFIER</span>
      <div className="truth-card"><span className="good">OBSERVÉ</span><h3>checkConnections → ligne fermée</h3><p>Un appel, des arguments, un résultat et une durée.</p></div>
      <div className="truth-card"><span>EXPLIQUÉ</span><h3>« Je propose un autre trajet. »</h3><p>Une explication de la décision, pas une preuve de son mécanisme interne.</p></div>
      <div className="callout">Une boucle d’outils n’exige ni mode « thinking », ni affichage d’une chaîne de pensée.</div>
    </div>;
  }
  return <div className="concept panel definition">
    <span className="panel-label">LA DÉFINITION À EMPORTER</span>
    <p className="large-copy">Une application qui laisse un modèle <em>choisir des actions</em>, exécute les outils autorisés, puis lui rend leurs résultats pour décider de la suite.</p>
    <div className="callout"><strong>La sortie n’est pas toujours du texte.</strong><br /><code>{'{ tool: "montre", input: {} }'}</code></div>
    <p>Arrêt : réponse finale, attente externe, erreur ou limite explicite.</p>
  </div>;
}
