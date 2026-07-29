import React from "react";
import { Card } from "@/components/ui/card";

const NIVEIS = [
  { min: 0, max: 25, emoji: "🔴", label: "Revolta na Arquibancada", color: "bg-rose-500", nota: "Penalidade leve no fator casa." },
  { min: 26, max: 50, emoji: "🟡", label: "Desconfiança e Cobrança", color: "bg-amber-500", nota: "A torcida cobra reação." },
  { min: 51, max: 80, emoji: "🟢", label: "Apoio Incondicional", color: "bg-emerald-500", nota: "A torcida acompanha o clube." },
  { min: 81, max: 100, emoji: "🔥", label: "Êxtase / Caldeirão", color: "bg-orange-500", nota: "Bônus de +5% de resiliência em jogos em casa." },
];

export default function TermometroTorcida({ valor }) {
  const v = Math.max(0, Math.min(100, valor ?? 50));
  const nivel = NIVEIS.find((n) => v >= n.min && v <= n.max) || NIVEIS[0];
  return (
    <Card className="p-4 space-y-2">
      <h2 className="font-semibold flex items-center gap-2">🔥 Termômetro da Torcida</h2>
      <div className="flex items-center justify-between text-sm">
        <span>{nivel.emoji} {nivel.label}</span>
        <span className="font-bold">{v}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${nivel.color} transition-all`} style={{ width: `${v}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{nivel.nota}</p>
    </Card>
  );
}