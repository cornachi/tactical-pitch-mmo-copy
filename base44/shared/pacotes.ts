export const PACOTES = [
  { id: "iniciante", nome: "Iniciante", moedas: 10000, valor_reais: 4.90, selo: null },
  { id: "treinador", nome: "Treinador", moedas: 50000, valor_reais: 19.90, selo: "Mais Popular" },
  { id: "dirigente", nome: "Dirigente", moedas: 200000, valor_reais: 49.90, selo: null },
  { id: "dono", nome: "Dono de Clube", moedas: 1000000, valor_reais: 149.90, selo: "Melhor Custo-Benefício" },
];

export function getPacote(id) {
  return PACOTES.find((p) => p.id === id) || null;
}