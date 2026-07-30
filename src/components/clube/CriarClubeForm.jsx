import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";
import { useI18n } from "@/i18n/I18nContext";

const OPCOES = ["EQUILIBRADO", "POSSE", "CONTRA_ATAQUE", "PRESSAO"];

export default function CriarClubeForm({ onCriado }) {
  const { t } = useI18n();
  const [nome, setNome] = useState("");
  const [pais, setPais] = useState("");
  const [especializacao, setEspecializacao] = useState("EQUILIBRADO");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const criar = async () => {
    if (!nome || !pais) { setErro(t("criarClube.erroCampos")); return; }
    setLoading(true); setErro("");
    try {
      await base44.functions.invoke("criarClube", {
        nome_clube: nome,
        pais,
        especializacao,
      });
      onCriado();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro");
    } finally { setLoading(false); }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">{t("criarClube.titulo")}</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">{t("criarClube.nome")}</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t("criarClube.placeholderNome")} />
        </div>
        <div>
          <Label htmlFor="pais">{t("criarClube.pais")}</Label>
          <Input id="pais" value={pais} onChange={(e) => setPais(e.target.value)} placeholder={t("criarClube.placeholderPais")} />
        </div>
        <div>
          <Label>{t("criarClube.especializacao")}</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {OPCOES.map((op) => (
              <Button
                key={op}
                type="button"
                variant={especializacao === op ? "default" : "outline"}
                onClick={() => setEspecializacao(op)}
              >
                {t(ESPECIALIZACAO_LABELS[op])}
              </Button>
            ))}
          </div>
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <Button className="w-full" disabled={loading} onClick={criar}>
          {loading ? t("criarClube.criando") : t("criarClube.criar")}
        </Button>
      </div>
    </Card>
  );
}