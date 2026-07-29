import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Gauge, Forward, HeartPulse, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EscudoClube from "@/components/clube/EscudoClube";
import CampoFutebol from "@/components/partida/CampoFutebol";

const DURACAO_BASE = 60000; // 60s reais em 1x = 90 min de jogo
const VELOCIDADES = [1, 2, 4];

export default function SimulacaoPartida({ result, onConcluir }) {
  const desafiante = result.desafiante;
  const desafiado = result.desafiado;
  const lances = result.lances_narracao || [];
  const momentum = result.momentum || [];

  const [elapsed, setElapsed] = useState(0);
  const [velocidade, setVelocidade] = useState(1);
  const [finalizado, setFinalizado] = useState(false);
  const lastTsRef = useRef(null);
  const beepedRef = useRef(new Set());

  useEffect(() => {
    lastTsRef.current = null;
    let raf;
    const loop = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setElapsed((prev) => {
        const next = prev + dt * velocidade;
        return next >= DURACAO_BASE ? DURACAO_BASE : next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [velocidade]);

  const minutoJogo = Math.min(90, Math.round((elapsed / DURACAO_BASE) * 90));

  useEffect(() => {
    const m = minutoJogo;
    lances.forEach((l) => {
      if (l.tipo === "GOL" && l.minuto <= m && !beepedRef.current.has(l.minuto + l.clube_autor_id)) {
        beepedRef.current.add(l.minuto + l.clube_autor_id);
        tocarBeep();
      }
    });
    if (m >= 90) setFinalizado(true);
  }, [minutoJogo, lances]);

  const tocarBeep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) { /* silencioso */ }
  };

  // --- Resistência física (stamina) ---
  const taxaPerda = (prep, fisico) => {
    const reducao = Math.min(0.55, (prep || 0) * 0.035 + Math.min(24, fisico || 0) * 0.01);
    return 0.75 * (1 - reducao); // % por minuto de jogo
  };
  const staminaHome = Math.max(0, 100 - taxaPerda(desafiante.comissao_prep_fisico, desafiante.fisico) * minutoJogo);
  const staminaAway = Math.max(0, 100 - taxaPerda(desafiado.comissao_prep_fisico, desafiado.fisico) * minutoJogo);

  const corHome = desafiante.cor_principal || "#3b82f6";
  const corAway = desafiado.cor_principal || "#f43f5e";

  const golHome = lances.filter((l) => l.tipo === "GOL" && l.clube_autor_id === desafiante.id && l.minuto <= minutoJogo).length;
  const golAway = lances.filter((l) => l.tipo === "GOL" && l.clube_autor_id === desafiado.id && l.minuto <= minutoJogo).length;

  // Momentum ao vivo com penalidade de cansaço.
  const bloco = momentum.find((b) => minutoJogo >= b.inicio && minutoJogo <= b.fim) || momentum[momentum.length - 1];
  let domHome = bloco ? bloco.dominancia_pct.home : 50;
  domHome = Math.max(8, Math.min(92, Math.round(domHome + Math.sin(elapsed / 600) * 6)));
  if (staminaHome < 30) domHome = Math.max(5, domHome - 8);
  if (staminaAway < 30) domHome = Math.min(92, domHome + 8);

  const revealed = lances.filter((l) => l.minuto <= minutoJogo).sort((a, b) => b.minuto - a.minuto);

  const pular = () => onConcluir();

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col items-center space-y-4">
      {/* Controle de velocidade + pular */}
      <div className="w-full flex items-center justify-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {VELOCIDADES.map((v) => (
            <button
              key={v}
              onClick={() => setVelocidade(v)}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                velocidade === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}x
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={pular} className="gap-1">
          <Forward className="w-4 h-4" /> Pular
        </Button>
      </div>

      {/* Placar dinâmico */}
      <div className="w-full flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 flex-1">
          <EscudoClube clube={desafiante} size={48} />
          <span className="text-xs font-medium truncate max-w-full text-center">{desafiante.nome_clube}</span>
        </div>
        <div className="flex items-center gap-3 text-4xl font-bold tabular-nums">
          <motion.span key={golHome} initial={{ scale: 1.6 }} animate={{ scale: 1 }} style={{ color: corHome }}>{golHome}</motion.span>
          <span className="text-muted-foreground font-light text-2xl">:</span>
          <motion.span key={golAway} initial={{ scale: 1.6 }} animate={{ scale: 1 }} style={{ color: corAway }}>{golAway}</motion.span>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1">
          <EscudoClube clube={desafiado} size={48} />
          <span className="text-xs font-medium truncate max-w-full text-center">{desafiado.nome_clube}</span>
        </div>
      </div>

      {/* Barras de resistência */}
      <div className="w-full grid grid-cols-2 gap-3">
        <BarraResistencia cor={corHome} nome={desafiante.nome_clube} stamina={staminaHome} />
        <BarraResistencia cor={corAway} nome={desafiado.nome_clube} stamina={staminaAway} align="right" />
      </div>

      {/* Campo 2D */}
      <CampoFutebol
        minutoJogo={minutoJogo}
        domHome={domHome}
        lances={lances}
        desafiante={desafiante}
        desafiado={desafiado}
        corHome={corHome}
        corAway={corAway}
      />

      {/* Relógio + progresso */}
      <div className="w-full text-center">
        <div className="text-2xl font-bold tabular-nums flex items-center justify-center gap-2">
          <Gauge className="w-4 h-4 text-muted-foreground" /> {minutoJogo}'
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${(minutoJogo / 90) * 100}%` }} />
        </div>
      </div>

      {/* Barra de momentum */}
      <div className="w-full">
        <p className="text-xs text-muted-foreground mb-1 text-center">Momentum ao vivo</p>
        <div className="h-3 w-full rounded-full overflow-hidden flex">
          <div style={{ width: `${domHome}%`, background: corHome, transition: "width 0.1s linear" }} />
          <div style={{ width: `${100 - domHome}%`, background: corAway, transition: "width 0.1s linear" }} />
        </div>
        <div className="flex justify-between text-xs mt-0.5">
          <span style={{ color: corHome }}>{domHome}%</span>
          <span style={{ color: corAway }}>{100 - domHome}%</span>
        </div>
      </div>

      {/* Ticker de narração */}
      <Card className="w-full p-0 overflow-hidden">
        <div className="bg-muted px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500" /> Narração ao Vivo
        </div>
        <div className="max-h-[240px] min-h-[200px] overflow-y-auto p-3 space-y-2">
          {revealed.length === 0 && !finalizado && (
            <p className="text-sm text-muted-foreground text-center py-8">A bola está rolando...</p>
          )}
          <AnimatePresence initial={false}>
            {revealed.map((l, i) => {
              const isGoal = l.tipo === "GOL";
              const isLatest = i === 0;
              return (
                <motion.div
                  key={`${l.minuto}-${l.tipo}-${l.clube_autor_id}`}
                  initial={{ opacity: 0, x: -12, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className={`flex gap-2 p-2 rounded-lg text-sm ${
                    isGoal ? "bg-amber-500/15 border border-amber-500/40" : isLatest ? "bg-muted/60" : ""
                  }`}
                >
                  <span className="font-bold tabular-nums shrink-0 text-muted-foreground">{l.minuto}'</span>
                  <span className={isGoal ? "font-semibold" : ""}>{isGoal && "⚽ "}{l.texto_narrativo}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </Card>

      {/* Botão final */}
      <AnimatePresence>
        {finalizado && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Apito final! {desafiante.nome_clube} {result.placar_home} x {result.placar_away} {desafiado.nome_clube}
            </p>
            <Button className="w-full" size="lg" onClick={onConcluir}>Ver Relatório Completo & Insights</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BarraResistencia({ cor, nome, stamina, align = "left" }) {
  const cansado = stamina < 30;
  const corBarra = stamina > 60 ? "#22c55e" : stamina > 30 ? "#eab308" : "#ef4444";
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
      <div className={`flex items-center gap-1 mb-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <HeartPulse className="w-3.5 h-3.5" style={{ color: corBarra }} />
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{nome}</span>
        {cansado && (
          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" /> Cansaço
          </span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${stamina}%`, background: corBarra }} />
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5">{Math.round(stamina)}%</span>
    </div>
  );
}