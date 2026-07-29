import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";

const OPCOES = ["EQUILIBRADO", "POSSE", "CONTRA_ATAQUE", "PRESSAO"];

export default function CriarClubeForm({ onCriado }) {
  const [nome, setNome] = useState("");
  const [pais, setPais] = useState("");
  const [especializacao, setEspecializacao] = useState("EQUILIBRADO");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const criar = async () => {
    if (!nome || !pais) { setErro("Preencha nome e país"); return; }
    setLoading(true); setErro("");
    try {
      await base44.functions.invoke("criarClube", {
        nome_clube: nome,
        pais,
        especializacao,
      });
      onCriado();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro ao criar clube");
    } finally { setLoading(false); }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Criar seu clube</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome do clube</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Tropeços FC" />
        </div>
        <div>
          <Label htmlFor="pais">País</Label>
          <Input id="pais" value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Ex: Brasil" />
        </div>
        <div>
          <Label>Especialização</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {OPCOES.map((op) => (
              <Button
                key={op}
                type="button"
                variant={especializacao === op ? "default" : "outline"}
                onClick={() => setEspecializacao(op)}
              >
                {ESPECIALIZACAO_LABELS[op]}
              </Button>
            ))}
          </div>
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <Button className="w-full" disabled={loading} onClick={criar}>
          {loading ? "Criando..." : "Criar clube"}
        </Button>
      </div>
    </Card>
  );
}