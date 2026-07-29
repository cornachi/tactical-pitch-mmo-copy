import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";

const TIPOS = [
  { key: "COPA_CAMPEOES", emoji: "🥇", label: "Copa dos Campeões" },
  { key: "RANKING_GLOBAL", emoji: "🏆", label: "Ranking Global" },
  { key: "TORNEIO_8", emoji: "⚔️", label: "Torneios de 8" },
];

export default function SalaTrofeus({ clubeId }) {
  const [trofeus, setTrofeus] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await base44.entities.Trofeu.filter({ clube_id: clubeId });
        setTrofeus(t);
      } catch (e) { /* ignore */ } finally { setLoading(false); }
    })();
  }, [clubeId]);

  const contar = (tipo, colocacao) => trofeus.filter((t) => t.tipo === tipo && t.colocacao === colocacao).length;
  const tipoSel = TIPOS.find((t) => t.key === selecionado);

  return (
    <Card className="p-4 space-y-3">
      <h2 className="font-semibold flex items-center gap-2">🏆 Sala de Troféus do Clube</h2>
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {TIPOS.map((tipo) => {
              const total = contar(tipo.key, "CAMPEAO");
              const vices = contar(tipo.key, "VICE");
              return (
                <button
                  key={tipo.key}
                  onClick={() => setSelecionado(selecionado === tipo.key ? null : tipo.key)}
                  className={`p-3 rounded-lg border text-center transition ${selecionado === tipo.key ? "border-primary bg-primary/10" : "border-border hover:bg-accent"} ${total === 0 ? "opacity-40" : ""}`}
                >
                  <div className="text-3xl">{tipo.emoji}</div>
                  <p className="text-xs font-medium mt-1">{tipo.label}</p>
                  <p className="text-lg font-bold">{total > 0 ? `x${total}` : "—"}</p>
                  {vices > 0 && <p className="text-xs text-muted-foreground">🥈 x{vices}</p>}
                </button>
              );
            })}
          </div>

          {selecionado && (
            <div className="border-t pt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Edições — {tipoSel.label}:</p>
              {trofeus
                .filter((t) => t.tipo === selecionado)
                .sort((a, b) => (b.data_conquista || "").localeCompare(a.data_conquista || ""))
                .map((t) => (
                  <div key={t.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{t.colocacao === "CAMPEAO" ? "🥇 Campeão" : "🥈 Vice"}</span>
                    <span className="text-muted-foreground">{t.edicao || "—"} • {t.data_conquista || "—"}</span>
                  </div>
                ))}
            </div>
          )}

          {trofeus.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">Nenhum troféu conquistado ainda. Levante a taça!</p>
          )}
        </>
      )}
    </Card>
  );
}