import React from "react";
import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

// Card em destaque no topo do Ranking Global com o Pote Comunitário da Temporada
// e a divisão da premiação paga no encerramento.
export default function PoteTemporada({ pote }) {
  const { t } = useI18n();
  const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");
  const p = Number(pote) || 5000;
  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/40">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-500 text-white shrink-0">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("pote.titulo")}</p>
          <p className="text-3xl font-bold text-amber-700">{fmt(p)}</p>
          <p className="text-[10px] text-muted-foreground">{t("pote.acumuladas")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Premio medal="🥇" label={t("pote.lugar1")} pct="50%" valor={Math.round(p * 0.5)} extra={t("pote.trofeuCamp")} t={t} />
        <Premio medal="🥈" label={t("pote.lugar2")} pct="30%" valor={Math.round(p * 0.3)} extra={t("pote.medalhaPrata")} t={t} />
        <Premio medal="🥉" label={t("pote.lugar3")} pct="20%" valor={Math.round(p * 0.2)} extra={t("pote.medalhaBronze")} t={t} />
        <Premio medal="🏅" label={t("pote.lugar4")} pct="até 10%" valor={Math.round(p * 0.1)} extra={t("pote.complementar")} t={t} />
      </div>
      <p className="text-[10px] text-muted-foreground">{t("pote.info")}</p>
    </Card>
  );
}

function Premio({ medal, label, pct, valor, extra, t }) {
  return (
    <div className="rounded-lg bg-background/60 p-2 border border-amber-500/20">
      <p className="text-sm font-semibold">{medal} {label} <span className="text-muted-foreground text-xs">· {pct}</span></p>
      <p className="text-sm font-bold text-amber-700">{valor.toLocaleString("pt-BR")} {t("pote.moedas")}</p>
      <p className="text-[10px] text-muted-foreground">{extra}</p>
    </div>
  );
}