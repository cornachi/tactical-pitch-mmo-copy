import { acrescentarPote } from "./pote.ts";

// Crédito idempotente de um pacote pago via Mercado Pago. Recebe o objeto
// payment do MP (com metadata: clube_id, pacote_id, moedas). Credita as moedas
// no clube, registra a transação financeira (vinculada ao clube/admin) e
// contribui 5% das moedas para o Pote Comunitário da temporada.
export async function creditarPacoteMercadoPago(base44, payment) {
  const clubeId = payment?.metadata?.clube_id;
  const pacoteId = payment?.metadata?.pacote_id;
  const moedas = Number(payment?.metadata?.moedas || 0);
  const paymentId = payment?.id ? String(payment.id) : null;
  if (!clubeId || !moedas || !paymentId) {
    return { credited: false, reason: "metadata incompleto" };
  }

  // Idempotência: se já existe transação concluída para este pagamento, não credita de novo.
  const existentes = await base44.asServiceRole.entities.TransacaoLoja.filter({ mercadopago_payment_id: paymentId });
  const jaConcluida = existentes.some((t) => t.status === "CONCLUIDO");
  if (jaConcluida) {
    const t = existentes.find((t) => t.status === "CONCLUIDO");
    return { credited: false, reason: "já creditado anteriormente", transacao_id: t.id };
  }

  const clube = await base44.asServiceRole.entities.Clube.get(clubeId);
  if (!clube) return { credited: false, reason: "clube não encontrado" };

  await base44.asServiceRole.entities.Clube.update(clubeId, { moedas: (clube.moedas || 0) + moedas });

  const valorReais = Number(payment.transaction_amount || 0);
  let transacao;
  if (existentes.length > 0) {
    transacao = await base44.asServiceRole.entities.TransacaoLoja.update(existentes[0].id, {
      status: "CONCLUIDO",
      valor_reais: valorReais,
    });
  } else {
    transacao = await base44.asServiceRole.entities.TransacaoLoja.create({
      clube_id: clubeId,
      pacote_id: pacoteId || "mercadopago",
      valor_reais: valorReais,
      status: "CONCLUIDO",
      mercadopago_payment_id: paymentId,
    });
  }

  try { await acrescentarPote(base44, Math.round(moedas * 0.05)); } catch (e) { /* best-effort */ }

  return { credited: true, moedas, transacao_id: transacao.id };
}