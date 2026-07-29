import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EscudoClube from "@/components/clube/EscudoClube";

const RANKINGS = [
  { key: "global", label: "🏆 Global (ELO)", valorLabel: "Pontos ELO" },
  { key: "vitorias", label: "⚔️ Mais Vitórias", valorLabel: "Vitórias no mês" },
  { key: "ataque", label: "⚽ Melhor Ataque", valorLabel: "Gols pró no mês" },
  { key: "defesa", label: "🛡️ Melhor Defesa", valorLabel: "Gols sofridos no mês" },
  { key: "desafios", label: "🔥 Rei dos Desafios", valorLabel: "Vitórias em Desafio" },
  { key: "infra", label: "🏛️ Maior Infraestrutura", valorLabel: "Soma dos níveis" },
  { key: "comissao", label: "🎓 Melhor Comissão", valorLabel: "Soma dos níveis" },
];

export default function Ranking() {
  const [dados, setDados] = useState(null);
  const [meuClubeId, setMeuClubeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("rankingsMensais", {});
        const data = res?.data ?? res;
        if (data && !data.error) {
          setDados(data.rankings);
          setMeuClubeId(data.meu_clube_id);
        }
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando rankings...</div>;
  if (!dados) return <div className="p-8 text-center text-muted-foreground">Falha ao carregar rankings.</div>;

  const medalha = (pos) => (pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null);

  const renderLista = (lista) => {
    if (!lista || lista.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-6">Sem dados ainda neste mês.</p>;
    }
    return (
      <Card className="divide-y">
        {lista.map((r) => {
          const souEu = r.id === meuClubeId;
          const clube = { id: r.id, nome_clube: r.nome, is_bot: r.is_bot, cor_principal: r.cor_principal, icone_escudo: r.icone_escudo };
          return (
            <div key={r.id} className={`flex items-center gap-3 p-3 ${souEu ? "bg-primary/10" : ""}`}>
              <span className="w-8 text-center font-bold">{medalha(r.pos) || r.pos}</span>
              <EscudoClube clube={clube} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate flex items-center gap-2">
                  {r.nome}
                  {r.is_bot && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">BOT</span>}
                  {souEu && <span className="text-xs text-primary">(Você)</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{r.valor}</p>
              </div>
            </div>
          );
        })}
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />Rankings
        </h1>
        <Button asChild variant="outline">
          <Link to="/">Voltar</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Premiação dos rankings especiais: 1º lugar recebe até 10% do prêmio do 1º lugar global; demais posições recebem proporcionalmente.
      </p>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full">
          {RANKINGS.map((r) => (
            <TabsTrigger key={r.key} value={r.key} className="text-xs flex-1 min-w-[45%]">
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {RANKINGS.map((r) => (
          <TabsContent key={r.key} value={r.key} className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">{r.valorLabel}</p>
            {renderLista(dados[r.key])}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}