import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Coins, Trophy, Flame, Zap, Swords, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClubeHeader from "@/components/clube/ClubeHeader";
import StatCard from "@/components/clube/StatCard";
import CriarClubeForm from "@/components/clube/CriarClubeForm";
import PartidaRapida from "@/components/partida/PartidaRapida";

export default function Home() {
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      setClube(clubes[0] || null);
    } catch (e) {
      setErro(e.message || "Erro ao carregar clube");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (erro) return <div className="p-8 text-center text-destructive">{erro}</div>;
  if (!clube) return <CriarClubeForm onCriado={carregar} />;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ClubeHeader clube={clube} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Coins} label="Moedas" value={clube.moedas ?? 0} accent="bg-amber-500/10 text-amber-600" />
        <StatCard icon={Activity} label="XP" value={clube.xp ?? 0} accent="bg-violet-500/10 text-violet-600" />
        <StatCard icon={Trophy} label="Ranking Elo" value={clube.ranking_elo ?? 1000} accent="bg-blue-500/10 text-blue-600" />
        <StatCard icon={Flame} label="Win Streak" value={clube.win_streak ?? 0} accent="bg-orange-500/10 text-orange-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Energia Matchmaking</p>
            <p className="text-xl font-bold">{clube.energia_matchmaking ?? 0}<span className="text-sm text-muted-foreground">/6</span></p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Energia Desafio</p>
            <p className="text-xl font-bold">{clube.energia_desafio ?? 0}<span className="text-sm text-muted-foreground">/3</span></p>
          </div>
        </Card>
      </div>

      <PartidaRapida clube={clube} />

      <Button asChild className="w-full" size="lg">
        <Link to="/equipe"><Users className="w-4 h-4 mr-2" />Gerenciar Equipe (Árvore Tática)</Link>
      </Button>
    </div>
  );
}