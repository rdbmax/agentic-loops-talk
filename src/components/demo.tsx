"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { useEffect, useRef, useState } from "react";
import type { DemoMessage, StepTrace } from "@/lib/chat-types";
import { MAX_PROMPT_CHARACTERS } from "@/lib/policy";
import { destinations, suggestedPrompts, type DestinationId } from "@/lib/rail";
import { RailMap } from "./rail-map";

const transport = new DefaultChatTransport<DemoMessage>({ api: "/api/chat" });

export function Demo({ configured }: { configured: boolean }) {
  const [input, setInput] = useState(suggestedPrompts[0]);
  const [steps, setSteps] = useState<StepTrace[]>([]);
  const [notice, setNotice] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat<DemoMessage>({
    transport,
    onData: (part) => {
      if (part.type === "data-step") {
        setSteps((previous) => [...previous.filter((step) => step.number !== part.data.number), part.data].sort((a, b) => a.number - b.number));
      }
      if (part.type === "data-notice") setNotice(part.data.message);
    },
    onFinish: ({ isAbort, isDisconnect }) => {
      if (isAbort || isDisconnect) setNotice("Génération interrompue. Les actions déjà terminées restent visibles ; une interruption ne les annule pas.");
    },
  });
  const busy = status === "submitted" || status === "streaming";
  let selected: DestinationId[] = [];
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "tool-showItinerary" && part.state === "output-available") selected = part.output.destinationIds;
    }
  }
  const latestMessage = messages.at(-1);
  const latestAssistant = latestMessage?.role === "assistant" ? latestMessage : undefined;
  const toolParts = latestAssistant?.parts.filter(isToolUIPart) ?? [];
  const totalInput = steps.reduce((total, step) => total + (step.inputTokens ?? 0), 0);
  const hasUsage = steps.some((step) => step.inputTokens !== undefined);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [messages]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || busy || !configured) return;
    const text = input.trim();
    setInput("");
    setSteps([]);
    setNotice("");
    clearError();
    try {
      await sendMessage({ text });
    } catch {
      setNotice("La demande n’a pas pu être envoyée. Vérifiez la connexion au serveur avant de réessayer.");
    }
  }

  function reset() {
    setMessages([]);
    setSteps([]);
    setNotice("");
    clearError();
    setInput(suggestedPrompts[0]);
  }

  return (
    <div className="demo">
      <div className="demo-status">
        <span><i className={busy ? "status-dot pulsing" : "status-dot"} />{busy ? "Le modèle répond" : configured ? "Configuration présente · connexion non garantie" : "Modèle à configurer"}</span>
        <span>AI SDK 7 · 6 steps max · catalogue fictif</span>
        <button className="text-button" onClick={reset} disabled={busy}>Nouvelle conversation ↗</button>
      </div>
      {!configured && <div className="configuration-notice" role="status"><strong>Le live attend une clé API OpenAI.</strong> Consultez <code>.env.example</code>, renseignez <code>OPENAI_API_KEY</code> dans <code>.env.local</code> et, si besoin, changez <code>DEMO_MODEL_ID</code>, puis redémarrez. Aucune réponse de secours n’est inventée.</div>}
      <div className="demo-grid">
        <section className="chat-panel panel" aria-label="Chat de l’agence">
          <div className="panel-label"><span>01 / LA DEMANDE</span><span>VOIE LACTÉE</span></div>
          <div className="chat-log" role="log" aria-label="Conversation">
            {messages.length === 0 && <div className="chat-empty"><span className="rail-glyph" aria-hidden="true">↟</span><h2>On vous emmène<br />un peu plus loin.</h2><p>Un train de nuit, une fenêtre sur les anneaux de Saturne… Quelle est votre prochaine escale ?</p><small>Univers fictif · aucun billet réservé</small></div>}
            {messages.map((message) => <div className={`chat-message ${message.role}`} key={message.id}><small>{message.role === "user" ? "VOUS" : "CHEF DE GARE"}</small>{message.parts.map((part, index) => {
              if (part.type === "text") return <p key={index}>{part.text}</p>;
              if (isToolUIPart(part)) return <span key={index} className={`tool-chip ${part.state === "output-error" ? "failed" : ""}`}>{part.type.replace("tool-", "")} · {part.state === "output-available" ? "résultat reçu" : part.state === "output-error" ? "erreur" : "en cours"}</span>;
              return null;
            })}</div>)}
            {busy && <div className="working" role="status">Appel en cours<span>…</span></div>}
            <div ref={chatEnd} />
          </div>
          {error && <div className="error-box" role="alert">{error.message}<button className="text-button" onClick={() => { clearError(); setInput(messages.findLast((message) => message.role === "user")?.parts.filter((part) => part.type === "text").map((part) => part.text).join("") || suggestedPrompts[0]); }}>Reprendre la demande dans le champ ↗</button></div>}
          {notice && <div className="notice-box" role="status">{notice}</div>}
          <div className="prompt-chips">{["Le départ", "Sans correspondance", "Sirocco"].map((label, index) => <button key={label} disabled={busy} onClick={() => setInput(suggestedPrompts[index])}>{label}</button>)}</div>
          <form onSubmit={submit}>
            <label htmlFor="mission" className="sr-only">Votre demande de voyage</label>
            <textarea id="mission" value={input} onChange={(event) => setInput(event.target.value)} disabled={busy} maxLength={MAX_PROMPT_CHARACTERS} rows={3} placeholder="Votre prochaine escale…" />
            <div className="composer-footer"><small>{input.length}/{MAX_PROMPT_CHARACTERS}</small>{busy ? <button type="button" className="secondary-button" onClick={() => { void stop(); setNotice("Arrêt demandé. Les actions déjà effectuées ne sont pas annulées."); }}>Arrêter ■</button> : <button className="primary-button" type="submit" disabled={!configured || !input.trim()}>Envoyer ↗</button>}</div>
          </form>
        </section>
        <section className="map-panel panel" aria-label="Carte et trajets">
          <div className="panel-label"><span>02 / L’INTERFACE</span><span>OUTIL UI</span></div>
          <RailMap selected={selected} />
          <div className="journeys">
            {selected.length ? selected.map((id) => {
              const destination = destinations.find((item) => item.id === id)!;
              return <div className="journey" key={id}><div><small>{destination.line}</small><h2>Terre → {destination.name}</h2><p>{destination.hours} h · {destination.changes ? `${destination.changes} correspondance` : "direct"} · {destination.nightTrain ? "train de nuit" : "train de jour"}</p></div><div className="fare">{destination.price}<small>crédits A/R</small></div></div>;
            }) : <div className="map-empty">Les trajets apparaîtront après un appel réussi à <code>showItinerary</code>, pas après la simple mention d’une destination dans le texte.</div>}
          </div>
          <p className="footnote">Prix par personne, hors hébergement · état conservé pendant la navigation, pas après rechargement</p>
        </section>
        <section className="trace-panel panel" aria-label="Journal réel des appels">
          <div className="panel-label"><span>03 / LA TRACE</span><span className="live-tag">RÉELLE</span></div>
          <div className="trace-metrics"><strong>{steps.length}<small>steps</small></strong><strong>{hasUsage ? totalInput.toLocaleString("fr-FR") : "—"}<small>tokens d’entrée cumulés</small></strong></div>
          <div className="trace-scroll">
            {steps.length === 0 && <p className="empty-trace">Aucun appel.<br />Ici, pas de « pensées » simulées : uniquement des événements reçus du serveur.</p>}
            {steps.map((step) => <div className="step-card" key={step.number}><div><strong>STEP {step.number.toString().padStart(2, "0")}</strong><small>{step.state === "running" ? busy ? "en cours" : "interrompue" : `${((step.durationMs ?? 0) / 1000).toFixed(1)} s`}</small></div><p>{step.activeTools.length ? step.activeTools.join(" · ") : "Aucun outil → synthèse"}</p><small>{step.messageCount} messages dans le contexte</small>{step.state === "done" && <small>IN {step.inputTokens ?? "—"} / OUT {step.outputTokens ?? "—"}<br />Cache lu : {step.cacheReadTokens ?? "non fourni"}</small>}</div>)}
            {toolParts.map((part) => <details className="tool-detail" key={part.toolCallId}><summary>{part.type.replace("tool-", "")} <span>{part.state === "output-error" ? "!" : "↗"}</span></summary><small>ARGUMENTS</small><pre>{JSON.stringify(part.input ?? {}, null, 2)}</pre>{part.state === "output-available" && <><small>RÉSULTAT</small><pre>{JSON.stringify(part.output, null, 2)}</pre></>}{part.state === "output-error" && <p className="error-text">{part.errorText}</p>}</details>)}
          </div>
          <small className="footnote">Journal de la dernière demande. Les données d’outils restent dans le chat.</small>
        </section>
      </div>
    </div>
  );
}
