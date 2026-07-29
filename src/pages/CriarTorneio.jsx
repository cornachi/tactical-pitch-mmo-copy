import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Trophy, Coins, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nContext";

export default function CriarTorneio() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [taxa, setTaxa] = useState(0);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  const criar = async () => {
    setCriando(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("criarTorneio", { nome, taxa_inscricao: Number(taxa) || 0 });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      navigate(`/torneios/${data.torneio.id}`);
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Falha ao criar torneio");
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/torneios")}><ArrowLeft className="w-4 h-4" /> {t("common.voltar")}</Button>
      <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> {t("torneios.criar")}</h1>

      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">{t("torneios.nome")}</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Copa dos Amigos" maxLength={40} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxa" className="flex items-center gap-1"><Coins className="w-4 h-4 text-amber-500" /> {t("torneios.taxa")} (0 = grátis)</Label>
          <Input id="taxa" type="number" min={0} value={taxa} onChange={(e) => setTaxa(e.target.value)} />
          <p className="text-xs text-muted-foreground">O pote (70% campeão / 30% vice) é formado pela soma das taxas dos 8 jogadores.</p>
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <Button className="w-full" disabled={criando || !nome.trim()} onClick={criar}>
          {criando ? "Criando..." : "Criar Torneio"}
        </Button>
      </Card>
    </div>
  );
}