import React, { useMemo } from "react";

// Formação 4-3-3 em coordenadas percentuais (x: 0=esquerda, 100=direita; y: 0=topo, 100=base).
// O time da casa defende a meta esquerda e ataca para a direita.
const FORMACAO_HOME = [
  { x: 6, y: 50 }, // GK
  { x: 20, y: 18 }, { x: 20, y: 39 }, { x: 20, y: 61 }, { x: 20, y: 82 }, // zagueiros
  { x: 37, y: 30 }, { x: 37, y: 50 }, { x: 37, y: 70 }, // meio
  { x: 53, y: 28 }, { x: 53, y: 50 }, { x: 53, y: 72 }, // atacantes
];

function formacaoAway() {
  return FORMACAO_HOME.map((p) => ({ x: 100 - p.x, y: p.y }));
}

export default function CampoFutebol({ minutoJogo, domHome, lances, desafiante, desafiado, corHome, corAway }) {
  const away = useMemo(() => formacaoAway(), []);

  const activeEvent = lances.find((l) => l.minuto === minutoJogo);
  const scoringSide =
    activeEvent && activeEvent.tipo === "GOL"
      ? activeEvent.clube_autor_id === desafiante.id ? "home" : "away"
      : null;
  const attackingSide =
    activeEvent && ["GOL", "CHUTE_PERIGOSO", "CONTRA_ATAQUE", "FALTA"].includes(activeEvent.tipo)
      ? activeEvent.clube_autor_id === desafiante.id ? "home" : "away"
      : null;

  const shiftHome = ((domHome - 50) / 50) * 16;
  const t = Date.now();
  const jitter = (i) => Math.sin(t / 600 + i) * 1.1;
  const jitterY = (i) => Math.cos(t / 700 + i) * 0.7;

  const posHome = FORMACAO_HOME.map((p, i) => {
    let x = p.x + shiftHome + jitter(i);
    let y = p.y + jitterY(i);
    if (attackingSide === "home" && i >= 8) x = x * 0.4 + 86 * 0.6;
    if (scoringSide === "home" && i >= 8) x = 90;
    return { x, y };
  });
  const posAway = away.map((p, i) => {
    let x = p.x - shiftHome + jitter(i + 11);
    let y = p.y + jitterY(i + 11);
    if (attackingSide === "away" && i >= 8) x = x * 0.4 + 14 * 0.6;
    if (scoringSide === "away" && i >= 8) x = 10;
    return { x, y };
  });

  let bola;
  if (scoringSide === "home") bola = { x: 95, y: 50 + Math.sin(minutoJogo) * 6 };
  else if (scoringSide === "away") bola = { x: 5, y: 50 + Math.cos(minutoJogo) * 6 };
  else if (attackingSide === "home") bola = { x: 82, y: 48 + Math.sin(minutoJogo) * 8 };
  else if (attackingSide === "away") bola = { x: 18, y: 52 + Math.cos(minutoJogo) * 8 };
  else bola = { x: 50 + ((domHome - 50) / 50) * 22, y: 50 + Math.sin(t / 700) * 7 };

  return (
    <div
      className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border shadow-inner"
      style={{
        background:
          "repeating-linear-gradient(90deg,#15803d 0 8.33%,#16a34a 8.33% 16.66%)",
      }}
    >
      <svg viewBox="0 0 100 64" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <g fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="0.5">
          <rect x="2" y="2" width="96" height="60" rx="1" />
          <line x1="50" y1="2" x2="50" y2="62" />
          <circle cx="50" cy="32" r="8" />
          <circle cx="50" cy="32" r="0.8" fill="rgba(255,255,255,0.78)" stroke="none" />
          <rect x="2" y="14" width="14" height="36" />
          <rect x="2" y="22" width="6" height="20" />
          <rect x="84" y="14" width="14" height="36" />
          <rect x="92" y="22" width="6" height="20" />
        </g>
        {posHome.map((p, i) => (
          <circle key={"h" + i} cx={p.x} cy={p.y} r={1.7} fill={corHome} stroke="rgba(255,255,255,0.95)" strokeWidth="0.3"
            style={{ transition: "cx 0.4s linear, cy 0.4s linear" }} />
        ))}
        {posAway.map((p, i) => (
          <circle key={"a" + i} cx={p.x} cy={p.y} r={1.7} fill={corAway} stroke="rgba(255,255,255,0.95)" strokeWidth="0.3"
            style={{ transition: "cx 0.4s linear, cy 0.4s linear" }} />
        ))}
        <circle cx={bola.x} cy={bola.y} r={1.3} fill="#fff" stroke="#000" strokeWidth="0.3"
          style={{ transition: "cx 0.35s linear, cy 0.35s linear" }} />
      </svg>
    </div>
  );
}