import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EscudoClube from "@/components/clube/EscudoClube";
import PullToRefresh from "@/components/PullToRefresh";
import { useI18n } from "@/i18n/I18nContext";

const STATUS_LABEL = {
  MONTANDO: "Montando",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export default function Torneios() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [clube, setClube] = useState(null);
  const [torneios, setTorneios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      const c = clubes[0] || null;
      setClube(c);
      const todos = await base44.entities.Torneio.list("-created_date", 50);
      if (c) setTorneios(todos.filter((tr) => (tr.participantes || []).includes(c.id) || tr.criador_id === c.id));
    } catch (e) {
      setErro(e.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const entrar = async () => {
    setEntrando(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("entrarTorneio", { codigo_convite: codigo });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      navigate(`/torneios/${data.torneio.id}`);
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Falha ao entrar");
    } finally {
      setEntrando(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.carregando")}</div>;

  return (
    <PullToRefresh onRefresh={carregar}>
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> {t("torneios.criar")}</h1>
        <Button asChild><Link to="/torneios/criar"><Plus className="w-4 h-4" /> Criar</Link></Button>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><LogIn className="w-4 h-4" /> Entrar com código</h2>
        <div className="flex gap-2">
          <Input placeholder="CÓDIGO" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} maxLength={6} />
          <Button disabled={entrando || codigo.length < 6} onClick={entrar}>{entrando ? "..." : t("torneios.entrar")}</Button>
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Meus Torneios</h2>
        {torneios.length === 0 && <p className="text-sm text-muted-foreground">Você ainda não está em nenhum torneio.</p>}
        {torneios.map((tr) => (
          <Card key={tr.id} className="p-4 flex items-center gap-3">
            <EscudoClube clube={clube} size={36} />
            <div className="flex-1 min-w-0">
              <Link to={`/torneios/${tr.id}`} className="font-semibold hover:underline truncate block">{tr.nome}</Link>
              <p className="text-xs text-muted-foreground">
                {STATUS_LABEL[tr.status]} • {(tr.participantes || []).length}/8 • Pote: {(tr.pote_moedas || 0).toLocaleString("pt-BR")}
              </p>
            </div>
            <Button asChild variant="outline" size="sm"><Link to={`/torneios/${tr.id}`}>Ver</Link></Button>
          </Card>
        ))}
      </div>
    </div>
    </PullToRefresh>
  );
}