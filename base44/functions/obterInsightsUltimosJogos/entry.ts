import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Análise tática das últimas 10 partidas do clube, agrupando os adversários
// em 4 perfis (Equilibrado, Pressão, Posse, Contra-Ataque) conforme a especialização.
const PERFIS = ['EQUILIBRADO', 'PRESSAO', 'POSSE', 'CONTRA_ATAQUE'];
const PERFIL_INFO = {
  EQUILIBRADO: { label: 'Equilibrado', emoji: '⚖️' },
  PRESSAO: { label: 'Pressão', emoji: '⚡' },
  POSSE: { label: 'Posse de Bola', emoji: '🎯' },
  CONTRA_ATAQUE: { label: 'Contra-Ataque', emoji: '🏹' },
};

const RECOMENDACOES = {
  CONTRA_ATAQUE: {
    atributos: ['Organização Defensiva', 'Defesa de Funil', 'Leitura de Jogo', 'Transição Defensiva (Perda-Pressiona)'],
    ajuste: 'Adote o estilo Pressão para recuperar a bola mais cedo e cortar as transições, ou reforce a defesa investindo no Auxiliar Tático.',
  },
  PRESSAO: {
    atributos: ['Passe Entre Linhas', 'Organização Ofensiva', 'Leitura de Jogo', 'Ataque Posicional'],
    ajuste: 'Adote o estilo Posse para cadenciar e escapar da pressão alta, e invista no Preparador Físico para sustentar a saída de bola.',
  },
  POSSE: {
    atributos: ['Pressão no Portador', 'Intensidade de Pressão', 'Defesa de Funil', 'Transição Ofensiva'],
    ajuste: 'Adote o estilo Pressão ou Contra-Ataque para roubar a bola do time de posse e puni-lo em transição rápida.',
  },
  EQUILIBRADO: {
    atributos: ['Organização Ofensiva', 'Organização Defensiva', 'Ataque Posicional'],
    ajuste: 'Equilibre ataque e defesa; evolua o Auxiliar Tático para reforçar o atributo mais forte do seu elenco.',
  },
};

