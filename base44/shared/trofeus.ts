// Troféus e Pontos de Glória Históricos para o Hall da Fama.
export const PONTOS_GLORIA = {
  RANKING_GLOBAL: { CAMPEAO: 100, VICE: 0 },
  COPA_CAMPEOES: { CAMPEAO: 50, VICE: 10 },
  TORNEIO_8: { CAMPEAO: 15, VICE: 10 },
};

export async function registrarTrofeu(base44, { clube_id, tipo, colocacao, edicao, data_conquista }) {
  if (!clube_id || !tipo || !colocacao) return null;
  try {
    return await base44.asServiceRole.entities.Trofeu.create({
      clube_id,
      tipo,
      colocacao,
      edicao: edicao || "",
      data_conquista: data_conquista || new Date().toISOString().slice(0, 10),
    });
  } catch (e) {
    return null;
  }
}

// Agrega todos os troféus por clube e calcula os Pontos de Glória Históricos,
// retornando a lista ordenada para o Hall da Fama.
export async function calcularHallDaFama(base44) {
  const trofeus = await base44.asServiceRole.entities.Trofeu.list("-created_date", 10000);
  const clubes = await base44.asServiceRole.entities.Clube.list("-created_date", 10000);
  const clubeMap = {};
  clubes.forEach((c) => { clubeMap[c.id] = c; });

  const acc = {};
  const zeroContadores = () => ({
    titulos: { RANKING_GLOBAL: 0, COPA_CAMPEOES: 0, TORNEIO_8: 0 },
    vices: { RANKING_GLOBAL: 0, COPA_CAMPEOES: 0, TORNEIO_8: 0 },
  });

  trofeus.forEach((tr) => {
    if (!acc[tr.clube_id]) acc[tr.clube_id] = { id: tr.clube_id, pontos: 0, ...zeroContadores() };
    const pts = PONTOS_GLORIA[tr.tipo]?.[tr.colocacao] || 0;
    acc[tr.clube_id].pontos += pts;
    if (tr.colocacao === "CAMPEAO") acc[tr.clube_id].titulos[tr.tipo] += 1;
    else if (tr.colocacao === "VICE") acc[tr.clube_id].vices[tr.tipo] += 1;
  });

  return Object.values(acc)
    .map((a) => {
      const c = clubeMap[a.id] || {};
      return {
        id: a.id,
        nome: c.nome_clube || "—",
        is_bot: c.is_bot,
        cor_principal: c.cor_principal,
        icone_escudo: c.icone_escudo,
        pontos: a.pontos,
        titulos: a.titulos,
        vices: a.vices,
      };
    })
    .sort((a, b) => b.pontos - a.pontos);
}