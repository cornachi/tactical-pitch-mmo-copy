import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Target, Shield, BarChart3, AlertTriangle, Lightbulb, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";
import { ESPECIALIZACAO_LABELS, ATTR_LABEL_BY_NOME } from "@/lib/tactical";

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-3 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </Card>
  );
}

export default function RelatorioTatico() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let active = true;
    base44.functions.invoke("obterInsightsUltimosJogos", {})
      .then((res) => {
        const d = res?.data ?? res;
        if (active) {
          if (d?.error) setErro(d.error);
          else setData(d);
        }
      })
      .catch((e) => { if (active) setErro(e.message || "Erro"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("relatorioTatico.montando")}</div>;
  if (erro) return <div className="p-8 text-center text-destructive">{erro}</div>;
  if (!data || !data.overall || data.overall.jogos === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-1" />{t("nav.dashboard")}</Button>
        <p className="text-center text-muted-foreground py-8">{t("relatorioTatico.insuficientes")}</p>
      </div>
    );
  }

  const { overall, perfis, pior_perfil } = data;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> {t("relatorioTatico.titulo")}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-1" />{t("nav.dashboard")}</Button>
      </div>

      {pior_perfil && (
        <Card className="p-4 bg-rose-500/5 border-rose-500/30 flex items-center gap-3">
          <div className="text-2xl">{pior_perfil.emoji}</div>
          <p className="text-sm font-semibold text-rose-700 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> {t("relatorioTatico.maiorDificuldade")}: {t(ESPECIALIZACAO_LABELS[pior_perfil.especializacao] || pior_perfil.label)} ({pior_perfil.aproveitamento}% {t("relatorioTatico.aprov")})
          </p>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> {t("relatorioTatico.ultimas")} {overall.jogos} {t("relatorioTatico.partidas")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox icon={TrendingUp} label={t("relatorioTatico.aproveitamento")} value={`${overall.aproveitamento}%`} color="text-emerald-600" />
          <StatBox icon={Target} label={t("relatorioTatico.ved")} value={`${overall.vitorias} / ${overall.empates} / ${overall.derrotas}`} color="text-blue-600" />
          <StatBox icon={Coins} label={t("relatorioTatico.golsProContra")} value={`${overall.gols_pro} / ${overall.gols_contra}`} color="text-amber-600" />
          <StatBox icon={BarChart3} label={t("relatorioTatico.posseMedia")} value={`${overall.posse_media}%`} color="text-violet-600" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("relatorioTatico.perfis")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perfis.map((p) => (
            <Card key={p.especializacao} className={`p-4 space-y-3 ${p.alerta ? "border-rose-500/40" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-bold">{t(ESPECIALIZACAO_LABELS[p.especializacao] || p.label)}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.alerta ? "bg-rose-500/15 text-rose-700" : "bg-emerald-500/15 text-emerald-700"}`}>
                  {p.aproveitamento}%
                </span>
              </div>

              {p.jogos === 0 ? (
                <p className="text-sm text-muted-foreground">{t("relatorioTatico.semConfrontos")}</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div><p className="text-xs text-muted-foreground">{t("relatorioTatico.retrospecto")}</p><p className="font-semibold">{p.vitorias}V-{p.empates}E-{p.derrotas}D</p></div>
                    <div><p className="text-xs text-muted-foreground">{t("relatorioTatico.golsPro")}</p><p className="font-semibold text-emerald-600">{p.gols_pro_med.toFixed(1)}</p></div>
                    <div><p className="text-xs text-muted-foreground">{t("relatorioTatico.golsContra")}</p><p className="font-semibold text-rose-600">{p.gols_contra_med.toFixed(1)}</p></div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>{t("relatorioTatico.posseMediaLbl")}</span><span className="font-semibold text-foreground">{p.posse_media}%</span>
                  </div>
                  <div className="text-sm selectable-content">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{t("relatorioTatico.diagnostico")}</p>
                    <p className="text-sm">{p.diagnostico}</p>
                  </div>
                </>
              )}

              {p.recomendacoes && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 space-y-2">
                  <p className="text-sm font-semibold text-amber-700 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> {t("relatorioTatico.planoAcao")}</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("relatorioTatico.atributosRecomendados")}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.recomendacoes.atributos.map((a) => (
                        <span key={a} className="text-xs bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full font-medium">+{t(ATTR_LABEL_BY_NOME[a] || a)}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground"><Shield className="w-3 h-3 inline mr-1" />{p.recomendacoes.ajuste}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}