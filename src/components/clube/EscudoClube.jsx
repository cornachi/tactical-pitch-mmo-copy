import React from "react";
import { getIconeEscudo } from "@/lib/identidade";

export default function EscudoClube({ clube, size = 40, className = "" }) {
  const { Icon } = getIconeEscudo(clube?.icone_escudo);
  const cor = (clube && clube.cor_principal) || "#3b82f6";
  const corSec = (clube && clube.cor_secundaria) || "#ffffff";
  return (
    <div
      className={`flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: cor,
        color: corSec,
        border: `2px solid ${corSec}55`,
      }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}