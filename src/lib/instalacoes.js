// Espelho frontend de Infraestrutura/Comissão (ver base44/shared/instalacoes.ts).
// labelKey/descKey são chaves de tradução; label/descricao mantidos como fallback.
export const INSTALACOES = {
  estadio: { labelKey: "inst.estadio", descKey: "inst.estadio.desc", label: "Estádio", emoji: "🏟️", base: 150, fator: 1.28 },
  ct: { labelKey: "inst.ct", descKey: "inst.ct.desc", label: "Centro de Treinamento", emoji: "🏋️", base: 150, fator: 1.28 },
  medico: { labelKey: "inst.medico", descKey: "inst.medico.desc", label: "Departamento Médico", emoji: "🏥", base: 150, fator: 1.28 },
  prep_fisico: { labelKey: "inst.prep_fisico", descKey: "inst.prep_fisico.desc", label: "Preparador Físico", emoji: "🏃", base: 150, fator: 1.28 },
  analista: { labelKey: "inst.analista", descKey: "inst.analista.desc", label: "Analista de Desempenho", emoji: "📊", base: 150, fator: 1.28 },
  auxiliar_tatico: { labelKey: "inst.auxiliar_tatico", descKey: "inst.auxiliar_tatico.desc", label: "Auxiliar Tático", emoji: "🧠", base: 150, fator: 1.28 },
};

export const TIPOS_INSTALACAO = ["estadio", "ct", "medico"];
export const TIPOS_COMISSAO = ["prep_fisico", "analista", "auxiliar_tatico"];

export const CAMPO_NIVEL = {
  estadio: "estadio_nivel",
  ct: "ct_nivel",
  medico: "medico_nivel",
  prep_fisico: "comissao_prep_fisico",
  analista: "comissao_analista",
  auxiliar_tatico: "comissao_auxiliar_tatico",
};

export function custoInstalacao(tipo, nivel) {
  const c = INSTALACOES[tipo];
  return Math.floor(c.base * Math.pow(c.fator, nivel || 0));
}