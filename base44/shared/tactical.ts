// Regras táticas compartilhadas entre as funções de backend.
// Os 18 atributos iniciais e o mapeamento atributo -> categoria que define
// os descontos de custo conforme a especialização do clube.

export const ATRIBUTOS_INICIAIS = [
  { nome: "Passe Curto", categoria: "POSSE" },
  { nome: "Passe Longo", categoria: "POSSE" },
  { nome: "Cruzamento", categoria: "POSSE" },
  { nome: "Visão de Jogo", categoria: "POSSE" },
  { nome: "Controle de Bola", categoria: "POSSE" },
  { nome: "Posicionamento Ofensivo", categoria: "POSSE" },
  { nome: "Velocidade", categoria: "TRANSICAO" },
  { nome: "Drible", categoria: "TRANSICAO" },
  { nome: "Contra-Ataque", categoria: "TRANSICAO" },
  { nome: "Chute de Longa Distância", categoria: "TRANSICAO" },
  { nome: "Mobilidade", categoria: "TRANSICAO" },
  { nome: "Aceleração", categoria: "TRANSICAO" },
  { nome: "Pressão", categoria: "PRESSAO" },
  { nome: "Desarme", categoria: "PRESSAO" },
  { nome: "Interceptação", categoria: "PRESSAO" },
  { nome: "Recuperação", categoria: "PRESSAO" },
  { nome: "Marcação", categoria: "PRESSAO" },
  { nome: "Antecipação", categoria: "PRESSAO" },
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
export function gerarMomentum(attrsHome, attrsAway, dom, placarHome, placarAway, prepHome = 0, prepAway = 0) {
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
    let domHome = dom.dominancia_home + (Math.random() * 20 - 10); // ruído ±10
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
export function gerarLances(desafiante, desafiado, placarHome, placarAway, momentum) {
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
        texto_narrativo: `Aos ${e.minuto}' - ${autor.nome_clube} arma a jogada, o atacante finaliza e É GOOOOOL! A torcida explode!`,
      });
    });
  });

  const TIPOS = [
    { tipo: "CHUTE_PERIGOSO", tpl: (a, m) => `Aos ${m}' - ${a.nome_clube} arrisca de longe, a bola passa raspando a trave!` },
    { tipo: "DEFESA", tpl: (a, m) => `Aos ${m}' - Contra-ataque de ${a.nome_clube}, mas o goleiro voa e faz defesa espetacular!` },
    { tipo: "CARTAO", tpl: (a, m) => `Aos ${m}' - Falta dura e o árbitro mostra cartão amarelo para ${a.nome_clube}.` },
    { tipo: "CONTRA_ATAQUE", tpl: (a, m) => `Aos ${m}' - Recupera a bola e ${a.nome_clube} dispara em contra-ataque em velocidade!` },
    { tipo: "FALTA", tpl: (a, m) => `Aos ${m}' - Falta perigosa na entrada da área cobrada por ${a.nome_clube}... a bola passa perto!` },
  ];

  const alvo = 8 + Math.floor(Math.random() * 5); // 8 a 12
  let tentativas = 0;
  while (lances.length < alvo && tentativas < 60) {
    tentativas++;
    const m = 1 + Math.floor(Math.random() * 90);
    if (ocupados.has(m)) continue;
    ocupados.add(m);
    const t = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    const autor = Math.random() < 0.5 ? desafiante : desafiado;
    lances.push({
      minuto: m,
      tipo: t.tipo,
      clube_autor_id: autor.id,
      texto_narrativo: t.tpl(autor, m),
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