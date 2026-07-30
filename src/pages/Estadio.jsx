import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClube, useEvoluirInstalacao } from "@/hooks/useClube";
import {
  INSTALACOES, TIPOS_INSTALACAO, TIPOS_COMISSAO, CAMPO_NIVEL, custoInstalacao,
} from "@/lib/instalacoes";
import { useI18n } from "@/i18n/I18nContext";

export default function Estadio() {
  const { t } = useI18n();
  const [erro, setErro] = useState("");
  const { data: clube, isLoading } = useClube();
  const upgrade = useEvoluirInstalacao();

  const evoluir = async (tipo) => {
    const campo = CAMPO_NIVEL[tipo];
    const nivel = clube[campo] || 0;
    const custo = custoInstalacao(tipo, nivel);
    setErro("");
    try {
      await upgrade.mutateAsync({ clube_id: clube.id, tipo, custo, campo });
    } catch (e) {
      const data = e.response?.data;
      setErro(data?.error || e.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  if (!clube) {
    return (
      <div className="p-8 text-center">
        <Link to="/" className="text-primary underline">{t("common.voltarDashboard")}</Link>
      </div>
    );
  }

  const evoluindoTipo = upgrade.isPending ? upgrade.variables?.tipo : null;

  const renderItem = (tipo) => {
    const c = INSTALACOES[tipo];
    const nivel = clube[CAMPO_NIVEL[tipo]] || 0;
    const custo = custoInstalacao(tipo, nivel);
    const pode = (clube.moedas || 0) >= custo;
    const evoluindo = evoluindoTipo === tipo;
    return (
      <Card key={tipo} className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{c.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{t(c.labelKey)}</p>
            <p className="text-xs text-muted-foreground">{t(c.descKey)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">{t("common.nivel")}</p>
            <p className="font-bold text-lg">{nivel}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-sm font-medium">
            <Coins className="w-4 h-4 mr-1 text-amber-500" />
            {custo.toLocaleString("pt-BR")}
          </span>
          <Button size="sm" disabled={!pode || evoluindo} onClick={() => evoluir(tipo)}>
            {evoluindo ? "..." : t("estadio.evoluir")}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> {t("common.voltarDashboard")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{t("estadio.titulo")}</h1>
        <p className="text-sm text-muted-foreground">{t("estadio.moedas")} {clube.moedas?.toLocaleString("pt-BR")}</p>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("estadio.infraestrutura")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPOS_INSTALACAO.map(renderItem)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("estadio.comissao")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPOS_COMISSAO.map(renderItem)}
        </div>
      </div>
    </div>
  );
}