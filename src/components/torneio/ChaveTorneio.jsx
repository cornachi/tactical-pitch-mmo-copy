import React from "react";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

// Renderiza a chave mata-mata de um Torneio de Amigos (Quartas, Semifinal, Final).
// props: { rodadas, clubesMap, onSimular, podeSimular, simulando }
function MatchCard({ m, clubesMap, onSimular, podeSimular, simulando, isFinal, t }) {
  const home = clubesMap[m.home_id];
  const away = clubesMap[m.away_id];
  const pendente = !m.vencedor_id && m.home_id && m.away_id;
  const homeVenceu = m.vencedor_id && m.vencedor_id === m.home_id;
  const awayVenceu = m.vencedor_id && m.vencedor_id === m.away_id;

  const renderLado = (clube, venceu, placar) => (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded ${venceu ? "bg-emerald-500/10" : ""}`}>
      {clube ? (
        <>
          <EscudoClube clube={clube} size={22} />
          <span className={`text-xs truncate ${venceu ? "font-bold" : "text-muted-foreground"}`}>{clube.nome_clube}</span>
        </>
      ) : (
        <span className="text-xs text-muted-foreground italic">{t("torneios.aDefinir")}</span>
      )}
      {m.vencedor_id && (
        <span className={`ml-auto text-sm font-bold ${venceu ? "text-emerald-600" : "text-muted-foreground"}`}>{Number(placar)}</span>
      )}
    </div>
  );

  return (
    <Card className={`p-2 ${isFinal ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
      {isFinal && m.vencedor_id && (
        <div className="flex items-center justify-center gap-1 text-[10px] text-amber-600 font-semibold mb-1">
          <Crown className="w-3 h-3" /> {t("torneios.campeaoTitulo")}
        </div>
      )}
      {renderLado(home, homeVenceu, m.placar_home)}
      <div className="border-t my-1" />
      {renderLado(away, awayVenceu, m.placar_away)}
      {m.bye && <p className="text-[10px] text-center text-muted-foreground mt-1">{t("torneios.wo")}</p>}
      {pendente && podeSimular && (
        <Button size="sm" className="w-full mt-2 h-7 text-xs" disabled={simulando} onClick={onSimular}>
          {simulando ? <Zap className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} {t("torneios.simular")}
        </Button>
      )}
    </Card>
  );
}

export default function ChaveTorneio({ rodadas, clubesMap, onSimular, podeSimular, simulandoKey }) {
  const { t } = useI18n();
  const colunas = [
    { titulo: t("torneios.quartas"), key: "Quartas de Final" },
    { titulo: t("torneios.semi"), key: "Semifinal" },
    { titulo: t("torneios.final"), key: "Final" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      {colunas.map((col) => {
        const matches = rodadas?.[col.key] || [];
        return (
          <div key={col.key} className="space-y-3">
            <h3 className="text-sm font-semibold text-center text-muted-foreground">{col.titulo}</h3>
            {matches.length === 0 && <p className="text-xs text-center text-muted-foreground">—</p>}
            {matches.map((m, i) => (
              <MatchCard
                key={i}
                m={m}
                clubesMap={clubesMap}
                isFinal={col.key === "Final"}
                podeSimular={podeSimular}
                simulando={simulandoKey === `${col.key}:${i}`}
                onSimular={() => onSimular(col.key, i)}
                t={t}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}