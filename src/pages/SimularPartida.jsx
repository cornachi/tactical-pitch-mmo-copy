import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SimulacaoPartida from "@/components/partida/SimulacaoPartida";

export default function SimularPartida() {
  const location = useLocation();
  const navigate = useNavigate();
  const r = location.state?.result;

  if (!r) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Nenhuma partida para simular.</p>
        <button onClick={() => navigate("/")} className="text-primary underline">Voltar ao Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <SimulacaoPartida
        nomeHome={r.desafiante.nome_clube}
        nomeAway={r.desafiado.nome_clube}
        onConcluir={() =>
          navigate("/resultado-partida", { state: { result: r }, replace: true })
        }
      />
    </div>
  );
}