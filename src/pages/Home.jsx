import React, { useState } from "react";
import { useClube } from "@/hooks/useClube";
import { Link, useLocation } from "react-router-dom";
import { Coins, Trophy, Flame, Zap, Swords, Activity, Users, Award, Building, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClubeHeader from "@/components/clube/ClubeHeader";
import StatCard from "@/components/clube/StatCard";
import CriarClubeForm from "@/components/clube/CriarClubeForm";
import PartidaRapida from "@/components/partida/PartidaRapida";
import ModalDesafio from "@/components/partida/ModalDesafio";
import RecargaAnuncioEnergia from "@/components/partida/RecargaAnuncioEnergia";
import MetaBanner from "@/components/temporada/MetaBanner";
import RetrospectoCard from "@/components/clube/RetrospectoCard";
import AlertaTatico from "@/components/relatorio/AlertaTatico";
import ModalConquistas from "@/components/conquistas/ModalConquistas";
import TermometroTorcida from "@/components/clube/TermometroTorcida";
import SalaTrofeus from "@/components/clube/SalaTrofeus";
import DeletarConta from "@/components/clube/DeletarConta";
import PullToRefresh from "@/components/PullToRefresh";
import { useI18n } from "@/i18n/I18nContext";

export default function Home() {
  const [desafioOpen, setDesafioOpen] = useState(false);
  const [conquistasOpen, setConquistasOpen] = useState(false);
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { data: clube, isLoading, error, refetch } = useClube();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error.message}</div>;
  if (!clube) return <CriarClubeForm onCriado={refetch} />;

  return (
    <PullToRefresh onRefresh={refetch} enabled={pathname === "/"}>
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <MetaBanner />
      <ClubeHeader clube={clube} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Coins} label={t("home.moedas")} value={clube.moedas ?? 0} color={clube.cor_principal} accent="bg-amber-500/10 text-amber-600" />
        <StatCard icon={Activity} label={t("home.xp")} value={clube.xp ?? 0} color={clube.cor_principal} accent="bg-violet-500/10 text-violet-600" />
        <StatCard icon={Trophy} label={t("home.pontosRanking")} value={clube.pontos_ranking ?? 0} color={clube.cor_principal} accent="bg-blue-500/10 text-blue-600" />
        <StatCard icon={Flame} label={t("home.winStreak")} value={clube.win_streak ?? 0} color={clube.cor_principal} accent="bg-orange-500/10 text-orange-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("home.energiaMatchmaking")}</p>
              <p className="text-xl font-bold">{clube.energia_matchmaking ?? 0}<span className="text-sm text-muted-foreground">/{20 + (clube.medico_nivel || 0)}</span></p>
            </div>
          </div>
          <RecargaAnuncioEnergia onConcluido={refetch} />
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("home.energiaDesafio")}</p>
            <p className="text-xl font-bold">{clube.energia_desafio ?? 0}<span className="text-sm text-muted-foreground">/3</span></p>
          </div>
        </Card>
      </div>

      <TermometroTorcida valor={clube.termometro_torcida} />
      <SalaTrofeus clubeId={clube.id} />

      <RetrospectoCard clubeId={clube.id} />

      <AlertaTatico />

      <PartidaRapida clube={clube} />

      <Button variant="outline" className="w-full" size="lg" onClick={() => setDesafioOpen(true)}>
        <Swords className="w-4 h-4 mr-2" />{t("home.desafiarAdversario")}
      </Button>
      <ModalDesafio clube={clube} open={desafioOpen} onOpenChange={setDesafioOpen} />

      <Button asChild variant="outline" className="w-full" size="lg">
        <Link to="/missoes"><Target className="w-4 h-4 mr-2" />{t("home.missoesDiarias")}</Link>
      </Button>
      <Button asChild variant="outline" className="w-full" size="lg">
        <Link to="/ranking"><Trophy className="w-4 h-4 mr-2" />{t("home.rankingGlobal")}</Link>
      </Button>
      <Button variant="outline" className="w-full" size="lg" onClick={() => setConquistasOpen(true)}>
        <Award className="w-4 h-4 mr-2" />{t("home.conquistas")}
      </Button>
      <ModalConquistas clubeId={clube.id} open={conquistasOpen} onOpenChange={setConquistasOpen} onResgatado={refetch} />
      <Button asChild className="w-full" size="lg">
        <Link to="/equipe"><Users className="w-4 h-4 mr-2" />{t("home.gerenciarEquipe")}</Link>
      </Button>
      <Button asChild variant="outline" className="w-full" size="lg">
        <Link to="/estadio"><Building className="w-4 h-4 mr-2" />{t("home.estadioComissao")}</Link>
      </Button>

      <DeletarConta />
    </div>
    </PullToRefresh>
  );
}