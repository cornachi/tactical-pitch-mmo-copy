// Regras táticas compartilhadas entre as funções de backend.
// Os 18 atributos iniciais e o mapeamento atributo -> categoria que define
// os descontos de custo conforme a especialização do clube.

import { narrar } from "./i18nConteudo.ts";

export const ATRIBUTOS_INICIAIS = [
  { nome: "Organização Ofensiva", categoria: "POSSE" },
  { nome: "Ataque Posicional", categoria: "POSSE" },
  { nome: "Eficácia de Finalização", categoria: "POSSE" },
  { nome: "Passe Entre Linhas", categoria: "POSSE" },
  { nome: "Bolas Paradas Ofensivas", categoria: "POSSE" },
  { nome: "Leitura de Jogo", categoria: "POSSE" },
  { nome: "Transição Ofensiva", categoria: "TRANSICAO" },
  { nome: "Transição Defensiva (Perda-Pressiona)", categoria: "TRANSICAO" },
  { nome: "Intensidade de Pressão", categoria: "TRANSICAO" },
  { nome: "Resistência Física", categoria: "TRANSICAO" },
  { nome: "Força de Duelo Individual", categoria: "TRANSICAO" },
  { nome: "Liderança / Resiliência", categoria: "TRANSICAO" },
  { nome: "Organização Defensiva", categoria: "PRESSAO" },
  { nome: "Defesa de Funil", categoria: "PRESSAO" },
  { nome: "Pressão no Portador", categoria: "PRESSAO" },
  { nome: "Bloco Baixo / Cobertura", categoria: "PRESSAO" },
  { nome: "Bolas Paradas Defensivas", categoria: "PRESSAO" },
  { nome: "Concentração Tática", categoria: "PRESSAO" },
];

export const CATEGORIA_POR_ATRIBUTO = Object.fromEntries(
  ATRIBUTOS_INICIAIS.map((a) => [a.nome, a.categoria])
);

// Categoria cujos atributos recebem desconto para cada especialização.
// EQUILIBRADO não concede desconto em nenhuma categoria.
export const CATEGORIA_DA_ESPECIALIZACAO = {
  POSSE: "POSSE",
  CONTRA_ATAQUE: "TRANSICAO",
  PRESSAO: "PRESSAO",
  EQUILIBRADO: null,
};

// --- Modelos de Jogo (escolha pré-partida) e Matriz de Vantagem Tática ---
// Cycle: ATAQUE_POSICIONAL > BLOCO_BAIXO > TRANSICAO_OFENSIVA > PRESSAO_ALTA > ATAQUE_POSICIONAL
export const MODELOS_JOGO = [
  { key: "ATAQUE_POSICIONAL", label: "Ataque Posicional", emoji: "🎯" },
  { key: "BLOCO_BAIXO", label: "Bloco Baixo / Retranca", emoji: "🛡️" },
  { key: "TRANSICAO_OFENSIVA", label: "Transição Ofensiva", emoji: "⚡" },
  { key: "PRESSAO_ALTA", label: "Pressão Alta (Perda-Pressiona)", emoji: "🔥" },
];

export const MODELO_CONTRA = {
  ATAQUE_POSICIONAL: "BLOCO_BAIXO",
  BLOCO_BAIXO: "TRANSICAO_OFENSIVA",
  TRANSICAO_OFENSIVA: "PRESSAO_ALTA",
  PRESSAO_ALTA: "ATAQUE_POSICIONAL",
};

export const CLIMAS = [
  { key: "ENSOLARADO", label: "Ensolarado", emoji: "☀️" },
  { key: "CHUVA", label: "Chuva Forte", emoji: "🌧️" },
  { key: "CALOR", label: "Calor Extremo", emoji: "🫠" },
];

// Prevê o modelo de jogo mais provável do adversário a partir do seu atributo
// mais forte (categoria) com fallback na especialização.
export function preverModeloJogo(attrs, especializacao) {
  if (attrs && attrs.length) {
    const top = [...attrs].sort((a, b) => (b.nivel || 1) - (a.nivel || 1))[0];
    const cat = CATEGORIA_POR_ATRIBUTO[top.nome_atributo];
    if (cat === "POSSE") return "ATAQUE_POSICIONAL";
    if (cat === "TRANSICAO") return "TRANSICAO_OFENSIVA";
    if (cat === "PRESSAO") return "PRESSAO_ALTA";
  }
  if (especializacao === "POSSE") return "ATAQUE_POSICIONAL";
  if (especializacao === "CONTRA_ATAQUE") return "TRANSICAO_OFENSIVA";
  if (especializacao === "PRESSAO") return "PRESSAO_ALTA";
  return "BLOCO_BAIXO";
}

