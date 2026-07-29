import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Coins, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PACOTES = [
  { id: "iniciante", nome: "Iniciante", moedas: 10000, valor: 4.9, selo: null },
  { id: "treinador", nome: "Treinador", moedas: 50000, valor: 19.9, selo: "Mais Popular" },
  { id: "dirigente", nome: "Dirigente", moedas: 200000, valor: 49.9, selo: null },
  { id: "dono", nome: "Dono de Clube", moedas: 1000000, valor: 149.9, selo: "Melhor Custo-Benefício" },
];

export default function Loja() {
  const [clube, setClube] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState("");
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      setClube(clubes[0] || null);
    } catch (e) {
      setErro(e.message || "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const comprar = async (pacote) => {
    setComprando(pacote.id);
    setErro("");
    setSucesso(null);
    try {
      const res = await base44.functions.invoke("comprarPacote", { pacote_id: pacote.id });
      const data = res?.data ?? res;
      if (data?.error) { setErro(data.error); return; }
      setSucesso({ pacote: pacote.nome, moedas: pacote.moedas, saldo: data.novo_saldo });
      carregar();
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Falha na compra");
    } finally {
      setComprando("");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Coins className="w-6 h-6 text-amber-500" /> Loja do Clube</h1>
        {clube && (
          <span className="text-sm text-muted-foreground">Saldo: <strong className="text-foreground">{(clube.moedas ?? 0).toLocaleString("pt-BR")}</strong> moedas</span>
        )}
      </div>

      {sucesso && (
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/30">
          <p className="flex items-center gap-2 text-emerald-700 font-semibold"><Check className="w-5 h-5" /> {sucesso.moedas.toLocaleString("pt-BR")} moedas creditadas!</p>
          <p className="text-sm text-muted-foreground mt-1">Pacote {sucesso.pacote} • Novo saldo: {sucesso.saldo.toLocaleString("pt-BR")}</p>
        </Card>
      )}
      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PACOTES.map((p) => (
          <Card key={p.id} className="p-5 flex flex-col relative">
            {p.selo && (
              <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-amber-500 text-white">
                {p.selo}
              </span>
            )}
            <h3 className="text-lg font-bold">{p.nome}</h3>
            <div className="flex items-center gap-2 my-2">
              <Coins className="w-7 h-7 text-amber-500" />
              <span className="text-3xl font-bold text-amber-600">{p.moedas.toLocaleString("pt-BR")}</span>
            </div>
            <p className="text-sm text-muted-foreground">moedas</p>
            <p className="text-2xl font-bold mt-3">R$ {p.valor.toFixed(2).replace(".", ",")}</p>
            <Button className="w-full mt-4" disabled={comprando === p.id} onClick={() => comprar(p)}>
              {comprando === p.id ? "Processando..." : "Comprar"}
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" /> Simulação de compra — as moedas são creditadas instantaneamente no seu clube.
      </p>
    </div>
  );
}