// Espelho frontend das regras táticas (ver base44/shared/tactical.ts).
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

export function calcularCustoEvolucao(nivelAtual, nomeAtributo, especializacao, ctNivel = 0) {
  const custoBase = 100 * Math.pow(1.15, nivelAtual - 1);
  const categoriaAtributo = CATEGORIA_POR_ATRIBUTO[nomeAtributo];
  const categoriaFavorita = CATEGORIA_DA_ESPECIALIZACAO[especializacao];
  let desconto = 0;
  if (categoriaFavorita && categoriaAtributo === categoriaFavorita) desconto += 0.10;
  desconto += 0.01 * (ctNivel || 0);
  desconto = Math.min(0.85, desconto);
  return Math.floor(custoBase * (1 - desconto));
}