import React from "react";
import { motion } from "framer-motion";
import { Coins, Trophy, Shield, Swords, Activity, BarChart3, ListOrdered } from "lucide-react";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";
import PlacarAnimado from "@/components/partida/PlacarAnimado";
import BarraDominancia from "@/components/partida/BarraDominancia";
import InsightsTreinador from "@/components/partida/InsightsTreinador";
import MomentumTab from "@/components/partida/MomentumTab";

const ICONE_LANCE = {
  GOL: "⚽",
  CARTAO_AMARELO: "🟨",
  CARTAO_VERMELHO: "🟥",
  CARTAO: "🟨",
  FALTA: "🤕",
  CHUTE_PERIGOSO: "🎯",
  DEFESA: "🧤",
  CONTRA_ATAQUE: "⚡",
};

function BarraAtributo({ label, home, away, nomeHome, nomeAway }) {
  const total = Math.max(1, home + away);
  const pctHome = Math.round((home / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{nomeHome}: <strong className="text-foreground">{home}</strong></span>
        <span>{label}</span>
        <span>{nomeAway}: <strong className="text-foreground">{away}</strong></span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        <div className="bg-blue-500" style={{ width: `${pctHome}%` }} />
        <div className="bg-rose-500 flex-1" />
      </div>
    </div>
  );
}

export default function RelatorioPartida({ partida, clubeHome, clubeAway, meuClubeId }) {
  const ins = partida.insights || {};
  const momentum = ins.momentum || [];
  const lances = ins.lances_narracao || [];
  const nomeHome = clubeHome.nome_clube;
  const nomeAway = clubeAway.nome_clube;
  const ph = partida.placar_home || 0;
  const pa = partida.placar_away || 0;
  const empate = ph === pa;
  const vencedorHome = ph > pa;
  const vencedorAway = pa > ph;
  const viewerSide = meuClubeId === clubeHome.id ? "home" : "away";
  const venceu = (viewerSide === "home" && vencedorHome) || (viewerSide === "away" && vencedorAway);
  const aposta = partida.aposta_moedas || 0;
  const moedasViewer = empate ? 0 : venceu ? aposta : -aposta;

  // Estatísticas agregadas
  const posseHome = momentum.length
    ? Math.round(momentum.reduce((s, b) => s + (b.posse_pct?.home || 0), 0) / momentum.length)
    : 0;
  const chutesHome = momentum.reduce((s, b) => s + (b.chutes?.home || 0), 0);
  const chutesAway = momentum.reduce((s, b) => s + (b.chutes?.away || 0), 0);
  const tiposFalta = ["FALTA", "CARTAO", "CARTAO_AMARELO", "CARTAO_VERMELHO"];
  const faltasHome = lances.filter((l) => l.clube_autor_id === clubeHome.id && tiposFalta.includes(l.tipo)).length;
  const faltasAway = lances.filter((l) => l.clube_autor_id === clubeAway.id && tiposFalta.includes(l.tipo)).length;

  // Stamina final (proxy: queda de dominância do 1º ao último bloco)
  const d0 = momentum[0]?.dominancia_pct || { home: 50, away: 50 };
  const dN = momentum[momentum.length - 1]?.dominancia_pct || d0;
  const staminaHome = Math.max(40, Math.min(95, 100 - Math.max(0, d0.home - dN.home) * 3));
  const staminaAway = Math.max(40, Math.min(95, 100 - Math.max(0, d0.away - dN.away) * 3));

  const atkHome = ins.atkHome || 0, atkAway = ins.atkAway || 0;
  const defHome = ins.defHome || 0, defAway = ins.defAway || 0;

  let analise = "Partida equilibrada, decidida nos detalhes.";
  if (!empate) {
    const winNome = vencedorHome ? nomeHome : nomeAway;
    const winAtk = vencedorHome ? atkHome : atkAway;
    const loseDef = vencedorHome ? defAway : defHome;
    const winDef = vencedorHome ? defHome : defAway;
    const loseAtk = vencedorHome ? atkAway : atkHome;
    if (winAtk > loseDef * 1.15) analise = `O ataque do ${winNome} superou a defesa adversária e decidiu a partida.`;
    else if (winDef > loseAtk * 1.1) analise = `A defesa do ${winNome} neutralizou o ataque rival e garantiu o resultado.`;
    else analise = `Vitória do ${winNome} construída no equilíbrio entre ataque e defesa.`;
  }

  const titulo = empate ? "Empate" : venceu ? "Vitória" : "Derrota";
  const corTitulo = empate ? "text-muted-foreground" : venceu ? "text-emerald-600" : "text-rose-600";
  const vencedorClube = vencedorHome ? clubeHome : vencedorAway ? clubeAway : null;

  const stats = [
    { label: "Posse de bola %", home: posseHome, away: 100 - posseHome },
    { label: "Chutes a gol", home: chutesHome, away: chutesAway },
    { label: "Faltas", home: faltasHome, away: faltasAway },
    { label: "Stamina final (estimado)", home: staminaHome, away: staminaAway, pct: true },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeecalho: placar + vencedor + pote all-in */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Relatório de Desafio</p>
            <h1 className={`text-3xl font-bold ${corTitulo}`}>{titulo}</h1>
            {vencedorClube && (
              <p className="text-sm mt-1 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> Campeão do duelo: <strong>{vencedorClube.nome_clube}</strong>
              </p>
            )}
          </div>
          <PlacarAnimado home={ph} away={pa} nomeHome={nomeHome} nomeAway={nomeAway} clubeHome={clubeHome} clubeAway={clubeAway} />
          <div className="flex justify-center gap-6 text-sm text-muted-foreground border-t pt-3">
            <span>xG: <strong className="text-foreground">{partida.xg_home}</strong> - <strong className="text-foreground">{partida.xg_away}</strong></span>
          </div>
          {/* Destaque do Pote All-In */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
            <Coins className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-muted-foreground">Pote All-In:</span>
            <span className={`text-lg font-bold ${moedasViewer >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {moedasViewer >= 0 ? "+" : ""}{moedasViewer.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-muted-foreground">moedas {venceu ? "ganhas" : empate ? "devolvidas" : "perdidas"}</span>
          </div>
        </Card>
      </motion.div>

      {/* Lances principais */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><ListOrdered className="w-5 h-5 text-blue-500" /> Lances Principais</h2>
        {lances.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem lances registrados.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto selectable-content">
            {lances.map((l, i) => {
              const ehHome = l.clube_autor_id === clubeHome.id;
              return (
                <div key={i} className="flex items-start gap-2 text-sm py-1 border-b last:border-0">
                  <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">{l.minuto}'</span>
                  <span className="text-base shrink-0">{ICONE_LANCE[l.tipo] || "•"}</span>
                  <span className={`shrink-0 ${ehHome ? "text-blue-600" : "text-rose-600"}`}>{ehHome ? nomeHome : nomeAway}</span>
                  <span className="text-muted-foreground">{l.texto_narrativo?.replace(/^Aos \d+' - /, "")}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Estatisticas comparativas */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-violet-500" /> Estatísticas Comparativas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="text-left py-2">Comparativo</th>
                <th className="text-right">{nomeHome}</th>
                <th className="text-right">{nomeAway}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.label} className="border-t">
                  <td className="py-2 font-medium">{s.label}</td>
                  <td className="text-right">{s.pct ? `${s.home}%` : s.home}</td>
                  <td className="text-right">{s.pct ? `${s.away}%` : s.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 pt-2">
          <BarraDominancia domHome={partida.dominancia_home ?? ins.dominancia_home} domAway={100 - (partida.dominancia_home ?? ins.dominancia_home ?? 50)} nomeHome={nomeHome} nomeAway={nomeAway} />
        </div>
      </Card>

      {/* Desempenho dos atributos */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Swords className="w-5 h-5 text-rose-500" /> Desempenho dos Atributos</h2>
        <div className="space-y-3">
          <BarraAtributo label="Ataque" home={atkHome} away={atkAway} nomeHome={nomeHome} nomeAway={nomeAway} />
          <BarraAtributo label="Defesa" home={defHome} away={defAway} nomeHome={nomeHome} nomeAway={nomeAway} />
        </div>
        <div className="flex gap-2 p-3 rounded-lg bg-card border">
          <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm selectable-content">{analise}</p>
        </div>
      </Card>

      {/* Insights do treinador */}
      <div className="space-y-3 selectable-content">
        <h2 className="font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-amber-500" /> Insights do Treinador</h2>
        <InsightsTreinador insights={ins.insights || []} />
      </div>

      {/* Momentum detalhado */}
      {momentum.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Momentum & Stats 15'</h2>
          <MomentumTab momentum={momentum} nomeHome={nomeHome} nomeAway={nomeAway} />
        </Card>
      )}
    </div>
  );
}