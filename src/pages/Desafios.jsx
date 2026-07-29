import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Swords, Coins, Check, X, Loader2, ArrowLeft, History, Inbox, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";
import PullToRefresh from "@/components/PullToRefresh";
import { useClube } from "@/hooks/useClube";

const STATUS_LABEL = {
  PENDENTE: "Pendente",
  ACEITO: "Aceito",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
  CONCLUIDO: "Concluído",
};

export default function Desafios() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [erro, setErro] = useState("");

  const { data: clube, isLoading: clubeLoading } = useClube();
  const { data: desafiosData, refetch, isLoading: desafiosLoading } = useQuery({
    queryKey: ["desafios", clube?.id],
    queryFn: async () => {
      const [rec, env] = await Promise.all([
        base44.entities.DesafioPendente.filter({ desafiado_id: clube.id }, "-created_date", 100),
        base44.entities.DesafioPendente.filter({ desafiante_id: clube.id }, "-created_date", 100),
      ]);
      const ids = new Set([
        ...rec.map((d) => d.desafiante_id),
        ...env.map((d) => d.desafiado_id),
      ]);
      const map = {};
      await Promise.all([...ids].map(async (id) => {
        try { map[id] = await base44.entities.Clube.get(id); } catch (e) { /* ignore */ }
      }));
      return { recebidos: rec, enviados: env, clubesMap: map };
    },
    enabled: !!clube?.id,
  });

  const responderMutation = useMutation({
    mutationFn: async ({ desafio_id, acao }) => {
      const res = await base44.functions.invoke("responderDesafio", { desafio_id, acao });
      return res?.data ?? res;
    },
    onSuccess: (data, vars) => {
      if (vars.acao === "aceitar") {
        navigate("/simular-partida", { state: { result: data } });
      } else {
        qc.invalidateQueries({ queryKey: ["desafios", clube.id] });
      }
    },
    onError: (e) => {
      setErro(e.response?.data?.error || e.message || "Falha ao processar desafio");
    },
  });

  const recebidos = desafiosData?.recebidos || [];
  const enviados = desafiosData?.enviados || [];
  const clubesMap = desafiosData?.clubesMap || {};

  if (clubeLoading || (clube && desafiosLoading)) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }
  if (!clube) return <div className="p-8 text-center text-muted-foreground">Crie um clube primeiro.</div>;

  const recebidosPendentes = recebidos.filter((d) => d.status === "PENDENTE");
  const enviadosPendentes = enviados.filter((d) => d.status === "PENDENTE");
  const recentes = [...recebidos, ...enviados]
    .filter((d) => d.status === "CONCLUIDO")
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const procId = responderMutation.isPending ? responderMutation.variables?.desafio_id : null;
  const procAcao = responderMutation.isPending ? responderMutation.variables?.acao : null;

  const responder = (d, acao) => responderMutation.mutate({ desafio_id: d.id, acao });

  const CartaoDesafio = ({ d, tipo }) => {
    const rivalId = tipo === "recebido" ? d.desafiante_id : d.desafiado_id;
    const rival = clubesMap[rivalId];
    return (
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rival ? <EscudoClube clube={rival} size={36} /> : <Swords className="w-7 h-7 text-muted-foreground" />}
            <div>
              <p className="font-semibold leading-tight">{rival?.nome_clube || "—"}</p>
              <p className="text-xs text-muted-foreground">Elo {rival?.ranking_elo ?? 1000}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Aposta All-In</p>
            <p className="font-bold text-amber-600 flex items-center gap-1 justify-end"><Coins className="w-4 h-4" />{d.aposta_moedas?.toLocaleString("pt-BR")}</p>
          </div>
        </div>

        {tipo === "recebido" ? (
          <div className="flex gap-2">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={responderMutation.isPending} onClick={() => responder(d, "aceitar")}>
              {procId === d.id && procAcao === "aceitar" ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Simulando...</> : <><Check className="w-4 h-4 mr-1" />Aceitar</>}
            </Button>
            <Button variant="outline" className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50" disabled={responderMutation.isPending} onClick={() => responder(d, "recusar")}>
              {procId === d.id && procAcao === "recusar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" />Recusar</>}
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" disabled={responderMutation.isPending} onClick={() => responder(d, "cancelar")}>
            {procId === d.id && procAcao === "cancelar" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : "Cancelar Desafio"}
          </Button>
        )}
      </Card>
    );
  };

  return (
    <PullToRefresh onRefresh={refetch}>
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-rose-500" /> Central de Desafios</h1>
        <Button asChild variant="outline" size="sm"><span onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-1" />Dashboard</span></Button>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Inbox className="w-5 h-5 text-emerald-600" /> Desafios Recebidos {recebidosPendentes.length > 0 && <span className="bg-rose-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{recebidosPendentes.length}</span>}</h2>
        {recebidosPendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum desafio pendente. Quando alguém te desafiar, aparecerá aqui.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recebidosPendentes.map((d) => <CartaoDesafio key={d.id} d={d} tipo="recebido" />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Send className="w-5 h-5 text-blue-600" /> Desafios Enviados {enviadosPendentes.length > 0 && <span className="bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{enviadosPendentes.length}</span>}</h2>
        {enviadosPendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Você não enviou desafios pendentes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enviadosPendentes.map((d) => <CartaoDesafio key={d.id} d={d} tipo="enviado" />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><History className="w-5 h-5 text-muted-foreground" /> Desafios Recentes</h2>
        {recentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum desafio concluído ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentes.map((d) => {
              const souDesafiante = d.desafiante_id === clube.id;
              const rivalId = souDesafiante ? d.desafiado_id : d.desafiante_id;
              const rival = clubesMap[rivalId];
              const meuResultado = d.status === "CONCLUIDO"
                ? (d.vencedor_id === null ? "Empate" : d.vencedor_id === clube.id ? "Vitória" : "Derrota")
                : null;
              const corResultado = meuResultado === "Vitória" ? "text-emerald-600" : meuResultado === "Derrota" ? "text-rose-600" : "text-muted-foreground";
              return (
                <Card key={d.id} className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{souDesafiante ? "vs " : "de "}{rival?.nome_clube || "—"}</span>
                    <span className="text-muted-foreground">• {d.aposta_moedas?.toLocaleString("pt-BR")} moedas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meuResultado && <span className={`font-semibold ${corResultado}`}>{meuResultado}{d.moedas_ganhas ? ` (${d.moedas_ganhas > 0 ? "+" : ""}${d.moedas_ganhas})` : ""}</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{STATUS_LABEL[d.status]}</span>
                    {d.partida_id && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/desafios/relatorio/${d.partida_id}`)}>📊 Ver Relatório</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
    </PullToRefresh>
  );
}