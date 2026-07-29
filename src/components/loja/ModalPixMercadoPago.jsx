import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Copy, Check, Clock, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Modal de checkout Pix do Mercado Pago: exibe o QR Code e o código Copia e Cola,
// faz polling do status e, ao ser aprovado, dispara onAprovado.
export default function ModalPixMercadoPago({ pagamento, onClose, onAprovado }) {
  const [status, setStatus] = useState(pagamento?.status || "pending");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!pagamento?.payment_id) return;
    let ativo = true;
    const timer = setInterval(async () => {
      try {
        const res = await base44.functions.invoke("statusPagamentoMercadoPago", { payment_id: pagamento.payment_id });
        const data = res?.data ?? res;
        if (!ativo) return;
        if (data?.status === "aprovado") {
          clearInterval(timer);
          setStatus("aprovado");
          setTimeout(() => onAprovado?.(data.moedas ?? pagamento.pacote?.moedas), 1500);
        } else if (data?.status && !data?.error) {
          setStatus(data.status);
        }
      } catch (e) { /* tenta novamente no próximo ciclo */ }
    }, 3000);
    return () => { ativo = false; clearInterval(timer); };
  }, [pagamento?.payment_id]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pagamento?.copia_cola || "");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {}
  };

  const aprovado = status === "approved" || status === "aprovado";
  const pacote = pagamento?.pacote;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="max-w-md w-full p-6 relative space-y-4">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold">Pagamento via Pix</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {pacote?.nome} — {pacote?.moedas?.toLocaleString("pt-BR")} moedas • R$ {pacote?.valor?.toFixed(2).replace(".", ",")}
        </p>

        {aprovado ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-600">Pagamento aprovado!</p>
            <p className="text-sm text-muted-foreground">Creditando {pacote?.moedas?.toLocaleString("pt-BR")} moedas...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center bg-white p-3 rounded-lg border">
              {pagamento?.qr_base64 ? (
                <img src={`data:image/png;base64,${pagamento.qr_base64}`} alt="QR Code Pix" className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-muted-foreground text-sm">QR indisponível</div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Escaneie o QR ou copie o código abaixo:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted p-2 rounded truncate">{pagamento?.copia_cola}</code>
                <Button size="icon" variant="outline" onClick={copiar}>
                  {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Aguardando pagamento...</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}