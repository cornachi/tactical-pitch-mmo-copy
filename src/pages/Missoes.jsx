import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Coins, Gift, CheckCircle2, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function Missoes() {
  const { t, idioma } = useI18n();
  const navigate = useNavigate();
  const [clube, setClube] = useState(null);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [resgatando, setResgatando] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      const c = clubes[0];
      setClube(c);
      if (!c) return;
      const res = await base44.functions.invoke("missoesDiarias", { acao: "listar", clube_id: c.id, idioma });
      const d = res?.data ?? res;
      if (d?.error) { setErro(d.error); return; }
      setDados(d);
      const clubeAtualizado = await base44.entities.Clube.get(c.id);
      setClube(clubeAtualizado);
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const resgatar = async (missao) => {
    setErro("");
    setResgatando(missao.id);
    try {
      const res = await base44.functions.invoke("missoesDiarias", {
        acao: "resgatar",
        clube_id: clube.id,
        missao_id: missao.id,
      });
      const d = res?.data ?? res;
      if (d?.error) { setErro(d.error); return; }
      await carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro");
    } finally {
      setResgatando(null);
    }
  };

  const resgatarBonus = async () => {
    setErro("");
    setResgatando("bonus");
    try {
      const res = await base44.functions.invoke("missoesDiarias", {
        acao: "resgatarBonus",
        clube_id: clube.id,
      });
      const d = res?.data ?? res;
      if (d?.error) { setErro(d.error); return; }
      await carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro");
    } finally {
      setResgatando(null);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!clube) {
    return <div className="p-8 text-center space-y-4">
      <p className="text-muted-foreground">{t("missoes.crieClube")}</p>
      <Button onClick={() => navigate("/")}>{t("common.voltar")}</Button>
    </div>;
  }

  const missoes = dados?.missoes || [];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-1" /> {t("nav.dashboard")}</Button>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
          <Coins className="w-4 h-4" /> {clube.moedas ?? 0}
        </div>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><Target className="w-6 h-6 text-primary" /> {t("missoes.titulo")}</h1>
        <p className="text-sm text-muted-foreground">{t("missoes.subtitulo")}</p>
      </div>

      <div className="space-y-3">
        {missoes.map((m) => {
          const pct = Math.min(100, Math.round(((m.progresso || 0) / (m.objetivo || 1)) * 100));
          return (
            <Card key={m.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{m.descricao}</p>
                  <p className="text-xs text-muted-foreground">{t("missoes.recompensa")} <span className="text-amber-600 font-medium">{m.recompensa_moedas} {t("common.moedas")}</span></p>
                </div>
                {m.concluida ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{m.progresso || 0} / {m.objetivo}</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all ${m.concluida ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!m.concluida || m.resgatada || resgatando === m.id}
                onClick={() => resgatar(m)}
                variant={m.resgatada ? "secondary" : "default"}
              >
                {resgatando === m.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Coins className="w-4 h-4 mr-1" />}
                {m.resgatada ? t("missoes.resgatado") : m.concluida ? t("missoes.resgatarRecompensa") : t("missoes.emAndamento")}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className={`p-4 space-y-3 ${dados?.bonus_disponivel ? "border-amber-500 bg-amber-500/5" : ""}`}>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-semibold">{t("missoes.bonusTitulo")}</p>
            <p className="text-xs text-muted-foreground">{t("missoes.bonusDesc")} ({dados?.recompensa_bonus ?? 300} {t("common.moedas")})</p>
          </div>
        </div>
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600"
          disabled={!dados?.bonus_disponivel || dados?.bonus_resgatado || resgatando === "bonus"}
          onClick={resgatarBonus}
        >
          {resgatando === "bonus" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Gift className="w-4 h-4 mr-1" />}
          {dados?.bonus_resgatado ? t("missoes.bonusResgatado") : dados?.bonus_disponivel ? t("missoes.resgatarBonus") : t("missoes.bloqueado")}
        </Button>
      </Card>

      {erro && <p className="text-sm text-destructive text-center">{erro}</p>}
    </div>
  );
}