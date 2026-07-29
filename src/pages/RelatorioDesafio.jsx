import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import RelatorioPartida from "@/components/partida/RelatorioPartida";
import VozTorcida from "@/components/partida/VozTorcida";

export default function RelatorioDesafio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const partida = await base44.entities.HistoricoPartida.get(id);
        const [home, away] = await Promise.all([
          base44.entities.Clube.get(partida.desafiante_id),
          base44.entities.Clube.get(partida.desafiado_id),
        ]);
        const user = await base44.auth.me();
        const clubes = await base44.entities.Clube.filter({ user_id: user.id });
        setData({ partida, home, away, meuClubeId: clubes[0]?.id || null });
      } catch (e) {
        setErro(e.message || "Erro ao carregar relatório");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando relatório...</div>;
  if (erro) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-destructive">{erro}</p>
      <Button onClick={() => navigate("/desafios")}>Voltar aos Desafios</Button>
    </div>
  );
  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatório Pós-Jogo</h1>
        <Button asChild variant="outline" size="sm"><Link to="/desafios">Voltar</Link></Button>
      </div>
      <RelatorioPartida partida={data.partida} clubeHome={data.home} clubeAway={data.away} meuClubeId={data.meuClubeId} />
      <VozTorcida
        placarHome={data.partida.placar_home}
        placarAway={data.partida.placar_away}
        domHome={data.partida.dominancia_home}
        domAway={(data.partida.insights?.dominancia_away) ?? (100 - (data.partida.dominancia_home || 50))}
        momentum={data.partida.insights?.momentum}
        expulsoes={(data.partida.insights?.lances_narracao || []).filter((l) => l.tipo === "CARTAO_VERMELHO")}
      />
    </div>
  );
}