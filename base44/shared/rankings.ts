// Cálculo dos rankings mensais (compartilhado entre rankingsMensais e encerrarTemporada).
export async function calcularRankingsMensais(base44, clubes, anoMes) {
  const [y, m] = anoMes.split("-").map(Number);
  const inicio = new Date(y, m - 1, 1).getTime();

  const partidas = await base44.asServiceRole.entities.HistoricoPartida.list("-created_date", 10000);
  const doMes = partidas.filter((p) => new Date(p.created_date).getTime() >= inicio);

  const stats = {};
  clubes.forEach((c) => {
    stats[c.id] = {
      vitorias: 0, gols_pro: 0, gols_contra: 0, vitorias_desafio: 0, jogos: 0,
      nome: c.nome_clube, is_bot: c.is_bot,
      cor_principal: c.cor_principal, icone_escudo: c.icone_escudo,
    };
  });

  doMes.forEach((p) => {
    const h = p.desafiante_id, a = p.desafiado_id;
    if (!stats[h] || !stats[a]) return;
    stats[h].jogos++; stats[a].jogos++;
    stats[h].gols_pro += p.placar_home || 0;
    stats[h].gols_contra += p.placar_away || 0;
    stats[a].gols_pro += p.placar_away || 0;
    stats[a].gols_contra += p.placar_home || 0;
    const homeWin = (p.placar_home || 0) > (p.placar_away || 0);
    const awayWin = (p.placar_home || 0) < (p.placar_away || 0);
    if (homeWin) { stats[h].vitorias++; if (p.tipo === "DESAFIO") stats[h].vitorias_desafio++; }
    if (awayWin) { stats[a].vitorias++; if (p.tipo === "DESAFIO") stats[a].vitorias_desafio++; }
  });

  const toList = (arr, valorKey) => arr.map((s, i) => ({
    pos: i + 1, id: s.id, nome: s.nome, is_bot: s.is_bot, valor: s[valorKey],
    cor_principal: s.cor_principal, icone_escudo: s.icone_escudo,
  }));

  const jogadores = Object.entries(stats).map(([id, s]) => ({ id, ...s }));
  const top = (arr, comp, valorKey) => toList(arr.filter((s) => s.jogos > 0).sort(comp).slice(0, 50), valorKey);

  const infra = clubes.map((c) => ({
    id: c.id, nome: c.nome_clube, is_bot: c.is_bot, cor_principal: c.cor_principal, icone_escudo: c.icone_escudo,
    valor: (c.estadio_nivel || 0) + (c.ct_nivel || 0) + (c.medico_nivel || 0),
  })).sort((a, b) => b.valor - a.valor).slice(0, 50).map((s, i) => ({ pos: i + 1, ...s }));

  const comissao = clubes.map((c) => ({
    id: c.id, nome: c.nome_clube, is_bot: c.is_bot, cor_principal: c.cor_principal, icone_escudo: c.icone_escudo,
    valor: (c.comissao_prep_fisico || 0) + (c.comissao_analista || 0) + (c.comissao_auxiliar_tatico || 0),
  })).sort((a, b) => b.valor - a.valor).slice(0, 50).map((s, i) => ({ pos: i + 1, ...s }));

  const global = clubes.slice().sort((a, b) => (b.ranking_elo || 0) - (a.ranking_elo || 0)).slice(0, 100).map((c, i) => ({
    pos: i + 1, id: c.id, nome: c.nome_clube, is_bot: c.is_bot, valor: c.ranking_elo || 0,
    cor_principal: c.cor_principal, icone_escudo: c.icone_escudo,
  }));

  return {
    global,
    vitorias: top(jogadores, (a, b) => b.vitorias - a.vitorias, "vitorias"),
    ataque: top(jogadores, (a, b) => b.gols_pro - a.gols_pro, "gols_pro"),
    defesa: top(jogadores, (a, b) => a.gols_contra - b.gols_contra, "gols_contra"),
    desafios: top(jogadores, (a, b) => b.vitorias_desafio - a.vitorias_desafio, "vitorias_desafio"),
    infra,
    comissao,
  };
}