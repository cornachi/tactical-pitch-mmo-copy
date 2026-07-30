import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClubeHeader from "@/components/clube/ClubeHeader";
import IdentidadeClube from "@/components/clube/IdentidadeClube";
import { useClube, useEvoluirAtributo } from "@/hooks/useClube";
import {
  ATRIBUTOS_INICIAIS,
  CATEGORIAS,
  CATEGORIA_DA_ESPECIALIZACAO,
  calcularCustoEvolucao,
} from "@/lib/tactical";
import { useI18n } from "@/i18n/I18nContext";

export default function Equipe() {
  const { t } = useI18n();
  const [erro, setErro] = useState("");
  const { data: clube, isLoading, error, refetch } = useClube();
  const { data: atributos = [] } = useQuery({
    queryKey: ["atributos", clube?.id],
    queryFn: () => base44.entities.AtributoTatico.filter({ clube_id: clube.id }),
    enabled: !!clube?.id,
  });
  const evoluirMutation = useEvoluirAtributo(clube?.id);

  const nivelDe = (nome) => atributos.find((a) => a.nome_atributo === nome)?.nivel || 1;

  const evoluir = async (nome) => {
    const nivel = nivelDe(nome);
    const custo = calcularCustoEvolucao(nivel, nome, clube.especializacao, clube.ct_nivel);
    setErro("");
    try {
      await evoluirMutation.mutateAsync({ nome_atributo: nome, custo });
    } catch (e) {
      setErro(e.response?.data?.error || e.message || t("equipe.erroEvoluir"));
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  if (error && !clube) return <div className="p-8 text-center text-destructive">{error.message}</div>;
  if (!clube) return (
    <div className="p-8 text-center">
      <p className="mb-4 text-muted-foreground">{t("equipe.semClube")}</p>
      <Link to="/" className="text-primary underline">{t("common.voltar")}</Link>
    </div>
  );

  const catFav = CATEGORIA_DA_ESPECIALIZACAO[clube.especializacao];
  const evoluindoNome = evoluirMutation.isPending ? evoluirMutation.variables?.nome_atributo : null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> {t("common.voltarDashboard")}
      </Link>

      <ClubeHeader clube={clube} />
      <IdentidadeClube clube={clube} onSalvo={refetch} />

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {CATEGORIAS.map((cat) => (
        <div key={cat.key} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{cat.label}</h2>
            {catFav === cat.key && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                {t("equipe.descontoEsp")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ATRIBUTOS_INICIAIS.filter((a) => a.categoria === cat.key).map((a) => {
              const nivel = nivelDe(a.nome);
              const custo = calcularCustoEvolucao(nivel, a.nome, clube.especializacao, clube.ct_nivel);
              const comDesconto = catFav === a.categoria;
              const podePagar = (clube.moedas || 0) >= custo;
              const evoluindo = evoluindoNome === a.nome;
              return (
                <Card key={a.nome} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">{t("common.nivel")} {nivel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center text-sm font-medium">
                      <Coins className="w-4 h-4 mr-1 text-amber-500" />
                      {custo}
                      {comDesconto && <span className="text-emerald-600 text-xs ml-1">(-10%)</span>}
                    </span>
                    <Button
                      size="sm"
                      disabled={!podePagar || evoluindo}
                      onClick={() => evoluir(a.nome)}
                    >
                      {evoluindo ? "..." : t("equipe.evoluir")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}