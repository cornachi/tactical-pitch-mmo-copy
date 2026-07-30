// Espelho frontend das regras táticas (ver base44/shared/tactical.ts).
// `nome` é o valor armazenado no banco (PT) — usado para lookup lógico.
// `labelKey` é a chave de tradução usada para exibição.
export const ATRIBUTOS_INICIAIS = [
  { nome: "Organização Ofensiva", categoria: "POSSE", labelKey: "attr.organizacao_ofensiva" },
  { nome: "Ataque Posicional", categoria: "POSSE", labelKey: "attr.ataque_posicional" },
  { nome: "Eficácia de Finalização", categoria: "POSSE", labelKey: "attr.eficacia_finalizacao" },
  { nome: "Passe Entre Linhas", categoria: "POSSE", labelKey: "attr.passe_entre_linhas" },
  { nome: "Bolas Paradas Ofensivas", categoria: "POSSE", labelKey: "attr.bolas_paradas_of" },
  { nome: "Leitura de Jogo", categoria: "POSSE", labelKey: "attr.leitura_jogo" },
  { nome: "Transição Ofensiva", categoria: "TRANSICAO", labelKey: "attr.transicao_ofensiva" },
  { nome: "Transição Defensiva (Perda-Pressiona)", categoria: "TRANSICAO", labelKey: "attr.transicao_defensiva" },
  { nome: "Intensidade de Pressão", categoria: "TRANSICAO", labelKey: "attr.intensidade_pressao" },
  { nome: "Resistência Física", categoria: "TRANSICAO", labelKey: "attr.resistencia_fisica" },
  { nome: "Força de Duelo Individual", categoria: "TRANSICAO", labelKey: "attr.forca_duelo" },
  { nome: "Liderança / Resiliência", categoria: "TRANSICAO", labelKey: "attr.lideranca_resiliencia" },
  { nome: "Organização Defensiva", categoria: "PRESSAO", labelKey: "attr.organizacao_defensiva" },
  { nome: "Defesa de Funil", categoria: "PRESSAO", labelKey: "attr.defesa_funil" },
  { nome: "Pressão no Portador", categoria: "PRESSAO", labelKey: "attr.pressao_portador" },
  { nome: "Bloco Baixo / Cobertura", categoria: "PRESSAO", labelKey: "attr.bloco_baixo" },
  { nome: "Bolas Paradas Defensivas", categoria: "PRESSAO", labelKey: "attr.bolas_paradas_def" },
  { nome: "Concentração Tática", categoria: "PRESSAO", labelKey: "attr.concentracao_tatica" },
];

export const CATEGORIA_POR_ATRIBUTO = Object.fromEntries(
  ATRIBUTOS_INICIAIS.map((a) => [a.nome, a.categoria])
);

// Mapa do nome armazenado (PT) -> chave de tradução, para localizar nomes
// de atributos que vêm do backend (ex: espionagem, recomendações).
export const ATTR_LABEL_BY_NOME = Object.fromEntries(
  ATRIBUTOS_INICIAIS.map((a) => [a.nome, a.labelKey])
);

export function labelAtributo(nome, t) {
  return t(ATTR_LABEL_BY_NOME[nome] || nome);
}

export const CATEGORIA_DA_ESPECIALIZACAO = {
  POSSE: "POSSE",
  CONTRA_ATAQUE: "TRANSICAO",
  PRESSAO: "PRESSAO",
  EQUILIBRADO: null,
};

export const CATEGORIAS = [
  { key: "POSSE", labelKey: "cat.POSSE", especializacao: "POSSE" },
  { key: "TRANSICAO", labelKey: "cat.TRANSICAO", especializacao: "CONTRA_ATAQUE" },
  { key: "PRESSAO", labelKey: "cat.PRESSAO", especializacao: "PRESSAO" },
];

// Valores -> chave de tradução (use t(ESPECIALIZACAO_LABELS[spec])).
export const ESPECIALIZACAO_LABELS = {
  POSSE: "spec.POSSE",
  CONTRA_ATAQUE: "spec.CONTRA_ATAQUE",
  PRESSAO: "spec.PRESSAO",
  EQUILIBRADO: "spec.EQUILIBRADO",
};

export function labelEspecializacao(spec, t) {
  return t(ESPECIALIZACAO_LABELS[spec] || spec);
}

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