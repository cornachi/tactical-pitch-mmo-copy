import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { creditarPacoteMercadoPago } from "../../shared/pagamentos.ts";

// Webhook público do Mercado Pago. Escuta notificações de pagamento e, quando
// o status é "approved", credita as moedas de forma idempotente e marca o
// pedido como concluído. Sem auth (chamado pelos servidores do MP).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!token) {
      console.error("webhookMercadoPago: MERCADOPAGO_ACCESS_TOKEN não configurado");
      return Response.json({ error: "token não configurado" }, { status: 500 });
    }

    // Suporta notificação JSON (Webhooks) e query string (IPN clássico).
    let paymentId, type;
    try {
      const body = await req.json();
      paymentId = body?.data?.id || body?.id;
      type = body?.type || (body?.action ? String(body.action).split(".")[0] : "");
    } catch (e) {
      const u = new URL(req.url);
      paymentId = u.searchParams.get("data.id") || u.searchParams.get("id");
      type = u.searchParams.get("type") || "";
    }

    if (type !== "payment" || !paymentId) {
      return Response.json({ received: true, ignored: true });
    }

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payment = await res.json();
    if (!res.ok) {
      console.error("webhookMercadoPago: erro ao buscar pagamento", JSON.stringify(payment));
      return Response.json({ received: true, error: "pagamento não encontrado" });
    }

    console.log(`webhookMercadoPago: pagamento ${paymentId} status=${payment.status}`);
    if (payment.status === "approved") {
      const r = await creditarPacoteMercadoPago(base44, payment);
      console.log("webhookMercadoPago crédito:", JSON.stringify(r));
    }

    return Response.json({ received: true, status: payment.status });
  } catch (error) {
    console.error("webhookMercadoPago: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}