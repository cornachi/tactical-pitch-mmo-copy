import { Shield, Star, Crown, Flame, Swords, Trophy, Zap, Mountain, Anchor, Feather, Target } from "lucide-react";

export const OPCOES_ICONE = [
  { key: "escudo", labelKey: "icone.escudo", label: "Escudo Tático", Icon: Shield },
  { key: "estrela", labelKey: "icone.estrela", label: "Estrela", Icon: Star },
  { key: "coroa", labelKey: "icone.coroa", label: "Coroa", Icon: Crown },
  { key: "chama", labelKey: "icone.chama", label: "Chama", Icon: Flame },
  { key: "espadas", labelKey: "icone.espadas", label: "Espadas", Icon: Swords },
  { key: "trofeu", labelKey: "icone.trofeu", label: "Troféu", Icon: Trophy },
  { key: "raio", labelKey: "icone.raio", label: "Raio", Icon: Zap },
  { key: "montanha", labelKey: "icone.montanha", label: "Montanha", Icon: Mountain },
  { key: "ancora", labelKey: "icone.ancora", label: "Âncora", Icon: Anchor },
  { key: "pena", labelKey: "icone.pena", label: "Pena", Icon: Feather },
  { key: "mira", labelKey: "icone.mira", label: "Mira", Icon: Target },
];

export const OPCOES_COR = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#ec4899", "#64748b",
];

export function getIconeEscudo(key) {
  return OPCOES_ICONE.find((o) => o.key === key) || OPCOES_ICONE[0];
}