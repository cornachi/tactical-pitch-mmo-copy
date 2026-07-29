import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Swords } from "lucide-react";

// Indicador no cabeçalho: conta desafios recebidos pendentes.
export default function DesafiosNavItem() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const carregar = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const clubes = await base44.entities.Clube.filter({ user_id: user.id });
        const meu = clubes[0];
        if (!meu) return;
        const pendentes = await base44.entities.DesafioPendente.filter({ desafiado_id: meu.id, status: "PENDENTE" });
        if (active) setCount(pendentes.length || 0);
      } catch (e) { /* ignore */ }
    };
    carregar();
    const interval = setInterval(carregar, 20000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  return (
    <Link to="/desafios" className="relative p-2 rounded-lg hover:bg-accent flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent-foreground">
      <Swords className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}