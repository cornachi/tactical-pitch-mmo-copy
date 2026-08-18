import React from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nContext";
import { labelAtributo, CATEGORIAS } from "@/lib/tactical";
import { gerarRecomendacoesCoach } from "@/lib/coachInsights";

const CAT_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.key, c.labelKey]));
const CAT_COLOR = {
  POSSE: "bg-blue-500/15 text-blue-700",
  TRANSICAO: "bg-amber-500/15 text-amber-700",
  PRESSAO: "bg-rose-500/15 text-rose-700",
};

// Card do Coach Insight: recomendações de evolução de atributos baseadas nos
// eventos/estatísticas da partida, usando os nomes exatos da interface de treino.
// Props: placar, xg, dominancia (objetos {home, away}), estatisticas, momentum, viewerSide.
export default function CoachInsightsCard({ placar, xg, dominancia, estatisticas, momentum, viewerSide = "home" }) {
  const { t, idioma } = useI18n();
  const navigate = useNavigate();

  const gerais = estatisticas?.gerais || {};
  const dados = {
    placar,
    xg,
    dominancia,
    posse: gerais.posse,
    chutesGol: gerais.chutes_gol,
    faltas: gerais.faltas,
    amarelos: gerais.amarelos,
    vermelhos: gerais.vermelhos,
    atributos: estatisticas?.atributos || [],
    momentum: momentum || [],
  };
  const recs = gerarRecomendacoesCoach(dados, viewerSide, idioma);

  return (
    <Card className="p-4 space-y-3">
      <h2 className="font-semibold flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" /> {t("coach.titulo")}
      </h2>

      {recs.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("coach.semCriticos")}</p>
      ) : (
        <>
          <div className="space-y-2">
            {recs.map((r) => (
              <div key={r.atributo} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <p className="text-sm selectable-content">{r.problema}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t("coach.atributoRecomendado")}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-800">
                    {labelAtributo(r.atributo, t)}
                  </span>
                  {r.categoria && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLOR[r.categoria] || "bg-muted text-muted-foreground"}`}>
                      {t(CAT_LABEL[r.categoria] || r.categoria)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => navigate("/equipe")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Lightbulb className="w-4 h-4 mr-2" /> {t("coach.evoluirAtributos")}
          </Button>
        </>
      )}
    </Card>
  );
}