// Custo exponencial para evoluir do nível atual para o próximo:
//   100 * 1.15^(nivel_atual - 1)
// Aplica 10% de desconto quando a categoria do atributo é a favorecida
// pela especialização do clube.
export function calcularCustoEvolucao(nivelAtual, nomeAtributo, especializacao) {
  const custoBase = 100 * Math.pow(1.15, nivelAtual - 1);
  const categoriaAtributo = CATEGORIA_POR_ATRIBUTO[nomeAtributo];
  const categoriaFavorita = CATEGORIA_DA_ESPECIALIZACAO[especializacao];
  if (categoriaFavorita && categoriaAtributo === categoriaFavorita) {
    return Math.floor(custoBase * 0.9); // 10% de desconto
  }
  return Math.floor(custoBase);
}

// Custo de evolução de atributo considerando também o desconto do Centro de
// Treinamento (ctNivel), com teto acumulado de 85%.
export function calcularCustoEvolucaoComCT(nivelAtual, nomeAtributo, especializacao, ctNivel) {
  const base = 100 * Math.pow(1.15, nivelAtual - 1);
  const catFav = CATEGORIA_DA_ESPECIALIZACAO[especializacao];
  let desconto = 0;
  if (catFav && CATEGORIA_POR_ATRIBUTO[nomeAtributo] === catFav) desconto += 0.10;
  desconto += 0.01 * (ctNivel || 0);
  desconto = Math.min(0.85, desconto);
  return Math.floor(base * (1 - desconto));
}

// --- Motor de simulação de partidas ---

// Categorias ofensivas (posse/construção + transição/contra-ataque) e defensivas.
export const CATEGORIAS_ATAQUE = ["POSSE", "TRANSICAO"];
export const CATEGORIAS_DEFESA = ["PRESSAO"];

export function poderAtaque(atributos) {
  return atributos
    .filter((a) => CATEGORIAS_ATAQUE.includes(CATEGORIA_POR_ATRIBUTO[a.nome_atributo]))
    .reduce((s, a) => s + (a.nivel || 1), 0);
}

export function poderDefesa(atributos) {
  return atributos
    .filter((a) => CATEGORIAS_DEFESA.includes(CATEGORIA_POR_ATRIBUTO[a.nome_atributo]))
    .reduce((s, a) => s + (a.nivel || 1), 0);
}

// Efetividade ofensiva: quanto do ataque supera a defesa do rival (0..1).
export function efetividadeAtaque(ataque, defesaRival) {
  if (ataque + defesaRival === 0) return 0.5;
  return ataque / (ataque + defesaRival);
}

// Dominância (%) e xG base a partir dos poderes de ataque/defesa de cada lado.
export function calcularDominancia(atkHome, defAway, atkAway, defHome) {
  const effHome = efetividadeAtaque(atkHome, defAway);
  const effAway = efetividadeAtaque(atkAway, defHome);
  const xgHome = +(effHome * 3.0).toFixed(2);
  const xgAway = +(effAway * 3.0).toFixed(2);
  const total = xgHome + xgAway;
  const dominancia_home = total === 0 ? 50 : Math.round((xgHome / total) * 100);
  return {
    dominancia_home,
    dominancia_away: 100 - dominancia_home,
    xg_home: xgHome,
    xg_away: xgAway,
  };
}

// Amostragem de Poisson (Knuth) para obter o placar a partir do xG esperado.
export function amostraPoisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// Atualização de ELO clássica. scoreA: 1 (vitória), 0.5 (empate), 0 (derrota).
export function atualizarElo(ratingA, ratingB, scoreA, k = 32) {
  const expA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expB = 1 - expA;
  return {
    novoA: Math.round(ratingA + k * (scoreA - expA)),
    novoB: Math.round(ratingB + k * ((1 - scoreA) - expB)),
  };
}

// Poder físico/pressão (categoria PRESSAO) — usado para simular cansaço nos blocos finais.
export function poderFisico(atributos) {
  return atributos
    .filter((a) => CATEGORIA_POR_ATRIBUTO[a.nome_atributo] === "PRESSAO")
    .reduce((s, a) => s + (a.nivel || 1), 0);
}

