// Espelho frontend dos Eventos Meta (ver base44/shared/metas.ts).
// nomeKey/descKey são chaves de tradução; nome/descricao mantidos como fallback.
export const METAS = [
  { key: "GRAMADOS_MOLHADOS", nomeKey: "meta.GRAMADOS_MOLHADOS.nome", descKey: "meta.GRAMADOS_MOLHADOS.desc", nome: "Gramados Molhados", descricao: "Transições rápidas ganham +10% de efetividade. Times de Contra-Ataque em vantagem.", bonusEspecializacao: "CONTRA_ATAQUE", bonusTipo: "ataque", bonusPct: 0.10 },
  { key: "CALDEIRAO_DRAGAO", nomeKey: "meta.CALDEIRAO_DRAGAO.nome", descKey: "meta.CALDEIRAO_DRAGAO.desc", nome: "Caldeirão do Dragão", descricao: "Times com alta Pressão ganham +15% de poder defensivo.", bonusEspecializacao: "PRESSAO", bonusTipo: "defesa", bonusPct: 0.15 },
  { key: "POSSE_MAGISTRAL", nomeKey: "meta.POSSE_MAGISTRAL.nome", descKey: "meta.POSSE_MAGISTRAL.desc", nome: "Posse Magistral", descricao: "Construção de jogadas ganha +10% de efetividade. Times de Posse em vantagem.", bonusEspecializacao: "POSSE", bonusTipo: "ataque", bonusPct: 0.10 },
  { key: "VENTO_FAVORAVEL", nomeKey: "meta.VENTO_FAVORAVEL.nome", descKey: "meta.VENTO_FAVORAVEL.desc", nome: "Vento Favorável", descricao: "Condições equilibradas: times Equilibrados ganham +8% de ataque e defesa.", bonusEspecializacao: "EQUILIBRADO", bonusTipo: "ambos", bonusPct: 0.08 },
];

export function getMeta(key) {
  return METAS.find((m) => m.key === key) || null;
}

export function premiacaoPorPosicao(pos) {
  if (pos === 1) return 10000000;
  if (pos <= 10) return 5000000;
  if (pos <= 100) return 1000000;
  if (pos <= 1000) return 250000;
  return 25000;
}