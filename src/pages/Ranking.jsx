import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EscudoClube from "@/components/clube/EscudoClube";
import PoteTemporada from "@/components/ranking/PoteTemporada";
import { useI18n } from "@/i18n/I18nContext";

const RANKINGS = [
  { key: "global", labelKey: "ranking.global", valorKey: "ranking.globalValor" },
  { key: "vitorias", labelKey: "ranking.vitorias", valorKey: "ranking.vitoriasValor" },
  { key: "ataque", labelKey: "ranking.ataque", valorKey: "ranking.ataqueValor" },
  { key: "desafios", labelKey: "ranking.desafios", valorKey: "ranking.desafiosValor" },
  { key: "infra", labelKey: "ranking.infra", valorKey: "ranking.infraValor" },
  { key: "comissao", labelKey: "ranking.comissao", valorKey: "ranking.comissaoValor" },
];

export default function Ranking() {
  const { t } = useI18n();
  const [dados, setDados] = useState(null);
  const [meuClubeId, setMeuClubeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pote, setPote] = useState(5000);
  const [hall, setHall] = useState(null);
  const [hallLoading, setHallLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("rankingsMensais", {});
        const data = res?.data ?? res;
        if (data && !data.error) {
          setDados(data.rankings);
          setMeuClubeId(data.meu_clube_id);
          if (data.pote_global != null) setPote(data.pote_global);
        }
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
      try {
        const res = await base44.functions.invoke("hallDaFama", {});
        const data = res?.data ?? res;
        if (data && !data.error) setHall(data.hall);
      } catch (e) { /* ignore */ } finally { setHallLoading(false); }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("ranking.carregando")}</div>;
  if (!dados) return <div className="p-8 text-center text-muted-foreground">{t("ranking.falha")}</div>;

  const medalha = (pos) => (pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : null);

  const renderLista = (lista) => {
    if (!lista || lista.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-6">{t("ranking.semDados")}</p>;
    }
    return (
      <Card className="divide-y">
        {lista.map((r) => {
          const souEu = r.id === meuClubeId;
          const clube = { id: r.id, nome_clube: r.nome, is_bot: r.is_bot, cor_principal: r.cor_principal, icone_escudo: r.icone_escudo };
          return (
            <div key={r.id} className={`flex items-center gap-3 p-3 ${souEu ? "bg-primary/10" : ""}`}>
              <span className="w-8 text-center font-bold">{medalha(r.pos) || r.pos}</span>
              <EscudoClube clube={clube} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate flex items-center gap-2">
                  {r.nome}
                  {r.is_bot && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t("common.bot")}</span>}
                  {souEu && <span className="text-xs text-primary">{t("common.voce")}</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{r.valor}</p>
              </div>
            </div>
          );
        })}
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />{t("ranking.titulo")}
        </h1>
        <Button asChild variant="outline">
          <Link to="/">{t("common.voltar")}</Link>
        </Button>
      </div>

      <PoteTemporada pote={pote} />

      <p className="text-xs text-muted-foreground">{t("ranking.premiacao")}</p>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full">
          {RANKINGS.map((r) => (
            <TabsTrigger key={r.key} value={r.key} className="text-xs flex-1 min-w-[45%]">
              {t(r.labelKey)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="hall" className="text-xs flex-1 min-w-[45%]">
            {t("ranking.hall")}
          </TabsTrigger>
        </TabsList>
        {RANKINGS.map((r) => (
          <TabsContent key={r.key} value={r.key} className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">{t(r.valorKey)}</p>
            {renderLista(dados[r.key])}
          </TabsContent>
        ))}
        <TabsContent value="hall" className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">{t("ranking.hallInfo")}</p>
          {hallLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("ranking.carregandoHall")}</p>
          ) : !hall || hall.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("ranking.semCampeoes")}</p>
          ) : (
            <Card className="divide-y">
              {hall.map((r, i) => {
                const souEu = r.id === meuClubeId;
                const clube = { id: r.id, nome_clube: r.nome, is_bot: r.is_bot, cor_principal: r.cor_principal, icone_escudo: r.icone_escudo };
                return (
                  <div key={r.id} className={`flex items-center gap-3 p-3 ${souEu ? "bg-primary/10" : ""}`}>
                    <span className="w-8 text-center font-bold">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                    <EscudoClube clube={clube} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate flex items-center gap-2">
                        {r.nome}
                        {r.is_bot && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t("common.bot")}</span>}
                        {souEu && <span className="text-xs text-primary">{t("common.voce")}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">🏆 {r.titulos.RANKING_GLOBAL} • 🥇 {r.titulos.COPA_CAMPEOES} • ⚔️ {r.titulos.TORNEIO_8}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{r.pontos}</p>
                      <p className="text-xs text-muted-foreground">{t("ranking.pts")}</p>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}