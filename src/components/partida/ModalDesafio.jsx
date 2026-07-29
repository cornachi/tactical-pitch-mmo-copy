import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Swords, Coins, Eye, Shield, Check, Zap } from "lucide-react";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";

const TETO_APOSTA = 1000;

export default function ModalDesafio({ clube, open, onOpenChange }) {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [espionagem, setEspionagem] = useState(null);
  const [h2h, setH2h] = useState(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelecionado(null);
    setEspionagem(null);
    setH2h(null);
    setErro("");
    setEnviado(false);
    base44.entities.Clube.list("-ranking_elo", 50)
      .then((todos) => setClubes(todos.filter((c) => c.id !== clube.id)))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [open, clube.id]);

  const filtrados = clubes.filter((c) =>
    (c.nome_clube || "").toLowerCase().includes(busca.toLowerCase())
  );

  const selecionar = async (rival) => {
    setSelecionado(rival);
    setEspionagem(null);
    setH2h(null);
    setErro("");
    try {
      const [resEsp, resH2h] = await Promise.all([
        base44.functions.invoke("espionarClube", { clube_id: rival.id }),
        base44.functions.invoke("historicoConfrontos", { clube_a_id: clube.id, clube_b_id: rival.id }),
      ]);
      const esp = resEsp?.data ?? resEsp;
      if (esp && esp.error) setErro(esp.error);
      else setEspionagem(esp);
      const hd = resH2h?.data ?? resH2h;
      if (hd && !hd.error) setH2h(hd);
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Falha ao espionar");
    }
  };

  const aposta = selecionado ? Math.min(clube.moedas || 0, selecionado.moedas || 0, TETO_APOSTA) : 0;

  const enviar = async () => {
    setErro("");
    if ((clube.energia_desafio || 0) < 1) { setErro("Sem energia de desafio disponível"); return; }
    if (aposta <= 0) { setErro("Saldo insuficiente para desafiar (All-In)"); return; }
    setEnviando(true);
    try {
      const res = await base44.functions.invoke("criarDesafio", { desafiado_id: selecionado.id });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      setEnviado(true);
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro ao enviar desafio");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Swords className="w-5 h-5 text-rose-500" />Desafiar Adversário</DialogTitle>
        </DialogHeader>

        {enviado ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-semibold">Desafio enviado!</p>
            <p className="text-sm text-muted-foreground">
              Aposta All-In de <strong className="text-amber-600">{aposta.toLocaleString("pt-BR")}</strong> moedas reservada.
              Aguarde o aceite do adversário na Central de Desafios.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => { onOpenChange(false); navigate("/desafios"); }}>Ver Central de Desafios</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
            </div>
          </div>
        ) : !selecionado ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar clube pelo nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
            </div>
            {loading && <p className="text-sm text-muted-foreground">Carregando clubes...</p>}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {filtrados.map((c) => (
                <button key={c.id} onClick={() => selecionar(c)} className="w-full text-left">
                  <Card className="p-3 flex items-center justify-between hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium">{c.nome_clube}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Elo {c.ranking_elo ?? 1000}</span>
                  </Card>
                </button>
              ))}
              {!loading && filtrados.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum clube encontrado.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setSelecionado(null)} className="text-sm text-muted-foreground hover:text-foreground">← Voltar à lista</button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">{selecionado.nome_clube}</p>
                <p className="text-sm text-muted-foreground">Elo {selecionado.ranking_elo ?? 1000}</p>
              </div>
            </div>

            <Card className="p-3 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-amber-500" />Relatório de Espionagem</p>
              {!espionagem ? (
                <p className="text-sm text-muted-foreground">Espiando o rival...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">Especialização: <strong>{ESPECIALIZACAO_LABELS[espionagem.especializacao] || espionagem.especializacao}</strong></p>
                  <p className="text-xs text-muted-foreground">Atributos mais fortes (pista tática):</p>
                  {(espionagem.atributos_top || []).map((a, i) => (
                    <div key={i} className="flex justify-between text-sm bg-muted/50 rounded px-2 py-1">
                      <span>{a.nome}</span>
                      <span className="font-semibold">Nv {a.nivel}</span>
                    </div>
                  ))}
                </div>
              )}
              {h2h && (
                <div className="text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Retrospecto Direto: </span>
                  <span className="font-semibold">{h2h.vitorias}V - {h2h.empates}E - {h2h.derrotas}D</span>
                  <span className="text-muted-foreground"> ({h2h.jogos} jogos)</span>
                </div>
              )}
            </Card>

            <Card className="p-3 bg-rose-500/5 border-rose-500/20 space-y-1">
              <p className="text-sm font-semibold flex items-center gap-2"><Coins className="w-4 h-4 text-amber-500" />Aposta All-In</p>
              <p className="text-2xl font-bold text-amber-600">{aposta.toLocaleString("pt-BR")} moedas</p>
              <p className="text-xs text-muted-foreground">
                Valor = menor saldo entre os dois clubes (teto {TETO_APOSTA.toLocaleString("pt-BR")}). A aposta será reservada agora e o pote (×2) vai ao vencedor.
              </p>
            </Card>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-4 h-4" /> Energia de desafio: {clube.energia_desafio ?? 0}/3 • Seu saldo: {(clube.moedas ?? 0).toLocaleString("pt-BR")}
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
        )}

        {!enviado && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="bg-rose-600 hover:bg-rose-700" disabled={!selecionado || enviando} onClick={enviar}>
              <Swords className="w-4 h-4 mr-2" />{enviando ? "Enviando..." : "Enviar Desafio"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}