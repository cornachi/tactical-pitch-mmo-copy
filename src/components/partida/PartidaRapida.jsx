import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Swords, Zap } from "lucide-react";

export default function PartidaRapida({ clube }) {
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
        setErro("Nenhum adversário disponível no momento.");
        return;
      }
      const adversario = outros[Math.floor(Math.random() * outros.length)];
      const res = await base44.functions.invoke("simularPartida", {
        desafiante_id: clube.id,
        desafiado_id: adversario.id,
        tipo_partida: "MATCHMAKING",
      });
      navigate("/resultado-partida", { state: { result: res } });
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro ao simular partida");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-emerald-500" />
        <h2 className="font-semibold">Partida Rápida</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Encontre um adversário e jogue uma partida de matchmaking (custa 1 energia).
      </p>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button className="w-full" disabled={buscando || semEnergia} onClick={jogar}>
        <Swords className="w-4 h-4 mr-2" />
        {buscando ? "Simulando partida..." : "Jogar Matchmaking"}
      </Button>
      {semEnergia && <p className="text-xs text-destructive text-center">Sem energia de matchmaking</p>}
    </Card>
  );
}