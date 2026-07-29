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