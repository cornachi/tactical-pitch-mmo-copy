import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { creditarPacoteStripe } from "../../shared/pagamentos.ts";

// Verifica uma sessão de checkout do Stripe (chamada pela página de sucesso).
// Confirma que o pagamento foi pago e credita as moedas de forma idempotente.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: "session_id é obrigatório" }, { status: 400 });

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: { Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}` },
    });
    const session = await res.json();
    if (!res.ok) {
      console.error("verificarPagamentoStripe: erro Stripe", JSON.stringify(session));
      return Response.json({ error: session.error?.message || "Sessão não encontrada" }, { status: 400 });
    }
    if (session.payment_status !== "paid") {
      return Response.json({ error: "Pagamento ainda não confirmado", payment_status: session.payment_status }, { status: 400 });
    }

    const resultado = await creditarPacoteStripe(base44, session);
    console.log("verificarPagamentoStripe:", JSON.stringify(resultado));
    return Response.json({ success: true, moedas: Number(session.metadata?.moedas || 0), ...resultado });
  } catch (error) {
    console.error("verificarPagamentoStripe: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}