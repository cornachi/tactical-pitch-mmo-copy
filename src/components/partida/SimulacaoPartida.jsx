import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Gauge, Forward, HeartPulse, AlertTriangle, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EscudoClube from "@/components/clube/EscudoClube";
import CampoFutebol from "@/components/partida/CampoFutebol";
import MomentumLive from "@/components/partida/MomentumLive";

const DURACAO_BASE = 60000; // 60s reais em 1x = 90 min de jogo
const VELOCIDADES = [1, 2, 4];
const POSTURAS = [
  { key: "ULTRA_OFENSIVO", label: "Ultra Ofensivo", desc: "+Pressão ofensiva, mais desgaste", emoji: "🔥" },
  { key: "EQUILIBRADO", label: "Equilibrado", desc: "Postura padrão", emoji: "⚖️" },
  { key: "CONTRA_ATAQUE", label: "Contra-Ataque", desc: "Recuar e castigar em transição", emoji: "🏹" },
];

export default function SimulacaoPartida({ result, onConcluir }) {
  const desafiante = result.desafiante;
  const desafiado = result.desafiado;
  const lances = result.lances_narracao || [];
  const momentum = result.momentum || [];
  const expulsoes = result.expulsoes || [];

  const [elapsed, setElapsed] = useState(0);
  const [velocidade, setVelocidade] = useState(1);
  const [finalizado, setFinalizado] = useState(false);
  const [intervalo, setIntervalo] = useState(false);
  const [postura, setPostura] = useState(null);
  const lastTsRef = useRef(null);
  const beepedRef = useRef(new Set());
  const pausadoRef = useRef(false);
  const intervaloMostradoRef = useRef(false);
  const intervaloTimerRef = useRef(null);
  const narraRef = useRef(null);

  useEffect(() => {
    lastTsRef.current = null;
    let raf;
    const loop = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      if (!pausadoRef.current) {
        setElapsed((prev) => {
          const next = prev + dt * velocidade;
          return next >= DURACAO_BASE ? DURACAO_BASE : next;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [velocidade]);

  const minutoJogo = Math.min(90, Math.round((elapsed / DURACAO_BASE) * 90));

  // Intervalo tático aos 45'
  useEffect(() => {
    if (minutoJogo >= 45 && !intervaloMostradoRef.current) {
      intervaloMostradoRef.current = true;
      pausadoRef.current = true;
      setIntervalo(true);
      intervaloTimerRef.current = setTimeout(() => {
        pausadoRef.current = false;
        setIntervalo(false);
      }, 3000);
    }
    if (minutoJogo >= 90) setFinalizado(true);
  }, [minutoJogo]);

  useEffect(() => {
    const m = minutoJogo;
    lances.forEach((l) => {
      if (l.tipo === "GOL" && l.minuto <= m && !beepedRef.current.has(l.minuto + l.clube_autor_id)) {
        beepedRef.current.add(l.minuto + l.clube_autor_id);
        tocarBeep();
      }
    });
  }, [minutoJogo, lances]);

  // Auto-scroll da narração para o último lance (topo)
  useEffect(() => {
    if (narraRef.current) narraRef.current.scrollTop = 0;
  }, [minutoJogo]);

  useEffect(() => () => { if (intervaloTimerRef.current) clearTimeout(intervaloTimerRef.current); }, []);

  const escolherPostura = (p) => {
    setPostura(p);
    if (intervaloTimerRef.current) clearTimeout(intervaloTimerRef.current);
    pausadoRef.current = false;
    setIntervalo(false);
  };

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
    return 0.75 * (1 - reducao);
  };
  const tH = taxaPerda(desafiante.comissao_prep_fisico, desafiante.fisico);
  const tA = taxaPerda(desafiado.comissao_prep_fisico, desafiado.fisico);
  const drainMul = minutoJogo > 45
    ? (postura === "ULTRA_OFENSIVO" ? 1.25 : postura === "CONTRA_ATAQUE" ? 0.85 : 1)
    : 1;
  const perdaHome = tH * Math.min(minutoJogo, 45) + (minutoJogo > 45 ? tH * (minutoJogo - 45) * drainMul : 0);
  const perdaAway = tA * Math.min(minutoJogo, 45) + (minutoJogo > 45 ? tA * (minutoJogo - 45) * drainMul : 0);

  const redCardHome = expulsoes.some((e) => e.lado === "home" && e.minuto <= minutoJogo);
  const redCardAway = expulsoes.some((e) => e.lado === "away" && e.minuto <= minutoJogo);

  let staminaHome = Math.max(0, 100 - perdaHome);
  let staminaAway = Math.max(0, 100 - perdaAway);
  if (redCardHome) staminaHome *= 0.8;
  if (redCardAway) staminaAway *= 0.8;

  const corHome = desafiante.cor_principal || "#3b82f6";
  const corAway = desafiado.cor_principal || "#f43f5e";

  const golHome = lances.filter((l) => l.tipo === "GOL" && l.clube_autor_id === desafiante.id && l.minuto <= minutoJogo).length;
  const golAway = lances.filter((l) => l.tipo === "GOL" && l.clube_autor_id === desafiado.id && l.minuto <= minutoJogo).length;

  // Momentum ao vivo com postura (2º tempo) e penalidade de expulsão (-20%).
  const bloco = momentum.find((b) => minutoJogo >= b.inicio && minutoJogo <= b.fim) || momentum[momentum.length - 1];
  let baseHome = bloco ? bloco.dominancia_pct.home : 50;
  if (minutoJogo > 45 && postura === "ULTRA_OFENSIVO") baseHome += 12;
  if (minutoJogo > 45 && postura === "CONTRA_ATAQUE") baseHome -= 6;
  baseHome = Math.max(5, Math.min(95, Math.round(baseHome + Math.sin(elapsed / 600) * 6)));
  const effHome = redCardHome ? 0.8 : 1;
  const effAway = redCardAway ? 0.8 : 1;
  let domHome = (baseHome * effHome) / (baseHome * effHome + (100 - baseHome) * effAway) * 100;
  domHome = Math.max(5, Math.min(95, Math.round(domHome)));
  if (staminaHome < 30) domHome = Math.max(5, domHome - 8);
  if (staminaAway < 30) domHome = Math.min(92, domHome + 8);

  const revealed = lances.filter((l) => l.minuto <= minutoJogo).sort((a, b) => b.minuto - a.minuto);
  const pular = () => onConcluir();

  const iconForLance = (l) => {
    if (l.tipo === "GOL") return "⚽ ";
    if (l.tipo === "CARTAO_VERMELHO") return "🟥 ";
    if (l.tipo === "CARTAO_AMARELO") return "🟨 ";
    return "";
  };

  const posturaLabel = postura ? POSTURAS.find((p) => p.key === postura)?.label : null;

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {VELOCIDADES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVelocidade(v)}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition ${velocidade === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1 flex-1">
              <EscudoClube clube={desafiante} size={44} />
              <span className="text-xs font-medium truncate max-w-full text-center">{desafiante.nome_clube}</span>
            </div>
            <div className="flex items-center gap-3 text-4xl font-bold tabular-nums">
              <motion.span key={golHome} initial={{ scale: 1.6 }} animate={{ scale: 1 }} style={{ color: corHome }}>{Number(golHome)}</motion.span>
              <span className="text-muted-foreground font-light text-2xl">:</span>
              <motion.span key={golAway} initial={{ scale: 1.6 }} animate={{ scale: 1 }} style={{ color: corAway }}>{Number(golAway)}</motion.span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <EscudoClube clube={desafiado} size={44} />
              <span className="text-xs font-medium truncate max-w-full text-center">{desafiado.nome_clube}</span>
            </div>
          </div>

          {/* Barras de resistência */}
          <div className="grid grid-cols-2 gap-3">
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
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums flex items-center justify-center gap-2 flex-wrap">
              <span className="flex items-center gap-1"><Gauge className="w-4 h-4 text-muted-foreground" /> {minutoJogo}'</span>
              {postura && minutoJogo > 45 && (
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{posturaLabel}</span>
              )}
              {(redCardHome || redCardAway) && (
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Expulsão</span>
              )}
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
              <div className="h-full bg-primary transition-all duration-100" style={{ width: `${(minutoJogo / 90) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-3">
          <MomentumLive momentum={momentum} minutoJogo={minutoJogo} corHome={corHome} corAway={corAway} domHome={domHome} />

          {/* Ticker de narração */}
          <Card className="p-0 overflow-hidden flex flex-col max-h-[300px] lg:max-h-[55vh]">
            <div className="bg-muted px-3 py-2 text-xs font-semibold flex items-center gap-2 shrink-0">
              <Activity className="w-4 h-4 text-rose-500" /> Narração ao Vivo
            </div>
            <div ref={narraRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
              {revealed.length === 0 && !finalizado && (
                <p className="text-sm text-muted-foreground text-center py-8">A bola está rolando...</p>
              )}
              <AnimatePresence initial={false}>
                {revealed.map((l, i) => {
                  const isGoal = l.tipo === "GOL";
                  const isCard = l.tipo === "CARTAO_VERMELHO" || l.tipo === "CARTAO_AMARELO";
                  const isLatest = i === 0;
                  return (
                    <motion.div
                      key={`${l.minuto}-${l.tipo}-${l.clube_autor_id}-${i}`}
                      initial={{ opacity: 0, x: -12, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      className={`flex gap-2 p-2 rounded-lg text-sm ${
                        isGoal ? "bg-amber-500/15 border border-amber-500/40" : isCard ? "bg-rose-500/10 border border-rose-500/30" : isLatest ? "bg-muted/60" : ""
                      }`}
                    >
                      <span className="font-bold tabular-nums shrink-0 text-muted-foreground">{l.minuto}'</span>
                      <span className={isGoal ? "font-semibold" : isCard ? "font-medium" : ""}>{iconForLance(l)}{l.texto_narrativo}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>

      {/* Overlay de Intervalo Tático */}
      <AnimatePresence>
        {intervalo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="text-center space-y-1">
                <Pause className="w-10 h-10 mx-auto text-primary" />
                <h2 className="text-xl font-bold">⏸️ Intervalo de Jogo</h2>
                <p className="text-sm text-muted-foreground">Ajuste a postura tática para o 2º tempo:</p>
              </div>
              <div className="space-y-2">
                {POSTURAS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => escolherPostura(p.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${postura === p.key ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="font-semibold">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">Retomando automaticamente em 3s...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão final */}
      <AnimatePresence>
        {finalizado && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto mt-4 space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Apito final! {desafiante.nome_clube} {Number(result.placar_home)} x {Number(result.placar_away)} {desafiado.nome_clube}
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