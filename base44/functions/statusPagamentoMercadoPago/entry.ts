import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { creditarPacoteMercadoPago } from "../../shared/pagamentos.ts";

// Consulta o status de um pagamento Pix no Mercado Pago. Quando o pagamento é
// aprovado, credita as moedas de forma idempotente (complementa o webhook).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { payment_id } = await req.json();
    if (!payment_id) return Response.json({ error: 'payment_id é obrigatório' }, { status: 400 });

    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!token) return Response.json({ error: 'Mercado Pago não configurado' }, { status: 500 });

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payment = await res.json();
    if (!res.ok) {
      console.error("statusPagamentoMercadoPago: erro MP", JSON.stringify(payment));
      return Response.json({ error: payment.message || "Pagamento não encontrado" }, { status: 400 });
    }

    if (payment.status === "approved") {
      const resultado = await creditarPacoteMercadoPago(base44, payment);
      console.log("statusPagamentoMercadoPago crédito:", JSON.stringify(resultado));
      return Response.json({ status: "aprovado", moedas: Number(payment.metadata?.moedas || 0), ...resultado });
    }

    return Response.json({ status: payment.status });
  } catch (error) {
    console.error("statusPagamentoMercadoPago: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}