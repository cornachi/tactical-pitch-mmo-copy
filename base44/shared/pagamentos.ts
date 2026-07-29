import { acrescentarPote } from "./pote.ts";

// Crédito idempotente de um pacote pago via Stripe. Recebe o objeto de sessão
// do Stripe Checkout (com metadata: clube_id, pacote_id, moedas). Credita as
// moedas no clube, registra a transação financeira (vinculada ao clube/admin) e
// contribui 5% das moedas para o Pote Comunitário da temporada.
export async function creditarPacoteStripe(base44, session) {
  const clubeId = session?.metadata?.clube_id;
  const pacoteId = session?.metadata?.pacote_id;
  const moedas = Number(session?.metadata?.moedas || 0);
  const sessionId = session?.id;
  if (!clubeId || !moedas || !sessionId) {
    return { credited: false, reason: "metadata incompleto" };
  }

  // Idempotência: se já existe transação concluída para esta sessão, não credita de novo.
  const existentes = await base44.asServiceRole.entities.TransacaoLoja.filter({ stripe_session_id: sessionId });
  if (existentes.some((t) => t.status === "CONCLUIDO")) {
    return { credited: false, reason: "já creditado anteriormente", transacao_id: existentes[0].id };
  }

  const clube = await base44.asServiceRole.entities.Clube.get(clubeId);
  if (!clube) return { credited: false, reason: "clube não encontrado" };

  await base44.asServiceRole.entities.Clube.update(clubeId, { moedas: (clube.moedas || 0) + moedas });

  const valorReais = session.amount_total ? session.amount_total / 100 : 0;
  const transacao = await base44.asServiceRole.entities.TransacaoLoja.create({
    clube_id: clubeId,
    pacote_id: pacoteId || "stripe",
    valor_reais: valorReais,
    status: "CONCLUIDO",
    stripe_session_id: sessionId,
  });

  try { await acrescentarPote(base44, Math.round(moedas * 0.05)); } catch (e) { /* best-effort */ }

  return { credited: true, moedas, transacao_id: transacao.id };
}