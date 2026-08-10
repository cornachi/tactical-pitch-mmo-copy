import React, { useState } from "react";
import { useClube } from "@/hooks/useClube";
import { useAuth } from "@/lib/AuthContext";
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
import AccountControl from "@/components/auth/AccountControl";
import PullToRefresh from "@/components/PullToRefresh";
import { useI18n } from "@/i18n/I18nContext";

const DEFAULT_GUEST_CLUBE = {
  id: "guest_club_1",
  nome: "Time Convidado FC",
  cor_principal: "#84cc16",
  cor_secundaria: "#0f172a",
  moedas: 1000,
  xp: 150,
  pontos_ranking: 1000,
  win_streak: 0,
  energia_matchmaking: 20,
  medico_nivel: 0,
  energia_desafio: 3,
  termometro_torcida: 75,
  nivel: 1,
};

export default function Home() {
  const [desafioOpen, setDesafioOpen] = useState(false);
  const [conquistasOpen, setConquistasOpen] = useState(false);
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { data: realClube, isLoading, error, refetch } = useClube();

  const isGuest = !!user?.isGuest;
  const clube = isGuest ? (realClube || DEFAULT_GUEST_CLUBE) : realClube;

  if (isLoading && !isGuest) {
    return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  }
  if (error && !isGuest) {
    return <div className="p-8 text-center text-destructive">{error.message}</div>;
  }
  if (!clube && !isGuest) {
    return <CriarClubeForm onCriado={refetch} />;
  }

  const activeClube = clube || DEFAULT_GUEST_CLUBE;

  return (
    <PullToRefresh onRefresh={refetch} enabled={pathname === "/"}>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <AccountControl />

        <MetaBanner />
        <ClubeHeader clube={activeClube} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Coins} label={t("home.moedas")} value={activeClube.moedas ?? 0} color={activeClube.cor_principal} accent="bg-amber-500/10 text-amber-600" />
          <StatCard icon={Activity} label={t("home.xp")} value={activeClube.xp ?? 0} color={activeClube.cor_principal} accent="bg-violet-500/10 text-violet-600" />
          <StatCard icon={Trophy} label={t("home.pontosRanking")} value={activeClube.pontos_ranking ?? 0} color={activeClube.cor_principal} accent="bg-blue-500/10 text-blue-600" />
          <StatCard icon={Flame} label={t("home.winStreak")} value={activeClube.win_streak ?? 0} color={activeClube.cor_principal} accent="bg-orange-500/10 text-orange-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("home.energiaMatchmaking")}</p>
                <p className="text-xl font-bold">{activeClube.energia_matchmaking ?? 0}<span className="text-sm text-muted-foreground">/{20 + (activeClube.medico_nivel || 0)}</span></p>
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
              <p className="text-xl font-bold">{activeClube.energia_desafio ?? 0}<span className="text-sm text-muted-foreground">/3</span></p>
            </div>
          </Card>
        </div>

        <TermometroTorcida valor={activeClube.termometro_torcida} />
        <SalaTrofeus clubeId={activeClube.id} />

        <RetrospectoCard clubeId={activeClube.id} />

        <AlertaTatico />

        <PartidaRapida clube={activeClube} />

        <Button variant="outline" className="w-full" size="lg" onClick={() => setDesafioOpen(true)}>
          <Swords className="w-4 h-4 mr-2" />{t("home.desafiarAdversario")}
        </Button>
        <ModalDesafio clube={activeClube} open={desafioOpen} onOpenChange={setDesafioOpen} />

        <Button asChild variant="outline" className="w-full" size="lg">
          <Link to="/missoes"><Target className="w-4 h-4 mr-2" />{t("home.missoesDiarias")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full" size="lg">
          <Link to="/ranking"><Trophy className="w-4 h-4 mr-2" />{t("home.rankingGlobal")}</Link>
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={() => setConquistasOpen(true)}>
          <Award className="w-4 h-4 mr-2" />{t("home.conquistas")}
        </Button>
        <ModalConquistas clubeId={activeClube.id} open={conquistasOpen} onOpenChange={setConquistasOpen} onResgatado={refetch} />
        <Button asChild className="w-full" size="lg">
          <Link to="/equipe"><Users className="w-4 h-4 mr-2" />{t("home.gerenciarEquipe")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full" size="lg">
          <Link to="/estadio"><Building className="w-4 h-4 mr-2" />{t("home.estadioComissao")}</Link>
        </Button>

        {!isGuest && <DeletarConta />}
      </div>
    </PullToRefresh>
  );
}