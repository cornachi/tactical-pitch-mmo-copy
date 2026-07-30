import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Coins, Check, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";

const PACOTES = [
  { id: "iniciante", nomeKey: "loja.pacoteIniciante", moedas: 10000, valor: 4.9, selo: null },
  { id: "treinador", nomeKey: "loja.pacoteTreinador", moedas: 50000, valor: 19.9, seloKey: "loja.seloPopular" },
  { id: "dirigente", nomeKey: "loja.pacoteDirigente", moedas: 200000, valor: 49.9, selo: null },
  { id: "dono", nomeKey: "loja.pacoteDono", moedas: 1000000, valor: 149.9, seloKey: "loja.seloCusto" },
];

const ENERGIA_PACOTES = [
  { id: "e5", qtd: 5, custo: 300, nomeKey: "loja.pacoteIniciante", nomeRaw: "+5" },
  { id: "e10", qtd: 10, custo: 500, nomeRaw: "+10" },
  { id: "e20", qtd: 20, custo: 800, nomeRaw: "+20", seloKey: "loja.seloEconomico" },
];

export default function Loja() {
  const { t } = useI18n();
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState("");
  const [comprandoEnergia, setComprandoEnergia] = useState("");
  const [sucesso, setSucesso] = useState(null);
  const [sucessoEnergia, setSucessoEnergia] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      setClube(clubes[0] || null);
    } catch (e) {
      setErro(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const payment_id = params.get("payment_id");
    if (!status || !payment_id) return;
    window.history.replaceState({}, "", window.location.pathname);
    (async () => {
      if (status === "approved") {
        try {
          const res = await base44.functions.invoke("statusPagamentoMercadoPago", { payment_id });
          const data = res?.data ?? res;
          setSucesso({ pacote: "Mercado Pago", moedas: Number(data?.moedas || 0) });
          await carregar();
        } catch (e) {
          setErro(t("loja.pagamentoAguardando"));
        }
      } else if (status === "failure") {
        setErro(t("loja.pagamentoRecusado"));
      } else if (status === "pending") {
        setErro(t("loja.pagamentoPendente"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comprar = async (pacote) => {
    setComprando(pacote.id);
    setErro("");
    setSucesso(null);
    try {
      if (window.self !== window.top) {
        setErro(t("loja.iframeBloqueio"));
        return;
      }
      const res = await base44.functions.invoke("criarPagamentoMercadoPago", { pacote_id: pacote.id });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      if (data.init_point) window.location.href = data.init_point;
    } catch (e) {
      setErro(e.response?.data?.error || e.message || t("loja.falhaPagamento"));
    } finally {
      setComprando("");
    }
  };

  const comprarEnergia = async (pacote) => {
    setComprandoEnergia(pacote.id);
    setErro("");
    setSucessoEnergia(null);
    try {
      const res = await base44.functions.invoke("comprarEnergia", { qtd: pacote.qtd });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      setSucessoEnergia({ nome: pacote.nomeRaw, credito: data.energias_creditadas, energia: data.energia_matchmaking, max: data.max_energia });
      carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || t("loja.falhaEnergia"));
    } finally {
      setComprandoEnergia("");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Coins className="w-6 h-6 text-amber-500" /> {t("loja.titulo")}</h1>
        {clube && (
          <span className="text-sm text-muted-foreground">{t("loja.saldo")} <strong className="text-foreground">{(clube.moedas ?? 0).toLocaleString("pt-BR")}</strong> {t("common.moedas")}</span>
        )}
      </div>

      {sucesso && (
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/30">
          <p className="flex items-center gap-2 text-emerald-700 font-semibold"><Check className="w-5 h-5" /> {sucesso.moedas?.toLocaleString("pt-BR")} {t("loja.moedasCreditadas")}</p>
          {sucesso.pacote && <p className="text-sm text-muted-foreground mt-1">{t("loja.pacote")} {sucesso.pacote}</p>}
        </Card>
      )}
      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PACOTES.map((p) => (
          <Card key={p.id} className="p-5 flex flex-col relative">
            {p.seloKey && (
              <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-amber-500 text-white">
                {t(p.seloKey)}
              </span>
            )}
            <h3 className="text-lg font-bold">{t(p.nomeKey)}</h3>
            <div className="flex items-center gap-2 my-2">
              <Coins className="w-7 h-7 text-amber-500" />
              <span className="text-3xl font-bold text-amber-600">{p.moedas.toLocaleString("pt-BR")}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("common.moedas")}</p>
            <p className="text-2xl font-bold mt-3">R$ {p.valor.toFixed(2).replace(".", ",")}</p>
            <Button className="w-full mt-4" disabled={comprando === p.id} onClick={() => comprar(p)}>
              {comprando === p.id ? t("loja.redirecionando") : t("loja.comprar")}
            </Button>
          </Card>
        ))}
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> {t("loja.recargaEnergia")}</h2>
          {clube && (
            <div className="text-right space-y-0.5">
              <p className="text-sm text-muted-foreground">{t("loja.energia")} <strong className="text-foreground">{clube.energia_matchmaking ?? 0}</strong> / {20 + (clube.medico_nivel || 0)}</p>
              <p className="text-xs text-muted-foreground">{t("loja.compradasHoje")} <strong className="text-foreground">{clube.energias_compradas_hoje ?? 0}</strong>/20</p>
            </div>
          )}
        </div>
        {sucessoEnergia && (
          <Card className="p-3 mb-3 bg-amber-500/10 border-amber-500/30">
            <p className="flex items-center gap-2 text-amber-700 font-semibold"><Zap className="w-4 h-4" /> +{sucessoEnergia.credito} {t("loja.energiaCreditada")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("loja.saldoEnergia")} {sucessoEnergia.energia} / {sucessoEnergia.max}</p>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ENERGIA_PACOTES.map((e) => (
            <Card key={e.id} className="p-4 flex flex-col relative">
              {e.seloKey && (
                <span className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">{t(e.seloKey)}</span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-6 h-6 text-amber-500" />
                <span className="text-2xl font-bold text-amber-600">{e.nomeRaw} {t("loja.energiasLabel")}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{t("loja.energiasMatchmaking")}</p>
              <p className="text-lg font-bold">{e.custo.toLocaleString("pt-BR")} <span className="text-sm font-normal text-muted-foreground">{t("common.moedas")}</span></p>
              <Button className="w-full mt-3" disabled={comprandoEnergia === e.id || (clube?.moedas ?? 0) < e.custo || (clube?.energias_compradas_hoje ?? 0) + e.qtd > 20} onClick={() => comprarEnergia(e)}>
                {comprandoEnergia === e.id ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t("loja.comprando")}</> : (clube?.energias_compradas_hoje ?? 0) + e.qtd > 20 ? t("loja.limiteDiario") : t("loja.comprar")}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" /> {t("loja.pagamentos")}
      </p>
    </div>
  );
}