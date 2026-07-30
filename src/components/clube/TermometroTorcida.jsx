import React from "react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";

const NIVEIS = [
  { min: 0, max: 25, emoji: "🔴", labelKey: "termometro.revolta", color: "bg-rose-500", notaKey: "termometro.revoltaNota" },
  { min: 26, max: 50, emoji: "🟡", labelKey: "termometro.desconfianca", color: "bg-amber-500", notaKey: "termometro.desconfiancaNota" },
  { min: 51, max: 80, emoji: "🟢", labelKey: "termometro.apoio", color: "bg-emerald-500", notaKey: "termometro.apoioNota" },
  { min: 81, max: 100, emoji: "🔥", labelKey: "termometro.extase", color: "bg-orange-500", notaKey: "termometro.extaseNota" },
];

export default function TermometroTorcida({ valor }) {
  const { t } = useI18n();
  const v = Math.max(0, Math.min(100, valor ?? 50));
  const nivel = NIVEIS.find((n) => v >= n.min && v <= n.max) || NIVEIS[0];
  return (
    <Card className="p-4 space-y-2">
      <h2 className="font-semibold flex items-center gap-2">{t("termometro.titulo")}</h2>
      <div className="flex items-center justify-between text-sm">
        <span>{nivel.emoji} {t(nivel.labelKey)}</span>
        <span className="font-bold">{v}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${nivel.color} transition-all`} style={{ width: `${v}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{t(nivel.notaKey)}</p>
    </Card>
  );
}