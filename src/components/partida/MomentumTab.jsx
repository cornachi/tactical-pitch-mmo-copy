import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot, ResponsiveContainer,
} from "recharts";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";

export default function MomentumTab({ momentum, nomeHome, nomeAway }) {
  const { t } = useI18n();
  if (!momentum || momentum.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t("resultado.semMomentum")}
      </p>
    );
  }

  const chartData = [
    { minuto: 0, home: momentum[0].dominancia_pct.home, away: momentum[0].dominancia_pct.away },
    ...momentum.map((b) => ({ minuto: b.fim, home: b.dominancia_pct.home, away: b.dominancia_pct.away })),
  ];

  const gols = [];
  momentum.forEach((b) => {
    b.eventos
      .filter((e) => e.tipo === "gol")
      .forEach((e) => gols.push({ minuto: e.minuto, lado: e.lado, y: b.dominancia_pct[e.lado] }));
  });

  const melhor = momentum.reduce(
    (best, b) => (b.dominancia_pct.home > best.dominancia_pct.home ? b : best),
    momentum[0]
  );

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("mt.minutoOuro")}</p>
            <p className="font-bold text-lg">{melhor.rotulo}' — {melhor.dominancia_pct.home}% {t("mt.dominancia")}</p>
            <p className="text-xs text-muted-foreground">
              {melhor.chutes.home} {t("mt.chutes")} • {melhor.xg_intervalo.home} xG • {melhor.posse_pct.home}% {t("mt.posse")}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">{t("mt.tituloGrafico")}</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="minuto" tickFormatter={(v) => `${v}'`} />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip labelFormatter={(v) => `${v}'`} />
            <ReferenceLine y={50} strokeDasharray="4 4" stroke="#94a3b8" />
            <Line type="monotone" dataKey="home" name={nomeHome} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="away" name={nomeAway} stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
            {gols.map((g, i) => (
              <ReferenceDot key={i} x={g.minuto} y={g.y} r={5} fill="#facc15" stroke="#000" strokeWidth={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" />{nomeHome}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500" />{nomeAway}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />{t("mt.gol")}</span>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">{t("mt.tabela")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="text-left py-2">{t("mt.periodo")}</th>
                <th className="text-right">{t("mt.domHome")} {nomeHome}</th>
                <th className="text-right">{t("mt.domHome")} {nomeAway}</th>
                <th className="text-right">{t("mt.posseH")}</th>
                <th className="text-right">{t("mt.xgH")}</th>
                <th className="text-right">{t("mt.xgA")}</th>
                <th className="text-right">{t("mt.chutesHA")}</th>
                <th className="text-right">{t("mt.eventos")}</th>
              </tr>
            </thead>
            <tbody>
              {momentum.map((b) => {
                const ev = b.eventos
                  .map((e) =>
                    e.tipo === "gol" ? `⚽${e.minuto}'` :
                    e.tipo === "vermelho" ? `🟥${e.minuto}'` :
                    `🟨${e.minuto}'`
                  )
                  .join(" ");
                return (
                  <tr key={b.rotulo} className="border-t">
                    <td className="py-2 font-medium">{b.rotulo}'</td>
                    <td className="text-right">{b.dominancia_pct.home}%</td>
                    <td className="text-right">{b.dominancia_pct.away}%</td>
                    <td className="text-right">{b.posse_pct.home}%</td>
                    <td className="text-right">{b.xg_intervalo.home}</td>
                    <td className="text-right">{b.xg_intervalo.away}</td>
                    <td className="text-right">{b.chutes.home}/{b.chutes.away}</td>
                    <td className="text-right text-xs whitespace-nowrap">{ev || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}