import { getPacote } from "../../shared/pacotes.ts";

// Cria uma sessão de checkout do Stripe para um pacote de moedas em R$.
// Retorna a URL de checkout para redirecionamento. Usa price_data (preço ad-hoc)
// para não depender de produtos pré-cadastrados no Stripe.
export default async function(req) {
  try {
    const { pacote_id, clube_id } = await req.json();
    const pacote = getPacote(pacote_id);
    if (!pacote) return Response.json({ error: "Pacote inválido" }, { status: 400 });
    if (!clube_id) return Response.json({ error: "clube_id é obrigatório" }, { status: 400 });

    const origin = new URL(req.url).origin;
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${origin}/loja/sucesso?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/loja?cancel=1`);
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "brl");
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(pacote.valor_reais * 100)));
    params.set("line_items[0][price_data][product_data][name]", `${pacote.nome} — ${pacote.moedas.toLocaleString("pt-BR")} moedas`);
    params.set("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
    params.set("metadata[clube_id]", clube_id);
    params.set("metadata[pacote_id]", pacote_id);
    params.set("metadata[moedas]", String(pacote.moedas));

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("criarCheckoutStripe: erro Stripe", JSON.stringify(data));
      return Response.json({ error: data.error?.message || "Falha ao criar pagamento" }, { status: 400 });
    }
    return Response.json({ url: data.url, session_id: data.id });
  } catch (error) {
    console.error("criarCheckoutStripe: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}