// Gera o momentum da partida dividido em 6 blocos de 15 minutos.
// Cada bloco traz dominância, posse, xG, chutes e eventos (gols/cartões) com minuto exato.
// Nos blocos 61-75' e 76-90' aplica queda de dominância se o físico/pressão for baixo.
export function gerarMomentum(attrsHome, attrsAway, dom, placarHome, placarAway, prepHome = 0, prepAway = 0, estadioHome = 0) {
  const blocos = [
    { rotulo: "0-15", inicio: 0, fim: 15 },
    { rotulo: "16-30", inicio: 16, fim: 30 },
    { rotulo: "31-45", inicio: 31, fim: 45 },
    { rotulo: "46-60", inicio: 46, fim: 60 },
    { rotulo: "61-75", inicio: 61, fim: 75 },
    { rotulo: "76-90", inicio: 76, fim: 90 },
  ];
  const fisHome = poderFisico(attrsHome);
  const fisAway = poderFisico(attrsAway);
  const baseFis = 18; // referência média (6 atributos ~nível 3)

  const dados = blocos.map((b, i) => {
    let domHome = dom.dominancia_home + (Math.random() * 20 - 10) + (estadioHome || 0) * 0.25; // ruído ±10 + moral do estádio (fator casa ampliado pelas instalações)
    // cansaço nos dois últimos blocos: quem tem menos físico perde dominância
    if (i >= 4) {
      const redHome = Math.min(0.8, 0.1 * (prepHome || 0));
      const redAway = Math.min(0.8, 0.1 * (prepAway || 0));
      const fadigaHome = Math.max(0, ((baseFis - fisHome) / baseFis) * 12) * (1 - redHome);
      const fadigaAway = Math.max(0, ((baseFis - fisAway) / baseFis) * 12) * (1 - redAway);
      domHome = domHome - fadigaHome + fadigaAway * 0.5;
    }
    domHome = Math.max(5, Math.min(95, Math.round(domHome)));
    const domAway = 100 - domHome;
    const posseHome = Math.max(30, Math.min(70, Math.round(domHome + (Math.random() * 6 - 3))));
    const xgHome = +(((domHome / 100) * (dom.xg_home / 6)) * (0.6 + Math.random() * 0.9)).toFixed(2);
    const xgAway = +(((domAway / 100) * (dom.xg_away / 6)) * (0.6 + Math.random() * 0.9)).toFixed(2);
    const chutesHome = Math.max(0, Math.round(xgHome * (2 + Math.random() * 2)));
    const chutesAway = Math.max(0, Math.round(xgAway * (2 + Math.random() * 2)));
    return {
      rotulo: b.rotulo,
      inicio: b.inicio,
      fim: b.fim,
      dominancia_pct: { home: domHome, away: domAway },
      posse_pct: { home: posseHome, away: 100 - posseHome },
      xg_intervalo: { home: xgHome, away: xgAway },
      chutes: { home: chutesHome, away: chutesAway },
      eventos: [],
    };
  });

  // Distribui os gols reais em blocos, ponderando pela dominância do lado que marca.
  const distribuirGols = (qtd, lado) => {
    for (let g = 0; g < qtd; g++) {
      const pesos = dados.map((d) => Math.max(1, lado === "home" ? d.dominancia_pct.home : d.dominancia_pct.away));
      const total = pesos.reduce((s, p) => s + p, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (let j = 0; j < pesos.length; j++) {
        r -= pesos[j];
        if (r <= 0) { idx = j; break; }
      }
      const bloco = dados[idx];
      const minuto = bloco.inicio + Math.floor(Math.random() * (bloco.fim - bloco.inicio + 1));
      bloco.eventos.push({ tipo: "gol", lado, minuto });
    }
  };
  distribuirGols(placarHome, "home");
  distribuirGols(placarAway, "away");

  // Eventos disciplinares aleatórios.
  const numCards = Math.floor(Math.random() * 4);
  for (let c = 0; c < numCards; c++) {
    const idx = Math.floor(Math.random() * 6);
    const bloco = dados[idx];
    const minuto = bloco.inicio + Math.floor(Math.random() * (bloco.fim - bloco.inicio + 1));
    const lado = Math.random() < 0.5 ? "home" : "away";
    bloco.eventos.push({ tipo: Math.random() < 0.2 ? "vermelho" : "amarelo", lado, minuto });
  }

  dados.forEach((d) => d.eventos.sort((a, b) => a.minuto - b.minuto));
  return dados;
}

// Gera o feed de narração (lances_narracao) cobrindo os 90 minutos.
// Inclui os gols reais (no minuto exato) mais 8-12 lances marcantes.
export function gerarLances(desafiante, desafiado, placarHome, placarAway, momentum, idioma = "pt") {
  const lances = [];
  const ocupados = new Set();

  momentum.forEach((b) => {
    b.eventos.filter((e) => e.tipo === "gol").forEach((e) => {
      const autor = e.lado === "home" ? desafiante : desafiado;
      ocupados.add(e.minuto);
      lances.push({
        minuto: e.minuto,
        tipo: "GOL",
        clube_autor_id: autor.id,
        texto_narrativo: narrar("GOL", autor.nome_clube, e.minuto, idioma),
      });
    });
  });

  const TIPOS = ["CHUTE_PERIGOSO", "DEFESA", "CARTAO_AMARELO", "CONTRA_ATAQUE", "FALTA"];

  const alvo = 8 + Math.floor(Math.random() * 5); // 8 a 12
  let tentativas = 0;
  while (lances.length < alvo && tentativas < 60) {
    tentativas++;
    const m = 1 + Math.floor(Math.random() * 90);
    if (ocupados.has(m)) continue;
    ocupados.add(m);
    const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    const autor = Math.random() < 0.5 ? desafiante : desafiado;
    lances.push({
      minuto: m,
      tipo,
      clube_autor_id: autor.id,
      texto_narrativo: narrar(tipo, autor.nome_clube, m, idioma),
    });
  }

  lances.sort((a, b) => a.minuto - b.minuto);
  return lances;
}

// Gera cartões amarelos e expulsões (vermelhos) ponderados pela agressividade
// (poder defensivo / pressão) de cada lado. Retorna eventos narráveis e a lista
// de expulsões para aplicação da penalidade de -20% no momentum/stamina.
export function gerarCartoes(defHome, defAway) {
  const eventos = [];
  const expulsoes = [];
  const minuto = () => 1 + Math.floor(Math.random() * 89);
  for (const [lado, def] of [["home", defHome], ["away", defAway]]) {
    const agressividade = def || 6;
    const nAmarelos = Math.min(4, Math.floor(agressividade / 22) + Math.floor(Math.random() * 2));
    for (let i = 0; i < nAmarelos; i++) eventos.push({ minuto: minuto(), lado, tipo: "amarelo" });
    const chanceVerm = 0.06 + agressividade / 260;
    if (Math.random() < chanceVerm) {
      const m = minuto();
      eventos.push({ minuto: m, lado, tipo: "vermelho" });
      expulsoes.push({ lado, minuto: m });
    }
  }
  return { eventos, expulsoes };
}

// Catálogo de ações da partida. Cada ação confronta um atributo de ataque (lado
// que age) contra um atributo de defesa (lado que defende). O sucesso de cada
// duelo resulta do confronto direto entre os níveis investidos em cada atributo.
const ACOES = [
  { key: "PASSE", atk: "Passe Entre Linhas", def: "Pressão no Portador", cat: "tecnica" },
  { key: "CONSTRUCAO", atk: "Organização Ofensiva", def: "Bloco Baixo / Cobertura", cat: "tecnica" },
  { key: "CRIACAO", atk: "Leitura de Jogo", def: "Organização Defensiva", cat: "tecnica" },
  { key: "POSICIONAL", atk: "Ataque Posicional", def: "Defesa de Funil", cat: "tecnica" },
  { key: "DUELO", atk: "Força de Duelo Individual", def: "Força de Duelo Individual", cat: "fisico" },
  { key: "TRANSICAO", atk: "Transição Ofensiva", def: "Transição Defensiva (Perda-Pressiona)", cat: "transicao" },
  { key: "FINALIZACAO", atk: "Eficácia de Finalização", def: "Defesa de Funil", cat: "finalizacao" },
  { key: "PRESSAO", atk: "Intensidade de Pressão", def: "Passe Entre Linhas", cat: "pressao" },
  { key: "DESARME", atk: "Pressão no Portador", def: "Passe Entre Linhas", cat: "pressao" },
  { key: "BOLAS_PARADAS", atk: "Bolas Paradas Ofensivas", def: "Bolas Paradas Defensivas", cat: "bola_parada" },
  { key: "RESILIENCIA", atk: "Liderança / Resiliência", def: "Intensidade de Pressão", cat: "mental" },
  { key: "CONCENTRACAO", atk: "Concentração Tática", def: "Ataque Posicional", cat: "mental" },
  { key: "RESISTENCIA", atk: "Resistência Física", def: "Resistência Física", cat: "fisico" },
];

// Ponderação das ações por especialização. Times de Posse geram muito mais
// passes/construção/criação; Contra-Ataque privilegia transições e duelos;
// Pressão privilegia pressão e desarme; Equilibrado é neutro. Isto garante a
// consistência tática: o estilo adotado determina quais atributos são exigidos.
const PESOS_POR_ESP = {
  POSSE: { PASSE: 3.0, CONSTRUCAO: 3.0, CRIACAO: 2.5, POSICIONAL: 2.0, DUELO: 1.0, TRANSICAO: 0.5, FINALIZACAO: 1.5, PRESSAO: 0.4, DESARME: 0.4, BOLAS_PARADAS: 0.6, RESILIENCIA: 0.6, CONCENTRACAO: 0.6, RESISTENCIA: 1.0 },
  CONTRA_ATAQUE: { PASSE: 1.0, CONSTRUCAO: 0.6, CRIACAO: 1.0, POSICIONAL: 0.5, DUELO: 2.0, TRANSICAO: 3.0, FINALIZACAO: 1.5, PRESSAO: 1.0, DESARME: 1.5, BOLAS_PARADAS: 0.6, RESILIENCIA: 1.2, CONCENTRACAO: 1.0, RESISTENCIA: 1.5 },
  PRESSAO: { PASSE: 1.0, CONSTRUCAO: 0.5, CRIACAO: 1.0, POSICIONAL: 0.6, DUELO: 2.0, TRANSICAO: 1.5, FINALIZACAO: 1.0, PRESSAO: 3.0, DESARME: 3.0, BOLAS_PARADAS: 0.6, RESILIENCIA: 1.5, CONCENTRACAO: 1.5, RESISTENCIA: 1.8 },
  EQUILIBRADO: { PASSE: 1.3, CONSTRUCAO: 1.3, CRIACAO: 1.3, POSICIONAL: 1.3, DUELO: 1.3, TRANSICAO: 1.3, FINALIZACAO: 1.3, PRESSAO: 1.3, DESARME: 1.3, BOLAS_PARADAS: 1.0, RESILIENCIA: 1.0, CONCENTRACAO: 1.0, RESISTENCIA: 1.3 },
};

// Engine dinâmica de atributos demandados. A cada bloco da partida, sorteia
// ações conforme a especialização do lado que está com a bola e resolve cada
// uma como duelo direto entre o atributo de ataque (em ação) e o de defesa
// (adversário). Registra demandas e sucessos por atributo/equipe e devolve o
// Top 10 mais exigidos (por volume de ações) com o índice de sucesso real.
export function gerarAtributosDemandados(attrsHome, attrsAway, espHome, espAway, momentum, infraHome, infraAway) {
  const nivelHome = Object.fromEntries((attrsHome || []).map((a) => [a.nome_atributo, a.nivel || 1]));
  const nivelAway = Object.fromEntries((attrsAway || []).map((a) => [a.nome_atributo, a.nivel || 1]));
  const getNivel = (side, attr) => (side === "home" ? nivelHome[attr] : nivelAway[attr]) || 1;

  const acc = { home: {}, away: {} };
  const addDemand = (side, attr, success) => {
    if (!acc[side][attr]) acc[side][attr] = { solicitacoes: 0, sucessos: 0 };
    acc[side][attr].solicitacoes++;
    if (success) acc[side][attr].sucessos++;
  };

  const drawAction = (esp) => {
    const pesos = PESOS_POR_ESP[esp] || PESOS_POR_ESP.EQUILIBRADO;
    const total = ACOES.reduce((s, a) => s + (pesos[a.key] || 0), 0);
    let r = Math.random() * total;
    for (const a of ACOES) {
      r -= (pesos[a.key] || 0);
      if (r <= 0) return a;
    }
    return ACOES[ACOES.length - 1];
  };

  (momentum || []).forEach((b, idx) => {
    const domHome = (b.posse_pct?.home || 50) >= 50;
    const acting = domHome ? "home" : "away";
    const defending = domHome ? "away" : "home";
    const espActing = acting === "home" ? espHome : espAway;
    const domPct = Math.max(b.posse_pct?.home || 50, b.posse_pct?.away || 50);
    const intensidade = 10 + Math.round(domPct / 8);
    for (let i = 0; i < intensidade; i++) {
      const a = drawAction(espActing);
      let atkNivel = getNivel(acting, a.atk);
      let defNivel = getNivel(defending, a.def);
      // Infraestrutura: Centro de Treinamento reduz erros técnicos (passe/construção/criação);
      // Estádio amplifica a moral do mandante (fator casa) no duelo.
      if (a.cat === "tecnica") {
        const ct = acting === "home" ? (infraHome?.ct_nivel || 0) : (infraAway?.ct_nivel || 0);
        atkNivel *= (1 + ct * 0.02);
      }
      if (acting === "home") atkNivel *= (1 + (infraHome?.estadio_nivel || 0) * 0.015);
      // Fadiga no 2º tempo afeta ações físicas e transições.
      if (idx >= 4 && (a.cat === "fisico" || a.cat === "transicao")) {
        atkNivel *= 0.9;
        defNivel *= 0.9;
      }
      const prob = atkNivel / (atkNivel + defNivel + 0.01);
      const atkSuccess = Math.random() < prob;
      addDemand(acting, a.atk, atkSuccess);
      addDemand(defending, a.def, !atkSuccess);
    }
  });

  const attrSet = new Set([...Object.keys(acc.home), ...Object.keys(acc.away)]);
  const pct = (s) => (s.solicitacoes === 0 ? 0 : Math.round((s.sucessos / s.solicitacoes) * 100));
  const lista = [...attrSet]
    .map((attr) => {
      const sH = acc.home[attr] || { solicitacoes: 0, sucessos: 0 };
      const sA = acc.away[attr] || { solicitacoes: 0, sucessos: 0 };
      return {
        atributo: attr,
        volume: sH.solicitacoes + sA.solicitacoes,
        solicitacoes: { home: sH.solicitacoes, away: sA.solicitacoes },
        sucesso: { home: pct(sH), away: pct(sA) },
      };
    })
    .filter((a) => a.volume > 0)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);
  return lista;
}

