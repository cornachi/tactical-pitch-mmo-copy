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
import VozTorcida from "@/components/partida/VozTorcida";
import { useI18n } from "@/i18n/I18nContext";

export default function ResultadoPartida() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const r = location.state?.result;

  if (!r || !r.desafiante) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">{t("resultado.nenhuma")}</p>
        <Button onClick={() => navigate("/")}>{t("common.voltarDashboard")}</Button>
      </div>
    );
  }

  const viewerSide = r.viewer_side || "home";
  const empate = r.vencedor === "empate";
  const venceu = !empate && r.vencedor === viewerSide;
  const titulo = empate ? t("resultado.empate") : venceu ? t("resultado.vitoria") : t("resultado.derrota");
  const corTitulo = empate ? "text-muted-foreground" : venceu ? "text-emerald-600" : "text-rose-600";
  const moedasViewer = r.viewer_moedas ?? r.moedas_ganhas;
  const eloViewer = r.viewer_elo ?? r.novo_elo_desafiante;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {r.tipo_partida === "DESAFIO" ? t("resultado.partidaDesafio") : t("resultado.matchmaking")}
          </p>
          <h1 className={`text-3xl font-bold ${corTitulo}`}>{titulo}</h1>
        </Card>
      </motion.div>

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="resumo">{t("resultado.resumo")}</TabsTrigger>
          <TabsTrigger value="momentum">{t("resultado.momentum")}</TabsTrigger>
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
            <h2 className="font-semibold">{t("resultado.dominancia")}</h2>
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
              <p className="text-xs text-muted-foreground">{t("resultado.winStreak")}</p>
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
              <p className="text-xs text-muted-foreground">{t("resultado.moedas")}</p>
              <p className={`text-2xl font-bold ${moedasViewer >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {moedasViewer >= 0 ? "+" : ""}{moedasViewer}
              </p>
            </Card>
            <Card className="p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">{t("resultado.elo")}</p>
              <p className="text-2xl font-bold">{eloViewer}</p>
            </Card>
          </div>

          {r.xp_ganhos > 0 && (
            <Card className="p-3 flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" />
              <span className="text-sm">+{r.xp_ganhos} XP</span>
            </Card>
          )}

          <div className="space-y-3 selectable-content">
            <h2 className="font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" /> {t("resultado.insights")}
            </h2>
            <InsightsTreinador insights={r.insights} />
          </div>

          <div className="selectable-content">
            <VozTorcida
              placarHome={r.placar_home}
              placarAway={r.placar_away}
              domHome={r.dominancia_home}
              domAway={r.dominancia_away}
              momentum={r.momentum}
              expulsoes={r.expulsoes}
            />
          </div>
        </TabsContent>
        <TabsContent value="momentum" className="space-y-6 mt-4">
          {r.momentum ? (
            <MomentumTab momentum={r.momentum} nomeHome={r.desafiante.nome_clube} nomeAway={r.desafiado.nome_clube} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t("resultado.semMomentum")}</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />{t("nav.dashboard")}</Link>
        </Button>
        <Button className="flex-1" onClick={() => navigate("/")}>{t("resultado.jogarNovamente")}</Button>
      </div>
    </div>
  );
}