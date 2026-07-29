// Pote Comunitário Dinâmico da Temporada: acumula 5% do valor envolvido em
// partidas, desafios e compras da loja. A temporada ativa guarda o total.
export async function acrescentarPote(base44, valor) {
  const v = Math.floor(valor || 0);
  if (!v) return;
  try {
    const temp = (await base44.asServiceRole.entities.Temporada.filter({ ativa: true }))[0];
    if (!temp) return;
    const atual = temp.pote_global ?? 5000;
    await base44.asServiceRole.entities.Temporada.update(temp.id, { pote_global: atual + v });
  } catch (e) { /* best-effort */ }
}