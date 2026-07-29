import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Trophy, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EscudoClube from "@/components/clube/EscudoClube";
import { premiacaoPorPosicao } from "@/lib/metas";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";

export default function Ranking() {
  const [todos, setTodos] = useState([]);
  const [meuClube, setMeuClube] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const clubes = await base44.entities.Clube.filter({ user_id: user.id });
        setMeuClube(clubes[0] || null);
        const lista = await base44.entities.Clube.list("-ranking_elo", 2000);
        setTodos(lista);
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando ranking...</div>;
  }

  const top100 = todos.slice(0, 100);
  const minhaPos = meuClube ? todos.findIndex((c) => c.id === meuClube.id) + 1 : 0;
  const meuPremio = premiacaoPorPosicao(minhaPos);
  const medalha = (pos) => (pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />Ranking Global
        </h1>
        <Button asChild variant="outline">
          <Link to="/">Voltar</Link>
        </Button>
      </div>

      {meuClube && (
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                {minhaPos}º
              </div>
              <EscudoClube clube={meuClube} size={36} />
              <div>
                <p className="font-bold">{meuClube.nome_clube}</p>
                <p className="text-sm text-muted-foreground">Sua posição atual</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ELO</p>
              <p className="font-bold text-lg">{meuClube.ranking_elo ?? 1000}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Coins className="w-3 h-3" />Premiação estimada
              </p>
              <p className="font-bold text-amber-600">{meuPremio.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="divide-y">
        {top100.map((c, i) => {
          const pos = i + 1;
          const souEu = meuClube?.id === c.id;
          return (
            <div key={c.id} className={`flex items-center gap-3 p-3 ${souEu ? "bg-primary/10" : ""}`}>
              <span className="w-8 text-center font-bold">{medalha(pos) || pos}</span>
              <EscudoClube clube={c} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate flex items-center gap-2">
                  {c.nome_clube}
                  {c.is_bot && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">BOT</span>
                  )}
                  {souEu && <span className="text-xs text-primary">(Você)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ESPECIALIZACAO_LABELS[c.especializacao] || c.especializacao}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{c.ranking_elo ?? 1000}</p>
                <p className="text-xs text-muted-foreground">
                  {premiacaoPorPosicao(pos).toLocaleString("pt-BR")} moedas
                </p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}