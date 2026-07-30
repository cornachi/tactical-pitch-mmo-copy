import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Activity, Brain } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const FORMA_STYLE = { V: "bg-emerald-500", E: "bg-amber-500", D: "bg-rose-500" };
const FORMA_LABEL = { V: "V", E: "E", D: "D" };

export default function RetrospectoCard({ clubeId }) {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("historicoConfrontos", { clube_a_id: clubeId });
        const data = res?.data ?? res;
        if (active && !data?.error) setStats(data);
      } catch (e) {
        /* silencioso */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [clubeId]);

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">{t("common.carregando")}</p>
      </Card>
    );
  }
  if (!stats) return null;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">{t("retrospecto.titulo")}</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.jogos")}</p>
          <p className="font-bold">{stats.jogos}</p>
        </div>
        <div>
          <p className="text-xs text-emerald-600">{t("retrospecto.vitorias")}</p>
          <p className="font-bold text-emerald-600">{stats.vitorias}</p>
        </div>
        <div>
          <p className="text-xs text-amber-600">{t("retrospecto.empates")}</p>
          <p className="font-bold text-amber-600">{stats.empates}</p>
        </div>
        <div>
          <p className="text-xs text-rose-600">{t("retrospecto.derrotas")}</p>
          <p className="font-bold text-rose-600">{stats.derrotas}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.golsPro")}</p>
          <p className="font-bold">⚽ {stats.gols_pro}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.golsContra")}</p>
          <p className="font-bold">{stats.gols_contra}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.saldo")}</p>
          <p className="font-bold">{stats.saldo >= 0 ? "+" : ""}{stats.saldo}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("retrospecto.aproveit")}</p>
          <p className="font-bold">{stats.aproveitamento}%</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">{t("retrospecto.forma")}</p>
        <div className="flex gap-1.5">
          {stats.forma && stats.forma.length > 0 ? (
            stats.forma.map((f, i) => (
              <span
                key={i}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold ${FORMA_STYLE[f]}`}
              >
                {FORMA_LABEL[f]}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">{t("retrospecto.semPartidas")}</span>
          )}
        </div>
      </div>

      {stats.arma_secreta && (
        <div className="flex items-center gap-3 bg-violet-500/10 rounded-lg p-3">
          <Brain className="w-5 h-5 text-violet-600" />
          <div>
            <p className="text-xs text-muted-foreground">{t("retrospecto.armaSecreta")}</p>
            <p className="font-bold text-sm">
              {stats.arma_secreta.nome} <span className="text-violet-600">{t("common.nivel")} {stats.arma_secreta.nivel}</span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}