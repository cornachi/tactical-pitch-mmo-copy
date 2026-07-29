import React from "react";
import { Shield } from "lucide-react";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";

export default function ClubeHeader({ clube }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
        <Shield className="w-7 h-7" />
      </div>
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