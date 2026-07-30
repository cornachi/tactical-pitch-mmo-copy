import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

// Gráfico de Momentum em tempo real: curva de dominância dos 6 blocos com
// marcador no minuto atual + barra ao vivo.
export default function MomentumLive({ momentum, minutoJogo, corHome, corAway, domHome }) {
  if (!momentum || momentum.length === 0) return null;
  // Revelação progressiva: apenas os blocos já percorridos + ponto ao vivo no minuto atual.
  const data = [{ minuto: 0, home: momentum[0].dominancia_pct.home, away: momentum[0].dominancia_pct.away }];
  momentum.forEach((b) => {
    if (b.fim <= minutoJogo) data.push({ minuto: b.fim, home: b.dominancia_pct.home, away: b.dominancia_pct.away });
  });
  data.push({ minuto: minutoJogo, home: domHome, away: 100 - domHome });

  return (
    <Card className="p-3">
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        <Activity className="w-3.5 h-3.5 text-rose-500" /> Momentum ao vivo
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="gHome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={corHome} stopOpacity={0.4} />
              <stop offset="100%" stopColor={corHome} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gAway" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={corAway} stopOpacity={0.4} />
              <stop offset="100%" stopColor={corAway} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="minuto" domain={[0, 90]} tickFormatter={(v) => `${v}'`} fontSize={10} />
          <YAxis domain={[0, 100]} fontSize={10} />
          <Tooltip labelFormatter={(v) => `Minuto ${v}'`} />
          <ReferenceLine x={minutoJogo} stroke="#0f172a" strokeDasharray="4 4" strokeWidth={1.5} />
          <ReferenceDot x={minutoJogo} y={domHome} r={4} fill={corHome} stroke="#fff" strokeWidth={1.5} isFront />
          <Area type="monotone" dataKey="home" stroke={corHome} strokeWidth={2} fill="url(#gHome)" />
          <Area type="monotone" dataKey="away" stroke={corAway} strokeWidth={2} fill="url(#gAway)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="h-2.5 w-full rounded-full overflow-hidden flex mt-1">
        <div style={{ width: `${domHome}%`, background: corHome, transition: "width 0.1s linear" }} />
        <div style={{ width: `${100 - domHome}%`, background: corAway, transition: "width 0.1s linear" }} />
      </div>
      <div className="flex justify-between text-[10px] mt-0.5">
        <span style={{ color: corHome }}>{domHome}%</span>
        <span style={{ color: corAway }}>{100 - domHome}%</span>
      </div>
    </Card>
  );
}