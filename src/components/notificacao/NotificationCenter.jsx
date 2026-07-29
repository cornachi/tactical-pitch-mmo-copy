import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Check, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const user = await base44.auth.me();
      const clubes = await base44.entities.Clube.filter({ user_id: user.id });
      const meuClube = clubes[0];
      if (!meuClube) {
        setLoading(false);
        return;
      }
      const lista = await base44.entities.Notificacao.filter({ clube_id: meuClube.id }, "-created_date", 20);
      setNotifs(lista);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const naoLidas = notifs.filter((n) => !n.lida).length;

  const marcarLida = async (id) => {
    await base44.entities.Notificacao.update(id, { lida: true });
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const verRelatorio = (n) => {
    if (!n.partida_id) return;
    if (!n.lida) marcarLida(n.id);
    navigate(`/desafios/relatorio/${n.partida_id}`);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative p-2 rounded-lg hover:bg-accent">
            <Bell className="w-5 h-5" />
            {naoLidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {naoLidas > 9 ? "9+" : naoLidas}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-3 border-b font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" />Notificações
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="p-4 text-sm text-muted-foreground text-center">Carregando...</p>}
            {!loading && notifs.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma notificação.</p>
            )}
            {notifs.map((n) => (
              <div key={n.id} className={`p-3 border-b ${n.lida ? "" : "bg-primary/5"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{n.titulo}</p>
                  {!n.lida && <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.mensagem}</p>
                <div className="flex gap-2 mt-2">
                  {n.partida_id && (
                    <Button size="sm" variant="outline" onClick={() => verRelatorio(n)}>
                      <BarChart3 className="w-3 h-3 mr-1" />Ver Relatório
                    </Button>
                  )}
                  {!n.lida && (
                    <Button size="sm" variant="ghost" onClick={() => marcarLida(n.id)}>
                      <Check className="w-3 h-3 mr-1" />Marcar lida
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}