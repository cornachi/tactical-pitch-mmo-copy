import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Swords, Zap } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function PartidaRapida({ clube }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");
  const semEnergia = (clube.energia_matchmaking || 0) < 1;

  const jogar = async () => {
    setBuscando(true);
    setErro("");
    try {
      const todos = await base44.entities.Clube.list("-created_date", 50);
      const outros = todos.filter((c) => c.id !== clube.id);
      if (outros.length === 0) {
        setErro(t("partida.semAdversario"));
        return;
      }
      const adversario = outros[Math.floor(Math.random() * outros.length)];
      navigate("/pre-partida", { state: { desafiante_id: clube.id, desafiado_id: adversario.id } });
    } catch (e) {
      setErro(e.response?.data?.error || e.message || t("partida.erroBuscar"));
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-emerald-500" />
        <h2 className="font-semibold">{t("partida.rapida")}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{t("partida.desc")}</p>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button className="w-full" disabled={buscando || semEnergia} onClick={jogar}>
        <Swords className="w-4 h-4 mr-2" />
        {buscando ? t("partida.buscando") : t("partida.jogar")}
      </Button>
      {semEnergia && <p className="text-xs text-destructive text-center">{t("partida.semEnergia")}</p>}
    </Card>
  );
}