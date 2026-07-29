import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENTOS = [
  "Troca de passes no meio-campo",
  "Lançamento profundo para o ataque",
  "Falta perigosa à entrada da área",
  "Escanteio para o mandante",
  "Contra-ataque em velocidade",
  "Defesa decisiva do goleiro",
  "Chute de fora da área",
  "Cruzamento na área",
  "Interceptação na linha de meio",
  "Pressão alta recupera a bola",
  "Bola na trave!",
  "Tabela rápida pelas pontas",
];

export default function SimulacaoPartida({ nomeHome, nomeAway, onConcluir }) {
  const [minuto, setMinuto] = useState(0);
  const [evento, setEvento] = useState("A bola está rolando...");
  const idx = useRef(0);

  useEffect(() => {
    const DURACAO = 10000; // 10 segundos de simulação
    const inicio = Date.now();
    const ev = setInterval(() => {
      idx.current = (idx.current + 1) % EVENTOS.length;
      setEvento(EVENTOS[idx.current]);
    }, 1100);
    const clock = setInterval(() => {
      const p = Math.min(1, (Date.now() - inicio) / DURACAO);
      setMinuto(Math.round(p * 90));
      if (p >= 1) {
        clearInterval(clock);
        clearInterval(ev);
        setEvento("Apito final!");
        setTimeout(onConcluir, 500);
      }
    }, 80);
    return () => { clearInterval(clock); clearInterval(ev); };
  }, [onConcluir]);

  const progresso = Math.min(100, (minuto / 90) * 100);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground uppercase tracking-widest"
      >
        Simulando partida
      </motion.div>

      {/* Campo */}
      <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-2xl border border-emerald-900/40">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 to-emerald-700" />
        <div className="absolute inset-0">
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40 -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 border-2 border-white/40 border-l-0 rounded-r" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 border-2 border-white/40 border-r-0 rounded-l" />
        </div>
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-white shadow-lg"
          animate={{
            x: ["8%", "82%", "18%", "68%", "14%", "78%", "38%"],
            y: ["68%", "22%", "58%", "32%", "72%", "28%", "52%"],
          }}
          transition={{ duration: 10, times: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1], ease: "linear" }}
          style={{ left: 0, top: 0 }}
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between text-xs font-semibold text-white drop-shadow">
          <span className="truncate max-w-[45%]">{nomeHome}</span>
          <span className="truncate max-w-[45%] text-right">{nomeAway}</span>
        </div>
      </div>

      {/* Relógio da partida */}
      <div className="text-5xl font-bold tabular-nums">{minuto}'</div>

      <div className="h-2 w-full max-w-md rounded-full overflow-hidden bg-muted">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progresso}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={evento}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm text-muted-foreground italic h-5"
        >
          {evento}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}