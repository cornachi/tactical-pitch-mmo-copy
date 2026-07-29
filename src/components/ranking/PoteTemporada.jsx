import React from "react";
import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";

// Card em destaque no topo do Ranking Global com o Pote Comunitário da Temporada
// e a divisão da premiação paga no encerramento.
export default function PoteTemporada({ pote }) {
  const fmt = (n) => Number(n || 0).toLocaleString("pt-BR");
  const p = Number(pote) || 5000;
  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/40">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-500 text-white shrink-0">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">💰 Pote da Temporada</p>
          <p className="text-3xl font-bold text-amber-700">{fmt(p)}</p>
          <p className="text-[10px] text-muted-foreground">moedas acumuladas em tempo real</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Premio medal="🥇" label="1º Lugar" pct="50%" valor={Math.round(p * 0.5)} extra="Troféu de Campeão" />
        <Premio medal="🥈" label="2º Lugar" pct="30%" valor={Math.round(p * 0.3)} extra="Medalha de Prata" />
        <Premio medal="🥉" label="3º Lugar" pct="20%" valor={Math.round(p * 0.2)} extra="Medalha de Bronze" />
        <Premio medal="🏅" label="4º ao 10º" pct="até 10%" valor={Math.round(p * 0.1)} extra="Recompensa complementar" />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Acumula 5% do valor envolvido em partidas, desafios e compras da loja. Premiação distribuída no encerramento da temporada.
      </p>
    </Card>
  );
}

function Premio({ medal, label, pct, valor, extra }) {
  return (
    <div className="rounded-lg bg-background/60 p-2 border border-amber-500/20">
      <p className="text-sm font-semibold">{medal} {label} <span className="text-muted-foreground text-xs">· {pct}</span></p>
      <p className="text-sm font-bold text-amber-700">{valor.toLocaleString("pt-BR")} moedas</p>
      <p className="text-[10px] text-muted-foreground">{extra}</p>
    </div>
  );
}