import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getPacote } from "../../shared/pacotes.ts";

// Cria uma Preference do Checkout Pro do Mercado Pago. Retorna a URL
// (init_point) para redirecionamento. O usuário paga na página hospedada do MP
// (Pix ou Cartão) e volta à loja; o crédito é feito via webhook ou pela
// verificação de retorno (statusPagamentoMercadoPago).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { pacote_id } = await req.json();
    const pacote = getPacote(pacote_id);
    if (!pacote) return Response.json({ error: 'Pacote inválido' }, { status: 400 });

    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!token) return Response.json({ error: 'Mercado Pago não configurado (MERCADOPAGO_ACCESS_TOKEN)' }, { status: 500 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const clube = clubes[0];
    if (!clube) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });

    const origin = new URL(req.url).origin;
    const body = {
      items: [{
        id: pacote_id,
        title: `${pacote.nome} — ${pacote.moedas.toLocaleString("pt-BR")} moedas`,
        quantity: 1,
        unit_price: Number(pacote.valor_reais),
        currency_id: "BRL",
      }],
      payer: { email: user.email || "jogador@tacticalpitch.app" },
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID") || "",
        clube_id: clube.id,
        pacote_id,
        moedas: String(pacote.moedas),
      },
      back_urls: {
        success: `${origin}/loja?status=approved`,
        failure: `${origin}/loja?status=failure`,
        pending: `${origin}/loja?status=pending`,
      },
      auto_return: "approved",
      statement_descriptor: "TACTICAL PITCH",
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("criarPagamentoMercadoPago: erro MP", JSON.stringify(data));
      return Response.json({ error: data.message || data.error || "Falha ao criar pagamento" }, { status: 400 });
    }

    return Response.json({ init_point: data.init_point || data.sandbox_init_point, preference_id: data.id });
  } catch (error) {
    console.error("criarPagamentoMercadoPago: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}