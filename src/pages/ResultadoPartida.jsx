import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Coins, Trophy, Activity, ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PlacarAnimado from "@/components/partida/PlacarAnimado";
import BarraDominancia from "@/components/partida/BarraDominancia";
import InsightsTreinador from "@/components/partida/InsightsTreinador";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MomentumTab from "@/components/partida/MomentumTab";

export default function ResultadoPartida() {
  const location = useLocation();
  const navigate = useNavigate();
  const r = location.state?.result;

  if (!r || !r.desafiante) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Nenhuma partida para exibir.</p>
        <Button onClick={() => navigate("/")}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  const viewerSide = r.viewer_side || "home";
  const empate = r.vencedor === "empate";
  const venceu = !empate && r.vencedor === viewerSide;
  const titulo = empate ? "Empate!" : venceu ? "Vitória!" : "Derrota";
  const corTitulo = empate ? "text-muted-foreground" : venceu ? "text-emerald-600" : "text-rose-600";
  const moedasViewer = r.viewer_moedas ?? r.moedas_ganhas;
  const eloViewer = r.viewer_elo ?? r.novo_elo_desafiante;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {r.tipo_partida === "DESAFIO" ? "Partida de Desafio" : "Matchmaking"}
          </p>
          <h1 className={`text-3xl font-bold ${corTitulo}`}>{titulo}</h1>
        </Card>
      </motion.div>

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="resumo">Resumo Geral</TabsTrigger>
          <TabsTrigger value="momentum">Momentum & Stats 15'</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo" className="space-y-6 mt-4">
          <Card className="p-4">
        <PlacarAnimado
          home={r.placar_home}
          away={r.placar_away}
          nomeHome={r.desafiante.nome_clube}
          nomeAway={r.desafiado.nome_clube}
          clubeHome={r.desafiante}
          clubeAway={r.desafiado}
        />
        <div className="flex justify-center gap-6 text-sm text-muted-foreground border-t pt-3">
          <span>xG: <strong className="text-foreground">{r.xg_home}</strong> - <strong className="text-foreground">{r.xg_away}</strong></span>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Dominância Tática</h2>
        <BarraDominancia
          domHome={r.dominancia_home}
          domAway={r.dominancia_away}
          nomeHome={r.desafiante.nome_clube}
          nomeAway={r.desafiado.nome_clube}
        />
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
          <p className="text-xs text-muted-foreground">Win Streak</p>
          <motion.p
            className="text-2xl font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            {r.win_streak}
          </motion.p>
        </Card>
        <Card className="p-3 text-center">
          <Coins className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p className="text-xs text-muted-foreground">Moedas</p>
          <p className={`text-2xl font-bold ${moedasViewer >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {moedasViewer >= 0 ? "+" : ""}{moedasViewer}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p className="text-xs text-muted-foreground">Elo</p>
          <p className="text-2xl font-bold">{eloViewer}</p>
        </Card>
      </div>

      {r.xp_ganhos > 0 && (
        <Card className="p-3 flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 text-violet-500" />
          <span className="text-sm">+{r.xp_ganhos} XP ganhos</span>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" /> Insights do Treinador
        </h2>
        <InsightsTreinador insights={r.insights} />
      </div>
        </TabsContent>
        <TabsContent value="momentum" className="space-y-6 mt-4">
          {r.momentum ? (
            <MomentumTab momentum={r.momentum} nomeHome={r.desafiante.nome_clube} nomeAway={r.desafiado.nome_clube} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Estatísticas detalhadas indisponíveis para esta partida.</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Dashboard</Link>
        </Button>
        <Button className="flex-1" onClick={() => navigate("/")}>Jogar de novo</Button>
      </div>
    </div>
  );
}