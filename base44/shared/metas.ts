// Eventos Meta de temporada: modificadores globais ativos que afetam
// todas as partidas do mês. Cada meta beneficia uma especialização.

export const METAS = [
  {
    key: "GRAMADOS_MOLHADOS",
    nome: "Gramados Molhados",
    descricao: "Transições rápidas ganham +10% de efetividade. Times de Contra-Ataque em vantagem.",
    bonusEspecializacao: "CONTRA_ATAQUE",
    bonusTipo: "ataque",
    bonusPct: 0.10,
  },
  {
    key: "CALDEIRAO_DRAGAO",
    nome: "Caldeirão do Dragão",
    descricao: "Times com alta Pressão ganham +15% de poder defensivo.",
    bonusEspecializacao: "PRESSAO",
    bonusTipo: "defesa",
    bonusPct: 0.15,
  },
  {
    key: "POSSE_MAGISTRAL",
    nome: "Posse Magistral",
    descricao: "Construção de jogadas ganha +10% de efetividade. Times de Posse em vantagem.",
    bonusEspecializacao: "POSSE",
    bonusTipo: "ataque",
    bonusPct: 0.10,
  },
  {
    key: "VENTO_FAVORAVEL",
    nome: "Vento Favorável",
    descricao: "Condições equilibradas: times Equilibrados ganham +8% de ataque e defesa.",
    bonusEspecializacao: "EQUILIBRADO",
    bonusTipo: "ambos",
    bonusPct: 0.08,
  },
];

export function getMeta(key) {
  return METAS.find((m) => m.key === key) || null;
}

export function sortearMeta() {
  return METAS[Math.floor(Math.random() * METAS.length)].key;
}

// Aplica o bônus da meta ao poder de ataque/defesa de um clube conforme
// sua especialização.
export function aplicarMetaEfeito(meta, especializacao, atk, def) {
  if (!meta || especializacao !== meta.bonusEspecializacao) return { atk, def };
  const f = 1 + meta.bonusPct;
  if (meta.bonusTipo === "ataque") return { atk: atk * f, def };
  if (meta.bonusTipo === "defesa") return { atk, def: def * f };
  return { atk: atk * f, def: def * f };
}

// Premiação em moedas por posição final no ranking da temporada.
export function premiacaoPorPosicao(pos) {
  if (pos === 1) return 10000000;
  if (pos <= 10) return 5000000;
  if (pos <= 100) return 1000000;
  if (pos <= 1000) return 250000;
  return 25000;
}