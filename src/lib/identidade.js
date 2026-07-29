import { Shield, Star, Crown, Flame, Swords, Trophy, Zap, Mountain, Anchor, Feather, Target } from "lucide-react";

export const OPCOES_ICONE = [
  { key: "escudo", label: "Escudo Tático", Icon: Shield },
  { key: "estrela", label: "Estrela", Icon: Star },
  { key: "coroa", label: "Coroa", Icon: Crown },
  { key: "chama", label: "Chama", Icon: Flame },
  { key: "espadas", label: "Espadas", Icon: Swords },
  { key: "trofeu", label: "Troféu", Icon: Trophy },
  { key: "raio", label: "Raio", Icon: Zap },
  { key: "montanha", label: "Montanha", Icon: Mountain },
  { key: "ancora", label: "Âncora", Icon: Anchor },
  { key: "pena", label: "Pena", Icon: Feather },
  { key: "mira", label: "Mira", Icon: Target },
];

export const OPCOES_COR = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#ec4899", "#64748b",
];

export function getIconeEscudo(key) {
  return OPCOES_ICONE.find((o) => o.key === key) || OPCOES_ICONE[0];
}