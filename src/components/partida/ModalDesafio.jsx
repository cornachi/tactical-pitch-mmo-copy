import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Swords, Coins, Eye, Shield } from "lucide-react";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";

export default function ModalDesafio({ clube, open, onOpenChange }) {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [espionagem, setEspionagem] = useState(null);
  const [aposta, setAposta] = useState(100);
  const [erro, setErro] = useState("");
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelecionado(null);
    setEspionagem(null);
    setErro("");
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
    setErro("");
    try {
      const res = await base44.functions.invoke("espionarClube", { clube_id: rival.id });
      if (res && res.error) {
        setErro(res.error);
      } else {
        setEspionagem(res);
      }
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Falha ao espionar");
    }
  };

  const iniciar = async () => {
    setErro("");
    const apostaNum = Math.max(0, Number(aposta) || 0);
    if (apostaNum > (clube.moedas || 0)) {
      setErro("Aposta maior que suas moedas disponíveis");
      return;
    }
    if ((clube.energia_desafio || 0) < 1) {
      setErro("Sem energia de desafio disponível");
      return;
    }
    setIniciando(true);
    try {
      const res = await base44.functions.invoke("simularPartida", {
        desafiante_id: clube.id,
        desafiado_id: selecionado.id,
        tipo_partida: "DESAFIO",
        aposta_moedas: apostaNum,
      });
      onOpenChange(false);
      navigate("/simular-partida", { state: { result: res } });
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro ao iniciar desafio");
    } finally {
      setIniciando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Swords className="w-5 h-5 text-rose-500" />Desafiar Adversário</DialogTitle>
        </DialogHeader>

        {!selecionado ? (
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
            </Card>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-1"><Coins className="w-4 h-4 text-amber-500" />Aposta em Moedas</label>
              <Input type="number" min={0} max={clube.moedas || 0} value={aposta} onChange={(e) => setAposta(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Você tem {clube.moedas ?? 0} moedas • Energia de desafio: {clube.energia_desafio ?? 0}/3
              </p>
            </div>

            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" disabled={!selecionado || iniciando} onClick={iniciar}>
            <Swords className="w-4 h-4 mr-2" />{iniciando ? "Iniciando..." : "Iniciar Desafio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}