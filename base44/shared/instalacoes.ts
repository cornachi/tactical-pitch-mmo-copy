// Configuração de Infraestrutura e Comissão Técnica (evolução infinita, custo exponencial).
export const INSTALACOES = {
  estadio: { label: "Estádio", emoji: "🏟️", descricao: "+2% de bônus de moedas como mandante por nível", base: 500, fator: 1.18 },
  ct: { label: "Centro de Treinamento", emoji: "🏋️", descricao: "+1% de desconto no custo dos atributos por nível (teto 85%)", base: 400, fator: 1.18 },
  medico: { label: "Departamento Médico", emoji: "🏥", descricao: "Aumenta o teto e a recuperação de energia", base: 350, fator: 1.18 },
  prep_fisico: { label: "Preparador Físico", emoji: "🏃", descricao: "Reduz a perda de dominância por cansaço nos 15' finais", base: 450, fator: 1.2 },
  analista: { label: "Analista de Desempenho", emoji: "📊", descricao: "+1,5% de bônus de moedas em vitórias por nível", base: 450, fator: 1.2 },
  auxiliar_tatico: { label: "Auxiliar Tático", emoji: "🧠", descricao: "Bônus de pontos táticos no atributo mais forte", base: 500, fator: 1.2 },
};

export const CAMPO_NIVEL = {
  estadio: "estadio_nivel",
  ct: "ct_nivel",
  medico: "medico_nivel",
  prep_fisico: "comissao_prep_fisico",
  analista: "comissao_analista",
  auxiliar_tatico: "comissao_auxiliar_tatico",
};

export const TIPOS_INSTALACAO = ["estadio", "ct", "medico"];
export const TIPOS_COMISSAO = ["prep_fisico", "analista", "auxiliar_tatico"];

export function custoInstalacao(tipo, nivel) {
  const c = INSTALACOES[tipo];
  return Math.floor(c.base * Math.pow(c.fator, nivel || 0));
}