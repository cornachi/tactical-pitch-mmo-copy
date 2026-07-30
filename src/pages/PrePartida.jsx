import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";
import { useI18n } from "@/i18n/I18nContext";
import { ESPECIALIZACAO_LABELS, ATTR_LABEL_BY_NOME } from "@/lib/tactical";

const MODELOS = [
  { key: "ATAQUE_POSICIONAL", labelKey: "pre.ataquePosicional", descKey: "pre.ataquePosicionalDesc", emoji: "🎯" },
  { key: "BLOCO_BAIXO", labelKey: "pre.blocoBaixo", descKey: "pre.blocoBaixoDesc", emoji: "🛡️" },
  { key: "TRANSICAO_OFENSIVA", labelKey: "pre.transicaoOfensiva", descKey: "pre.transicaoOfensivaDesc", emoji: "⚡" },
  { key: "PRESSAO_ALTA", labelKey: "pre.pressaoAlta", descKey: "pre.pressaoAltaDesc", emoji: "🔥" },
];

export default function PrePartida() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
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
    if (!desafiante_id || !desafiado_id) { setErro(t("pre.invalida")); setLoading(false); return; }
    try {
      const d = await base44.entities.Clube.get(desafiante_id);
      const a = await base44.entities.Clube.get(desafiado_id);
      setDesafiante(d);
      setAdversario(a);
    } catch (e) {
      setErro(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  if (erro) return (
    <div className="p-8 text-center space-y-3">
      <p className="text-destructive">{erro}</p>
      <Button onClick={() => navigate("/")}>{t("common.voltar")}</Button>
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
      setErro(e.response?.data?.error || e.message || t("pre.falhaEspiao"));
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
      setErro(e.response?.data?.error || e.message || "Erro");
    } finally {
      setIniciando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4" /> {t("common.voltar")}</Button>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground mb-3 text-center">{t("pre.titulo")}</p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <EscudoClube clube={desafiante} size={48} />
            <p className="font-semibold mt-2 text-sm">{desafiante.nome_clube}</p>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">{t("pre.vs")}</span>
          <div className="text-center">
            <EscudoClube clube={adversario} size={48} />
            <p className="font-semibold mt-2 text-sm">{adversario.nome_clube}</p>
            <p className="text-xs text-muted-foreground">{t("pre.especializacao")} {t(ESPECIALIZACAO_LABELS[adversario.especializacao] || adversario.especializacao)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><Search className="w-4 h-4" /> {t("pre.espioao")}</h2>
          <Button variant="outline" size="sm" disabled={espiando || (desafiante.moedas || 0) < 150} onClick={espiar}>
            {espiando ? t("pre.analisando") : t("pre.analisar")}
          </Button>
        </div>
        {scout ? (
          <div className="space-y-2 text-sm selectable-content">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("pre.top3")}</p>
              <div className="flex flex-wrap gap-2">
                {scout.top3.map((a) => (
                  <span key={a.nome} className="text-xs px-2 py-1 rounded bg-primary/10">{t(ATTR_LABEL_BY_NOME[a.nome] || a.nome)} · {t("common.nivel")}{a.nivel}</span>
                ))}
              </div>
            </div>
            <p>{t("pre.modeloPrevisto")} <strong>{t((MODELOS.find((m) => m.key === scout.modelo_previsao) || {}).labelKey || scout.modelo_previsao)}</strong></p>
            <p>{t("pre.climaPrevisto")} <strong>{scout.clima.emoji} {t("clima." + scout.clima.key)}</strong></p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("pre.revele")}</p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">{t("pre.modeloJogo")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODELOS.map((m) => (
            <button
              key={m.key}
              onClick={() => setModelo(m.key)}
              className={`text-left p-3 rounded-lg border transition ${modelo === m.key ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
            >
              <p className="font-medium">{m.emoji} {t(m.labelKey)}</p>
              <p className="text-xs text-muted-foreground">{t(m.descKey)}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("pre.dica")}</p>
      </Card>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button className="w-full" size="lg" disabled={!modelo || iniciando || semEnergia} onClick={iniciar}>
        <Swords className="w-4 h-4 mr-2" /> {iniciando ? t("pre.simulando") : t("pre.iniciar")}
      </Button>
      {semEnergia && <p className="text-xs text-destructive text-center">{t("partida.semEnergia")}</p>}
    </div>
  );
}