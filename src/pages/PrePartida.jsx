import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Swords, Zap, Shield, Flame, Target, CloudSun, CloudRain, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";
import { useI18n } from "@/i18n/I18nContext";

const MODELOS = [
  { key: "ATAQUE_POSICIONAL", label: "Ataque Posicional", emoji: "🎯", desc: "Foco na Organização Ofensiva e posse de bola." },
  { key: "BLOCO_BAIXO", label: "Bloco Baixo / Retranca", emoji: "🛡️", desc: "Foco na Defesa de Funil e compactação." },
  { key: "TRANSICAO_OFENSIVA", label: "Transição Ofensiva", emoji: "⚡", desc: "Foco em velocidade e contra-ataques verticais." },
  { key: "PRESSAO_ALTA", label: "Pressão Alta (Perda-Pressiona)", emoji: "🔥", desc: "Sufocar a saída de bola no campo adversário." },
];

const CLIMA_ICON = { ENSOLARADO: CloudSun, CHUVA: CloudRain, CALOR: ThermometerSun };

export default function PrePartida() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { desafiante_id, desafiado_id } = location.state || {};
  const [desafiante, setDesafiante] = useState(null);
  const [adversario, setAdversario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [scout, setScout] = useState(null);
  const [espiando, setEspiando] = useState(false);
  const [modelo, setModelo] = useState(null);
  const [iniciando, setIniciando] = useState(false);

  const carregar = async () => {
    if (!desafiante_id || !desafiado_id) { setErro("Pré-partida inválida."); setLoading(false); return; }
    try {
      const d = await base44.entities.Clube.get(desafiante_id);
      const a = await base44.entities.Clube.get(desafiado_id);
      setDesafiante(d);
      setAdversario(a);
    } catch (e) {
      setErro(e.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  if (erro) return (
    <div className="p-8 text-center space-y-3">
      <p className="text-destructive">{erro}</p>
      <Button onClick={() => navigate("/")}>Voltar</Button>
    </div>
  );
  if (!desafiante || !adversario) return null;

  const semEnergia = (desafiante.energia_matchmaking || 0) < 1;

  const espiar = async () => {
    setEspiando(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("espionarPreJogo", { desafiante_id, desafiado_id });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      setScout(data);
      await carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Falha no Espião");
    } finally {
      setEspiando(false);
    }
  };

  const iniciar = async () => {
    setIniciando(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("simularPartida", {
        desafiante_id,
        desafiado_id,
        tipo_partida: "MATCHMAKING",
        modelo_jogo: modelo,
        clima: scout?.clima?.key,
      });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      navigate("/simular-partida", { state: { result: data } });
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro ao simular");
    } finally {
      setIniciando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4" /> Voltar</Button>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground mb-3 text-center">Pré-partida • Matchmaking</p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <EscudoClube clube={desafiante} size={48} />
            <p className="font-semibold mt-2 text-sm">{desafiante.nome_clube}</p>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          <div className="text-center">
            <EscudoClube clube={adversario} size={48} />
            <p className="font-semibold mt-2 text-sm">{adversario.nome_clube}</p>
            <p className="text-xs text-muted-foreground">Especialização: {adversario.especializacao}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><Search className="w-4 h-4" /> Espião Pré-Jogo</h2>
          <Button variant="outline" size="sm" disabled={espiando || (desafiante.moedas || 0) < 150} onClick={espiar}>
            {espiando ? "Analisando..." : "🕵️ Analisar (150 🪙)"}
          </Button>
        </div>
        {scout ? (
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">3 atributos metodológicos mais fortes:</p>
              <div className="flex flex-wrap gap-2">
                {scout.top3.map((a) => (
                  <span key={a.nome} className="text-xs px-2 py-1 rounded bg-primary/10">{a.nome} · Nv{a.nivel}</span>
                ))}
              </div>
            </div>
            <p>Modelo de jogo previsto: <strong>{scout.modelo_previsao_label}</strong></p>
            <p>Clima previsto: <strong>{scout.clima.emoji} {scout.clima.label}</strong></p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Revele os 3 atributos mais fortes do adversário, o modelo de jogo previsto e o clima do confronto.</p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Modelo de Jogo (1º tempo)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODELOS.map((m) => (
            <button
              key={m.key}
              onClick={() => setModelo(m.key)}
              className={`text-left p-3 rounded-lg border transition ${modelo === m.key ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
            >
              <p className="font-medium">{m.emoji} {m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Dica: anular o modelo previsto do adversário concede +25% de efetividade nas jogadas.</p>
      </Card>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button className="w-full" size="lg" disabled={!modelo || iniciando || semEnergia} onClick={iniciar}>
        <Swords className="w-4 h-4 mr-2" /> {iniciando ? "Simulando..." : "Iniciar Partida"}
      </Button>
      {semEnergia && <p className="text-xs text-destructive text-center">Sem energia de matchmaking</p>}
    </div>
  );
}