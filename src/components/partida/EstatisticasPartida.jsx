import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Target, ListChecks } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

// Painel pós-jogo com duas abas: Estatísticas Gerais (chutes, chutes a gol,
// posse, faltas e cartões) e Atributos Demandados (solicitações + % de sucesso).
function ComparativoBar({ label, home, away, corHome, corAway, isPct }) {
  const total = Math.max(1, home + away);
  const pctH = Math.round((home / total) * 100);
  const fmt = (v) => (isPct ? `${v}%` : v);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-semibold tabular-nums" style={{ color: corHome }}>{fmt(home)}</span>
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: corAway }}>{fmt(away)}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
        <div style={{ width: `${pctH}%`, background: corHome }} />
        <div style={{ width: `${100 - pctH}%`, background: corAway }} />
      </div>
    </div>
  );
}

export default function EstatisticasPartida({ estatisticas, clubeHome, clubeAway }) {
  const { t } = useI18n();
  if (!estatisticas) {
    return <p className="text-sm text-muted-foreground text-center py-6">{t("resultado.semMomentum")}</p>;
  }
  const g = estatisticas.gerais || {};
  const corHome = clubeHome?.cor_principal || "#3b82f6";
  const corAway = clubeAway?.cor_principal || "#f43f5e";

  const linhasGerais = [
    { label: t("stats.posse"), home: g.posse?.home ?? 50, away: g.posse?.away ?? 50, isPct: true },
    { label: t("stats.chutes"), home: g.chutes?.home ?? 0, away: g.chutes?.away ?? 0 },
    { label: t("stats.chutesGol"), home: g.chutes_gol?.home ?? 0, away: g.chutes_gol?.away ?? 0 },
    { label: t("stats.faltas"), home: g.faltas?.home ?? 0, away: g.faltas?.away ?? 0 },
    { label: t("stats.amarelos"), home: g.amarelos?.home ?? 0, away: g.amarelos?.away ?? 0 },
    { label: t("stats.vermelhos"), home: g.vermelhos?.home ?? 0, away: g.vermelhos?.away ?? 0 },
  ];

  return (
    <Tabs defaultValue="gerais" className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="gerais"><Target className="w-4 h-4 mr-1" />{t("stats.gerais")}</TabsTrigger>
        <TabsTrigger value="atributos"><ListChecks className="w-4 h-4 mr-1" />{t("stats.atributos")}</TabsTrigger>
      </TabsList>
      <TabsContent value="gerais" className="mt-4">
        <Card className="p-4 space-y-3">
          {linhasGerais.map((l) => (
            <ComparativoBar key={l.label} {...l} corHome={corHome} corAway={corAway} />
          ))}
        </Card>
      </TabsContent>
      <TabsContent value="atributos" className="mt-4">
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left py-2">{t("stats.atributos")}</th>
                  <th className="text-right">{clubeHome?.nome_clube}</th>
                  <th className="text-right">{clubeAway?.nome_clube}</th>
                </tr>
              </thead>
              <tbody>
                {(estatisticas.atributos || []).map((a) => (
                  <tr key={a.atributo} className="border-t">
                    <td className="py-2 font-medium">{a.atributo}</td>
                    <td className="text-right">
                      <span className="tabular-nums font-semibold" style={{ color: corHome }}>{a.solicitacoes.home}</span>
                      <span className="text-muted-foreground text-xs"> · {a.sucesso.home}%</span>
                    </td>
                    <td className="text-right">
                      <span className="tabular-nums font-semibold" style={{ color: corAway }}>{a.solicitacoes.away}</span>
                      <span className="text-muted-foreground text-xs"> · {a.sucesso.away}%</span>
                    </td>
                  </tr>
                ))}
                {(estatisticas.atributos || []).length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-muted-foreground text-xs">—</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{t("stats.solicitacoes")} · {t("stats.sucesso")}%</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}