function gerarDiagnostico(perfil, gpMed, gcMed, posse) {
  const nome = PERFIL_INFO[perfil].label;
  if (perfil === 'PRESSAO') {
    if (posse < 45) return `Perda excessiva de bola na saída defensiva sob pressão alta — apenas ${Math.round(posse)}% de posse contra times de ${nome}.`;
    if (gcMed > 1.3) return `A pressão alta provoca erros defensivos: você sofre em média ${gcMed.toFixed(1)} gols contra ${nome}.`;
    return `Dificuldade em sair jogando sob a pressão de times de ${nome}.`;
  }
  if (perfil === 'CONTRA_ATAQUE') {
    if (gpMed < 1) return `Baixa conversão de chances contra blocos baixos — média de apenas ${gpMed.toFixed(1)} gols a favor contra ${nome}.`;
    if (gcMed > 1.3) return `Vulnerabilidade em transições defensivas: sofre ${gcMed.toFixed(1)} gols por jogo em contra-ataques de ${nome}.`;
    return `O time é pego no contra-ataque de ${nome} com frequência.`;
  }
  if (perfil === 'POSSE') {
    if (posse < 45) return `Perde a disputa de posse contra times de ${nome} (apenas ${Math.round(posse)}% de posse).`;
    if (gpMed < 1) return `Dificuldade em criar chances contra a posse cadenciada de ${nome}.`;
    return `O controle de bola do adversário (${nome}) domina o jogo.`;
  }
  if (gpMed < 1) return `Baixa conversão ofensiva contra times equilibrados.`;
  if (gcMed > 1.3) return `Defesa cede gols demais contra times equilibrados (${gcMed.toFixed(1)}/jogo).`;
  return `Rendimento equilibrado, mas sem superioridade clara contra ${nome}.`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clubes = await base44.asServiceRole.entities.Clube.filter({ user_id: user.id });
    const meu = clubes[0];
    if (!meu) return Response.json({ error: 'Clube não encontrado' }, { status: 404 });

    const [comoHome, comoAway] = await Promise.all([
      base44.asServiceRole.entities.HistoricoPartida.filter({ desafiante_id: meu.id }, '-created_date', 10),
      base44.asServiceRole.entities.HistoricoPartida.filter({ desafiado_id: meu.id }, '-created_date', 10),
    ]);
    const vistos = new Set();
    const partidas = [...comoHome, ...comoAway]
      .filter((p) => { if (vistos.has(p.id)) return false; vistos.add(p.id); return true; })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10);

    const oppIds = new Set();
    partidas.forEach((p) => oppIds.add(p.desafiante_id === meu.id ? p.desafiado_id : p.desafiante_id));
    const oppMap = {};
    await Promise.all([...oppIds].map(async (id) => {
      try { oppMap[id] = await base44.asServiceRole.entities.Clube.get(id); } catch (e) { /* ignore */ }
    }));

    const agg = {};
    PERFIS.forEach((p) => agg[p] = { jogos: 0, V: 0, E: 0, D: 0, golsPro: 0, golsContra: 0, posseSum: 0 });
    const overall = { jogos: 0, V: 0, E: 0, D: 0, golsPro: 0, golsContra: 0, posseSum: 0 };

    partidas.forEach((p) => {
      const souHome = p.desafiante_id === meu.id;
      const oppId = souHome ? p.desafiado_id : p.desafiante_id;
      const opp = oppMap[oppId];
      const perfil = (opp && PERFIS.includes(opp.especializacao)) ? opp.especializacao : 'EQUILIBRADO';
      const gp = souHome ? (p.placar_home || 0) : (p.placar_away || 0);
      const gc = souHome ? (p.placar_away || 0) : (p.placar_home || 0);
      const domHome = p.dominancia_home ?? 50;
      const posse = souHome ? domHome : 100 - domHome;
      const res = gp > gc ? 'V' : gp < gc ? 'D' : 'E';

      overall.jogos++; overall.golsPro += gp; overall.golsContra += gc; overall.posseSum += posse;
      if (res === 'V') overall.V++; else if (res === 'E') overall.E++; else overall.D++;

      const a = agg[perfil];
      a.jogos++; a.golsPro += gp; a.golsContra += gc; a.posseSum += posse;
      if (res === 'V') a.V++; else if (res === 'E') a.E++; else a.D++;
    });

    const ap = (V, E, j) => j > 0 ? Math.round((V * 3 + E) / (j * 3) * 100) : 0;

    const overallRes = {
      jogos: overall.jogos,
      vitorias: overall.V, empates: overall.E, derrotas: overall.D,
      gols_pro: overall.golsPro, gols_contra: overall.golsContra,
      posse_media: overall.jogos ? Math.round(overall.posseSum / overall.jogos) : 0,
      aproveitamento: ap(overall.V, overall.E, overall.jogos),
    };

    const perfis = PERFIS.map((p) => {
      const a = agg[p];
      const jogos = a.jogos;
      const gpMed = jogos ? a.golsPro / jogos : 0;
      const gcMed = jogos ? a.golsContra / jogos : 0;
      const posseMed = jogos ? Math.round(a.posseSum / jogos) : 0;
      const aprov = ap(a.V, a.E, jogos);
      const info = PERFIL_INFO[p];
      const diagnostico = jogos > 0 ? gerarDiagnostico(p, gpMed, gcMed, posseMed) : 'Sem confrontos registrados neste perfil.';
      const mostrarPlano = jogos > 0 && aprov < 50;
      const rec = RECOMENDACOES[p];
      return {
        especializacao: p, label: info.label, emoji: info.emoji,
        jogos, vitorias: a.V, empates: a.E, derrotas: a.D,
        gols_pro_med: +gpMed.toFixed(2), gols_contra_med: +gcMed.toFixed(2),
        posse_media: posseMed, aproveitamento: aprov,
        diagnostico,
        alerta: mostrarPlano,
        recomendacoes: mostrarPlano ? { atributos: rec.atributos, ajuste: rec.ajuste } : null,
      };
    });

    const cand = perfis.filter((p) => p.jogos >= 2).sort((a, b) => a.aproveitamento - b.aproveitamento);
    const pior = cand[0] && cand[0].aproveitamento < 50 ? cand[0] : null;

    return Response.json({ success: true, overall: overallRes, perfis, pior_perfil: pior });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}