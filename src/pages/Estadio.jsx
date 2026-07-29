import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  INSTALACOES, TIPOS_INSTALACAO, TIPOS_COMISSAO, CAMPO_NIVEL, custoInstalacao,
} from "@/lib/instalacoes";

export default function Estadio() {
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evoluindo, setEvoluindo] = useState("");
  const [erro, setErro] = useState("");

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      setClube(clubes[0] || null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const evoluir = async (tipo) => {
    setEvoluindo(tipo);
    setErro("");
    try {
      const res = await base44.functions.invoke("evoluirInstalacao", { clube_id: clube.id, tipo });
      const data = res?.data ?? res;
      if (data?.error) setErro(data.error);
      else await carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setEvoluindo("");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!clube) {
    return (
      <div className="p-8 text-center">
        <Link to="/" className="text-primary underline">Voltar ao Dashboard</Link>
      </div>
    );
  }

  const renderItem = (tipo) => {
    const c = INSTALACOES[tipo];
    const nivel = clube[CAMPO_NIVEL[tipo]] || 0;
    const custo = custoInstalacao(tipo, nivel);
    const pode = (clube.moedas || 0) >= custo;
    return (
      <Card key={tipo} className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{c.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{c.label}</p>
            <p className="text-xs text-muted-foreground">{c.descricao}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Nível</p>
            <p className="font-bold text-lg">{nivel}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-sm font-medium">
            <Coins className="w-4 h-4 mr-1 text-amber-500" />
            {custo.toLocaleString("pt-BR")}
          </span>
          <Button size="sm" disabled={!pode || evoluindo === tipo} onClick={() => evoluir(tipo)}>
            {evoluindo === tipo ? "..." : "Evoluir"}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Estádio & Infraestrutura</h1>
        <p className="text-sm text-muted-foreground">Moedas: {clube.moedas?.toLocaleString("pt-BR")}</p>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Infraestrutura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPOS_INSTALACAO.map(renderItem)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Comissão Técnica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPOS_COMISSAO.map(renderItem)}
        </div>
      </div>
    </div>
  );
}