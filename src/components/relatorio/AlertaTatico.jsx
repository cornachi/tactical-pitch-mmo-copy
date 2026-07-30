import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";

// Widget de alerta tático para o Dashboard: destaca o perfil de adversário
// contra o qual o clube tem menor rendimento (aproveitamento < 50%).
export default function AlertaTatico() {
  const { t, idioma } = useI18n();
  const [pior, setPior] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.functions.invoke("obterInsightsUltimosJogos", { idioma })
      .then((res) => {
        const d = res?.data ?? res;
        if (active && d && !d.error && d.pior_perfil) setPior(d.pior_perfil);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading || !pior) return null;

  return (
    <Link to="/relatorio-tatico">
      <Card className="p-4 bg-rose-500/5 border-rose-500/30 flex items-center gap-3 hover:bg-rose-500/10 transition-colors cursor-pointer">
        <div className="text-2xl">{pior.emoji}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-700 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> {t("alerta.titulo")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("alerta.sofre")} {t(ESPECIALIZACAO_LABELS[pior.especializacao] || pior.label)}! {t("alerta.aproveitamento")} {pior.aproveitamento}% {t("alerta.jogos")} ({pior.jogos}).
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Card>
    </Link>
  );
}