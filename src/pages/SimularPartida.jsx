import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SimulacaoPartida from "@/components/partida/SimulacaoPartida";
import { useI18n } from "@/i18n/I18nContext";

export default function SimularPartida() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const r = location.state?.result;

  if (!r || !r.desafiante) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">{t("resultado.nenhuma")}</p>
        <button onClick={() => navigate("/")} className="text-primary underline">{t("common.voltarDashboard")}</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <SimulacaoPartida
        result={r}
        onConcluir={() =>
          navigate("/resultado-partida", { state: { result: r }, replace: true })
        }
      />
    </div>
  );
}