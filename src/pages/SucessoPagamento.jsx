import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Página pública de retorno do Stripe: verifica o pagamento e credita as moedas.
export default function SucessoPagamento() {
  const [estado, setEstado] = useState("verificando");
  const [moedas, setMoedas] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session_id = new URLSearchParams(window.location.search).get("session_id");
    if (!session_id) { setEstado("erro"); setMsg("Sessão de pagamento não encontrada."); return; }
    (async () => {
      try {
        const res = await base44.functions.invoke("verificarPagamentoStripe", { session_id });
        const data = res?.data ?? res;
        if (data?.error) { setEstado("erro"); setMsg(data.error); return; }
        setMoedas(Number(data.moedas || 0));
        setEstado("ok");
      } catch (e) {
        setEstado("erro");
        setMsg(e.response?.data?.error || e.message || "Erro ao verificar pagamento");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        {estado === "verificando" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto text-amber-500 animate-spin" />
            <h1 className="text-xl font-bold">Verificando pagamento...</h1>
            <p className="text-sm text-muted-foreground">Aguarde enquanto confirmamos sua compra.</p>
          </>
        )}
        {estado === "ok" && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h1 className="text-2xl font-bold text-emerald-600">Pagamento confirmado!</h1>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Coins className="w-6 h-6 text-amber-500" />
              <span className="font-bold">{moedas.toLocaleString("pt-BR")} moedas creditadas!</span>
            </div>
            <Button asChild className="w-full"><Link to="/loja">Voltar à Loja</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link to="/">Ir ao Dashboard</Link></Button>
          </>
        )}
        {estado === "erro" && (
          <>
            <XCircle className="w-12 h-12 mx-auto text-rose-500" />
            <h1 className="text-xl font-bold text-rose-600">Não foi possível confirmar</h1>
            <p className="text-sm text-muted-foreground">{msg}</p>
            <Button asChild className="w-full"><Link to="/loja">Voltar à Loja</Link></Button>
          </>
        )}
      </Card>
    </div>
  );
}