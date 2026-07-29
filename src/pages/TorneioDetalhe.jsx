import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Copy, Check, Play, Coins, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EscudoClube from "@/components/clube/EscudoClube";
import ChaveTorneio from "@/components/torneio/ChaveTorneio";
import { useI18n } from "@/i18n/I18nContext";

const STATUS_LABEL = {
  MONTANDO: "Montando",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export default function TorneioDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [clube, setClube] = useState(null);
  const [torneio, setTorneio] = useState(null);
  const [clubesMap, setClubesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [simulandoKey, setSimulandoKey] = useState("");
  const [iniciando, setIniciando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const tr = await base44.entities.Torneio.get(id);
      setTorneio(tr);
      const user = await base44.auth.me();
      const cs = await base44.entities.Clube.filter({ user_id: user.id });
      setClube(cs[0] || null);
      const ids = [...new Set([...(tr.participantes || []), tr.criador_id, tr.campeao_id, tr.vice_id].filter(Boolean))];
      const map = {};
      for (const cid of ids) {
        try { map[cid] = await base44.entities.Clube.get(cid); } catch (e) {}
      }
      setClubesMap(map);
    } catch (e) {
      setErro(e.message || "Erro ao carregar torneio");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(torneio?.codigo_convite || "");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const iniciar = async () => {
    setIniciando(true);
    try {
      const res = await base44.functions.invoke("iniciarTorneio", { torneio_id: id });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      setTorneio(data.torneio);
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setIniciando(false);
    }
  };

  const simular = async (rodada, index) => {
    setSimulandoKey(`${rodada}:${index}`);
    try {
      const res = await base44.functions.invoke("simularPartidaTorneio", { torneio_id: id, rodada, match_index: index });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      setTorneio(data.torneio);
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setSimulandoKey("");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;
  if (erro && !torneio) return <div className="p-8 text-center text-destructive">{erro}</div>;
  if (!torneio) return null;

  const souCriador = clube && torneio.criador_id === clube.id;
  const participantes = torneio.participantes || [];
  const podeSimular = torneio.status === "EM_ANDAMENTO" && clube && (participantes.includes(clube.id) || souCriador);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/torneios")}><ArrowLeft className="w-4 h-4" /> {t("common.voltar")}</Button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> {torneio.nome}</h1>
          <p className="text-sm text-muted-foreground">{STATUS_LABEL[torneio.status]} • Pote: {(torneio.pote_moedas || 0).toLocaleString("pt-BR")} moedas</p>
        </div>
        {torneio.status === "MONTANDO" && (
          <Button variant="outline" onClick={copiarCodigo}>
            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiado ? "Copiado!" : `Código: ${torneio.codigo_convite}`}
          </Button>
        )}
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {torneio.status === "MONTANDO" && (
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Participantes ({participantes.length}/8)</h2>
          <div className="space-y-2">
            {participantes.map((pid) => (
              <div key={pid} className="flex items-center gap-2">
                <EscudoClube clube={clubesMap[pid]} size={24} />
                <span className="text-sm">{clubesMap[pid]?.nome_clube || "—"}</span>
                {pid === torneio.criador_id && <span className="text-xs text-amber-500 font-semibold">Criador</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Compartilhe o código <strong>{torneio.codigo_convite}</strong> com seus amigos. Ao entrar o 8º, a chave é gerada automaticamente.</p>
          {souCriador && participantes.length >= 2 && (
            <Button onClick={iniciar} disabled={iniciando} className="w-full">
              <Play className="w-4 h-4" /> {iniciando ? "Iniciando..." : t("torneios.iniciar")}
            </Button>
          )}
        </Card>
      )}

      {torneio.status === "EM_ANDAMENTO" && torneio.rodadas && (
        <ChaveTorneio
          rodadas={torneio.rodadas}
          clubesMap={clubesMap}
          onSimular={simular}
          podeSimular={podeSimular}
          simulandoKey={simulandoKey}
        />
      )}

      {torneio.status === "CONCLUIDO" && (
        <Card className="p-5 space-y-4 text-center bg-amber-500/5 border-amber-500/30">
          <Crown className="w-10 h-10 mx-auto text-amber-500" />
          <h2 className="text-xl font-bold">Torneio Concluído!</h2>
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">🥇 Campeão</p>
              <div className="flex items-center gap-2 justify-center mt-1">
                <EscudoClube clube={clubesMap[torneio.campeao_id]} size={28} />
                <span className="font-bold">{clubesMap[torneio.campeao_id]?.nome_clube || "—"}</span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mt-1 flex items-center justify-center gap-1"><Coins className="w-3 h-3" /> +{Math.round((torneio.pote_moedas || 0) * 0.7).toLocaleString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">🥈 Vice</p>
              <div className="flex items-center gap-2 justify-center mt-1">
                <EscudoClube clube={clubesMap[torneio.vice_id]} size={28} />
                <span className="font-semibold">{clubesMap[torneio.vice_id]?.nome_clube || "—"}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1"><Coins className="w-3 h-3" /> +{Math.round((torneio.pote_moedas || 0) * 0.3).toLocaleString("pt-BR")}</p>
            </div>
          </div>
          {torneio.rodadas && (
            <div className="pt-2">
              <ChaveTorneio rodadas={torneio.rodadas} clubesMap={clubesMap} podeSimular={false} simulandoKey="" onSimular={() => {}} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}