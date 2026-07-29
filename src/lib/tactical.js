// Espelho frontend das regras táticas (ver base44/shared/tactical.ts).
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

export const CATEGORIA_DA_ESPECIALIZACAO = {
  POSSE: "POSSE",
  CONTRA_ATAQUE: "TRANSICAO",
  PRESSAO: "PRESSAO",
  EQUILIBRADO: null,
};

export const CATEGORIAS = [
  { key: "POSSE", label: "Posse & Construção", especializacao: "POSSE" },
  { key: "TRANSICAO", label: "Transição & Contra-Ataque", especializacao: "CONTRA_ATAQUE" },
  { key: "PRESSAO", label: "Pressão & Desarme", especializacao: "PRESSAO" },
];

export const ESPECIALIZACAO_LABELS = {
  POSSE: "Posse",
  CONTRA_ATAQUE: "Contra-Ataque",
  PRESSAO: "Pressão",
  EQUILIBRADO: "Equilibrado",
};

export function calcularCustoEvolucao(nivelAtual, nomeAtributo, especializacao) {
  const custoBase = 100 * Math.pow(1.15, nivelAtual - 1);
  const categoriaAtributo = CATEGORIA_POR_ATRIBUTO[nomeAtributo];
  const categoriaFavorita = CATEGORIA_DA_ESPECIALIZACAO[especializacao];
  if (categoriaFavorita && categoriaAtributo === categoriaFavorita) {
    return Math.floor(custoBase * 0.9);
  }
  return Math.floor(custoBase);
}