// Painel pós-jogo: gerais (chutes, chutes a gol, posse, faltas e cartões
// extraídos dos lances reais) + Top 10 de atributos demandados gerado pela
// engine dinâmica de duelos (sem lista fixa).
export function gerarEstatisticas(attrsHome, attrsAway, espHome, espAway, desafianteId, desafiadoId, lances, momentum, placarHome, placarAway, xgHome, xgAway, infraHome, infraAway) {
  const chutesHome = momentum.reduce((s, b) => s + (b.chutes?.home || 0), 0);
  const chutesAway = momentum.reduce((s, b) => s + (b.chutes?.away || 0), 0);
  const chutesGolHome = Math.min(chutesHome, Math.round((xgHome || 0) * 2.2 + (placarHome || 0)));
  const chutesGolAway = Math.min(chutesAway, Math.round((xgAway || 0) * 2.2 + (placarAway || 0)));
  const posseHome = momentum.length ? Math.round(momentum.reduce((s, b) => s + (b.posse_pct?.home || 0), 0) / momentum.length) : 50;

  let faltasHome = 0, faltasAway = 0, amarelosHome = 0, amarelosAway = 0, vermelhosHome = 0, vermelhosAway = 0;
  (lances || []).forEach((l) => {
    const side = l.clube_autor_id === desafianteId ? "home" : "away";
    if (l.tipo === "FALTA" || l.tipo === "CARTAO_AMARELO" || l.tipo === "CARTAO_VERMELHO") {
      if (side === "home") faltasHome++; else faltasAway++;
    }
    if (l.tipo === "CARTAO_AMARELO") { if (side === "home") amarelosHome++; else amarelosAway++; }
    if (l.tipo === "CARTAO_VERMELHO") { if (side === "home") vermelhosHome++; else vermelhosAway++; }
  });

  const atributos = gerarAtributosDemandados(attrsHome, attrsAway, espHome, espAway, momentum, infraHome, infraAway);

  return {
    gerais: {
      chutes: { home: chutesHome, away: chutesAway },
      chutes_gol: { home: chutesGolHome, away: chutesGolAway },
      posse: { home: posseHome, away: 100 - posseHome },
      faltas: { home: faltasHome, away: faltasAway },
      amarelos: { home: amarelosHome, away: amarelosAway },
      vermelhos: { home: vermelhosHome, away: vermelhosAway },
    },
    atributos,
  };
}