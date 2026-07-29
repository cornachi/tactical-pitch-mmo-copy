import React from "react";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";
import EscudoClube from "@/components/clube/EscudoClube";

export default function ClubeHeader({ clube }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border" style={{ borderColor: clube.cor_principal ? `${clube.cor_principal}66` : undefined }}>
      <EscudoClube clube={clube} size={56} />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{clube.nome_clube}</h1>
        <p className="text-sm text-muted-foreground">{clube.pais}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Especialização</p>
        <p className="font-semibold">
          {ESPECIALIZACAO_LABELS[clube.especializacao] || clube.especializacao}
        </p>
      </div>
    </div>
  );
}