import React from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";

// Renderiza a chave do mata-mata da Copa dos Campeões.
export default function ChaveCopa({ copa, clubesMap }) {
  const ordem = ["Oitavas de Final", "Quartas de Final", "Semifinal", "Final"];
  const campeao = clubesMap[copa.campeao_id];
  const vice = clubesMap[copa.vice_id];

  return (
    <div className="space-y-6">
      {/* Banner do campeão */}
      <Card className="p-5 text-center bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-amber-500/40">
        <Trophy className="w-10 h-10 mx-auto text-amber-500 mb-2" />
        <p className="text-xs text-muted-foreground">🏆 Campeão da Copa dos Campeões {copa.semana_ano}</p>
        {campeao ? (
          <div className="flex items-center justify-center gap-3 mt-2">
            <EscudoClube clube={campeao} size={48} />
            <div>
              <p className="text-2xl font-bold">{campeao.nome_clube}</p>
              <p className="text-sm text-amber-700">+{copa.premio_moedas?.toLocaleString("pt-BR")} moedas</p>
            </div>
          </div>
        ) : (
          <p className="text-lg font-bold mt-2">A definir</p>
        )}
        {vice && (
          <p className="text-xs text-muted-foreground mt-3">🥈 Vice: {vice.nome_clube} (+{(copa.premio_moedas ? Math.round(copa.premio_moedas / 2) : 0).toLocaleString("pt-BR")} moedas)</p>
        )}
      </Card>

      {/* Rodadas do mata-mata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ordem.map((nome) => {
          const jogos = copa.rodadas?.[nome] || [];
          if (jogos.length === 0) return null;
          return (
            <Card key={nome} className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">{nome}</h3>
              {jogos.map((j, i) => {
                const home = clubesMap[j.home_id];
                const away = clubesMap[j.away_id];
                const homeVenceu = j.vencedor_id === j.home_id;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm border-b last:border-0 py-1.5">
                    <span className="flex items-center gap-1.5 flex-1 min-w-0">
                      {home ? <EscudoClube clube={home} size={24} /> : <span className="w-6 h-6 rounded-full bg-muted" />}
                      <span className={`truncate ${homeVenceu ? "font-bold" : "text-muted-foreground"}`}>{home?.nome_clube || "—"}</span>
                    </span>
                    <span className="font-mono text-xs px-2 rounded bg-muted">{j.placar_home} x {j.placar_away}</span>
                    <span className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                      <span className={`truncate ${!homeVenceu ? "font-bold" : "text-muted-foreground"}`}>{away?.nome_clube || "—"}</span>
                      {away ? <EscudoClube clube={away} size={24} /> : <span className="w-6 h-6 rounded-full bg-muted" />}
                    </span>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>
    </div>
  );
}