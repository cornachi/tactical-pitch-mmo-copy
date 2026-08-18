// Atualização atômica das estatísticas agregadas do clube (Overall Record).
// Soma partidas, vitórias/empates/derrotas e gols pró/contra conforme o delta
// informado. Usada por simularCore (partidas) e pelas finais de torneio/copa.
// delta: { partidas, vitorias, empates, derrotas, gols_pro, gols_contra }
export async function acrescentarEstatistica(base44, clube_id, delta = {}) {
  if (!clube_id) return null;
  try {
    const clube = await base44.asServiceRole.entities.Clube.get(clube_id);
    if (!clube) return null;
    return await base44.asServiceRole.entities.Clube.update(clube_id, {
      total_partidas: (clube.total_partidas || 0) + (delta.partidas || 0),
      vitorias: (clube.vitorias || 0) + (delta.vitorias || 0),
      empates: (clube.empates || 0) + (delta.empates || 0),
      derrotas: (clube.derrotas || 0) + (delta.derrotas || 0),
      gols_pro: (clube.gols_pro || 0) + (delta.gols_pro || 0),
      gols_contra: (clube.gols_contra || 0) + (delta.gols_contra || 0),
    });
  } catch (e) {
    return null;
  }
}