import React, { useMemo } from "react";
import { motion } from "framer-motion";

// Formação 4-3-3 em coordenadas reais de campo (viewBox 105x68).
// O time da casa defende a meta esquerda e ataca para a direita.
const FORMACAO_HOME = [
  { x: 6, y: 34, n: 1 }, // GK
  { x: 19, y: 12, n: 2 }, { x: 19, y: 26, n: 3 }, { x: 19, y: 42, n: 4 }, { x: 19, y: 56, n: 5 }, // zagueiros
  { x: 42, y: 20, n: 6 }, { x: 42, y: 34, n: 7 }, { x: 42, y: 48, n: 8 }, // meio
  { x: 60, y: 18, n: 9 }, { x: 60, y: 34, n: 10 }, { x: 60, y: 50, n: 11 }, // atacantes
];

function formacaoAway() {
  return FORMACAO_HOME.map((p) => ({ x: 105 - p.x, y: p.y, n: p.n }));
}

export default function CampoFutebol({ minutoJogo, domHome, lances, desafiante, desafiado, corHome, corAway }) {
  const away = useMemo(() => formacaoAway(), []);

  const activeEvent = lances.find((l) => l.minuto === minutoJogo);
  const scoringSide = activeEvent && activeEvent.tipo === "GOL"
    ? activeEvent.clube_autor_id === desafiante.id ? "home" : "away"
    : null;
  const attackingSide = activeEvent && ["GOL", "CHUTE_PERIGOSO", "CONTRA_ATAQUE", "FALTA"].includes(activeEvent.tipo)
    ? activeEvent.clube_autor_id === desafiante.id ? "home" : "away"
    : null;
  const dangerActive = activeEvent && (activeEvent.tipo === "GOL" || activeEvent.tipo === "CHUTE_PERIGOSO");

  const shiftHome = ((domHome - 50) / 50) * 18;
  const t = Date.now();
  const jitterX = (i) => Math.sin(t / 650 + i) * 1.1;
  const jitterY = (i) => Math.cos(t / 730 + i) * 0.7;

  const posHome = FORMACAO_HOME.map((p, i) => {
    let x = p.x + shiftHome + jitterX(i);
    let y = p.y + jitterY(i);
    if (attackingSide === "home" && i >= 8) x = x * 0.4 + 90 * 0.6;
    if (scoringSide === "home" && i >= 8) x = 94;
    return { x, y, n: p.n };
  });
  const posAway = away.map((p, i) => {
    let x = p.x - shiftHome + jitterX(i + 11);
    let y = p.y + jitterY(i + 11);
    if (attackingSide === "away" && i >= 8) x = x * 0.4 + 15 * 0.6;
    if (scoringSide === "away" && i >= 8) x = 11;
    return { x, y, n: p.n };
  });

  let bola;
  if (scoringSide === "home") bola = { x: 100, y: 34 + Math.sin(minutoJogo) * 5 };
  else if (scoringSide === "away") bola = { x: 5, y: 34 + Math.cos(minutoJogo) * 5 };
  else if (attackingSide === "home") bola = { x: 86, y: 32 + Math.sin(minutoJogo) * 7 };
  else if (attackingSide === "away") bola = { x: 19, y: 36 + Math.cos(minutoJogo) * 7 };
  else bola = { x: 52.5 + ((domHome - 50) / 50) * 24, y: 34 + Math.sin(t / 700) * 6 };

  const transition = "all 0.5s ease-in-out";

  return (
    <div
      className="relative w-full aspect-[105/68] rounded-xl overflow-hidden border shadow-inner"
      style={{ background: "repeating-linear-gradient(90deg, #2f8a48 0 10%, #2a7d40 10% 20%)" }}
    >
      <svg viewBox="0 0 105 68" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <filter id="sombraJogador" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0.25" dy="0.4" stdDeviation="0.3" floodOpacity="0.55" />
          </filter>
          <radialGradient id="brilhoBola" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </radialGradient>
        </defs>

        {/* Linhas do campo */}
        <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.4">
          <rect x="2" y="2" width="101" height="64" rx="0.8" />
          <line x1="52.5" y1="2" x2="52.5" y2="66" />
          <circle cx="52.5" cy="34" r="9.15" />
          <circle cx="52.5" cy="34" r="0.7" fill="rgba(255,255,255,0.85)" stroke="none" />
          {/* Escanteios */}
          <path d="M2,4 A2,2 0 0 1 4,2" />
          <path d="M103,4 A2,2 0 0 0 101,2" />
          <path d="M2,64 A2,2 0 0 0 4,66" />
          <path d="M103,64 A2,2 0 0 1 101,66" />
          {/* Grande área esquerda */}
          <rect x="2" y="13.84" width="16.5" height="40.32" />
          <rect x="2" y="24.84" width="5.5" height="18.32" />
          <circle cx="11" cy="34" r="0.6" fill="rgba(255,255,255,0.85)" stroke="none" />
          {/* Grande área direita */}
          <rect x="86.5" y="13.84" width="16.5" height="40.32" />
          <rect x="97.5" y="24.84" width="5.5" height="18.32" />
          <circle cx="94" cy="34" r="0.6" fill="rgba(255,255,255,0.85)" stroke="none" />
          {/* Metas */}
          <line x1="2" y1="30.34" x2="2" y2="37.66" strokeWidth="0.8" />
          <line x1="103" y1="30.34" x2="103" y2="37.66" strokeWidth="0.8" />
        </g>

        {/* Jogadores casa */}
        <g filter="url(#sombraJogador)">
          {posHome.map((p, i) => (
            <g key={"h" + i} style={{ transition }}>
              <circle cx={p.x} cy={p.y} r={2.2} fill={corHome} stroke="#ffffff" strokeWidth="0.5" />
              <text x={p.x} y={p.y + 0.8} textAnchor="middle" fontSize="2.3" fontWeight="700" fill="#ffffff" style={{ pointerEvents: "none" }}>{p.n}</text>
            </g>
          ))}
          {/* Jogadores visitante */}
          {posAway.map((p, i) => (
            <g key={"a" + i} style={{ transition }}>
              <circle cx={p.x} cy={p.y} r={2.2} fill={corAway} stroke="#ffffff" strokeWidth="0.5" />
              <text x={p.x} y={p.y + 0.8} textAnchor="middle" fontSize="2.3" fontWeight="700" fill="#ffffff" style={{ pointerEvents: "none" }}>{p.n}</text>
            </g>
          ))}
        </g>

        {/* Efeito visual na bola em lances de perigo */}
        {dangerActive && (
          <motion.circle
            cx={bola.x}
            cy={bola.y}
            r={2}
            fill="none"
            stroke={scoringSide === "home" || scoringSide === "away" ? "#fbbf24" : "#f59e0b"}
            strokeWidth="0.5"
            animate={{ r: [2, 4.2, 2], opacity: [0.9, 0, 0.9] }}
            transition={{ duration: 0.55, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Bola */}
        <circle cx={bola.x} cy={bola.y} r={1.4} fill="url(#brilhoBola)" stroke="#1f2937" strokeWidth="0.3" style={{ transition }} />
      </svg>
    </div>
  );
}