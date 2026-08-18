import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Activity, Brain } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { ATTR_LABEL_BY_NOME } from "@/lib/tactical";

const FORMA_STYLE = { V: "bg-emerald-500", E: "bg-amber-500", D: "bg-rose-500" };
const FORMA_LABEL = { V: "V", E: "E", D: "D" };

// Overall Record — lê as estatísticas agregadas persistidas no clube (atualizadas
// atomicamente ao final de cada partida/título) e complementa com a forma recente
// (últimos 5) e a arma secreta, calculadas via historicoConfrontos.
export default function RetrospectoCard({ clube, clubeId }) {
  const { t } = useI18n();
  const [extra, setExtra] = useState({ forma: [], arma_secreta: null });
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("historicoConfrontos", { clube_a_id: clubeId });
        const data = res?.data ?? res;
        if (active && !data?.error) {
          setExtra({ forma: data.forma || [], arma_secreta: data.arma_secreta || null });
        }
      } catch (e) {
        /* silencioso */
      } finally {
        if (active) setLoadingExtra(false);
      }
    })();
    return () => { active = false; };
  }, [clubeId]);

  const jogos = clube?.total_partidas || 0;
  const vitorias = clube?.vitorias || 0;
  const empates = clube?.empates || 0;
  const derrotas = clube?.derrotas || 0;
  const golsPro = clube?.gols_pro || 0;
  const golsContra = clube?.gols_contra || 0;
  const saldo = golsPro - golsContra;
  const aproveitamento = jogos > 0 ? Math.round(((vitorias + empates * 0.5) / jogos) * 100) : 0;
  const forma = extra.forma;
  const arma = extra.arma_secreta;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">{t("retrospecto.titulo")}</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.jogos")}</p>
          <p className="font-bold">{jogos}</p>
        </div>
        <div>
          <p className="text-xs text-emerald-600">{t("retrospecto.vitorias")}</p>
          <p className="font-bold text-emerald-600">{vitorias}</p>
        </div>
        <div>
          <p className="text-xs text-amber-600">{t("retrospecto.empates")}</p>
          <p className="font-bold text-amber-600">{empates}</p>
        </div>
        <div>
          <p className="text-xs text-rose-600">{t("retrospecto.derrotas")}</p>
          <p className="font-bold text-rose-600">{derrotas}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.golsPro")}</p>
          <p className="font-bold">⚽ {golsPro}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.golsContra")}</p>
          <p className="font-bold">{golsContra}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.saldo")}</p>
          <p className="font-bold">{saldo >= 0 ? "+" : ""}{saldo}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.aproveit")}</p>
          <p className="font-bold">{aproveitamento}%</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">{t("retrospecto.forma")}</p>
        <div className="flex gap-1.5">
          {forma.length > 0 ? (
            forma.map((f, i) => (
              <span
                key={i}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold ${FORMA_STYLE[f]}`}
              >
                {FORMA_LABEL[f]}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              {loadingExtra ? t("common.carregando") : t("retrospecto.semPartidas")}
            </span>
          )}
        </div>
      </div>

      {arma && (
        <div className="flex items-center gap-3 bg-violet-500/10 rounded-lg p-3">
          <Brain className="w-5 h-5 text-violet-600" />
          <div>
            <p className="text-xs text-muted-foreground">{t("retrospecto.armaSecreta")}</p>
            <p className="font-bold text-sm">
              {t(ATTR_LABEL_BY_NOME[arma.nome] || arma.nome)} <span className="text-violet-600">{t("common.nivel")} {arma.nivel}</span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}