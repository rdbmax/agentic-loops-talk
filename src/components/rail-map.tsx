"use client";

import { useState } from "react";
import { destinations, type DestinationId } from "@/lib/rail";

export function RailMap({ selected = [], compact = false }: { selected?: DestinationId[]; compact?: boolean }) {
  const [focused, setFocused] = useState<DestinationId | null>(null);
  const detail = destinations.find((destination) => destination.id === focused);
  return (
    <div className={`rail-map ${compact ? "compact" : ""}`}>
      <div className="map-topline"><span>RÉSEAU INTERGALACTIQUE</span><span>TERRE / SECTEUR 01</span></div>
      <svg viewBox="0 0 600 360" role="img" aria-label={`Carte ferroviaire fictive. Trajets proposés : ${selected.map((id) => destinations.find((item) => item.id === id)?.name).join(", ") || "aucun pour le moment"}.`}>
        <rect width="600" height="360" rx="18" fill="#f3f6ff" />
        {destinations.map((destination) => {
          const x = destination.x * 6, y = destination.y * 3.6;
          const chosen = selected.includes(destination.id);
          const path = destination.changes === 0
            ? `M 95 180 Q 140 ${y} ${x} ${y}`
            : `M 95 180 L 258 176 Q ${x - 55} 176 ${x} ${y}`;
          return <path key={destination.id} d={path} className={chosen ? "route active" : "route"} style={chosen ? { stroke: destination.color } : undefined} />;
        })}
        <circle cx="95" cy="180" r="17" fill="#2457f5" stroke="#ffffff" strokeWidth="3" />
        <circle cx="95" cy="180" r="6" fill="#ffffff" />
        <text x="95" y="216" textAnchor="middle" className="station-label">TERRE</text>
        {destinations.map((destination) => {
          const x = destination.x * 6, y = destination.y * 3.6;
          const chosen = selected.includes(destination.id);
          return (
            <g key={destination.id}>
              {chosen && <circle cx={x} cy={y} r="23" fill={destination.color} opacity=".1" className="station-halo" />}
              <circle cx={x} cy={y} r={chosen ? 10 : 6} fill={chosen ? destination.color : "#ffffff"} stroke={destination.color} strokeWidth="2" />
              <text x={x} y={y + 26} textAnchor="middle" className={chosen ? "station-label chosen" : "station-label"}>{destination.name}</text>
            </g>
          );
        })}
      </svg>
      {!compact && (
        <div className="station-picker" aria-label="Explorer les gares">
          {destinations.map((destination) => (
            <button key={destination.id} aria-pressed={focused === destination.id} onClick={() => setFocused(focused === destination.id ? null : destination.id)}>
              {destination.name}
            </button>
          ))}
        </div>
      )}
      {detail && !compact && <div className="station-detail"><strong>{detail.name}</strong><p>{detail.description}</p><small>{detail.line} · {detail.price} crédits A/R · {detail.hours} h</small></div>}
      <div className="map-legend"><span><i /> {selected.length ? "Derniers trajets préparés par l’outil" : "En attente de showItinerary"}</span><span>Carte & horaires fictifs</span></div>
    </div>
  );
}
