import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getPacote } from "../../shared/pacotes.ts";

// Gera uma cobrança Pix no Mercado Pago para um pacote de moedas em R$.
// Retorna o QR Code (base64), o código "Copia e Cola" e o payment_id.
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

    const idempotencyKey = `${clube.id}-${pacote_id}-${Date.now()}`;
    const body = {
      transaction_amount: Number(pacote.valor_reais),
      description: `${pacote.nome} — ${pacote.moedas.toLocaleString("pt-BR")} moedas`,
      payment_method_id: "pix",
      payer: { email: user.email || "jogador@tacticalpitch.app" },
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID") || "",
        clube_id: clube.id,
        pacote_id,
        moedas: String(pacote.moedas),
      },
    };

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("criarPagamentoMercadoPago: erro MP", JSON.stringify(data));
      return Response.json({ error: data.message || data.error || "Falha ao criar pagamento" }, { status: 400 });
    }

    const qr_base64 = data?.point_of_interaction?.transaction_data?.qr_code_base64;
    const copia_cola = data?.point_of_interaction?.transaction_data?.qr_code;

    await base44.asServiceRole.entities.TransacaoLoja.create({
      clube_id: clube.id,
      pacote_id,
      valor_reais: Number(pacote.valor_reais),
      status: "PENDENTE",
      mercadopago_payment_id: String(data.id),
    });

    return Response.json({
      payment_id: String(data.id),
      qr_base64,
      copia_cola,
      status: data.status,
    });
  } catch (error) {
    console.error("criarPagamentoMercadoPago: erro", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}