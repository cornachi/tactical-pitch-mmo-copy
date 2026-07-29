import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Check, Lightbulb } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotificationCenter() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightsModal, setInsightsModal] = useState(null);

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

  const verInsights = async (n) => {
    if (!n.partida_id) return;
    try {
      const h = await base44.entities.HistoricoPartida.get(n.partida_id);
      const insights = h.insights?.insights || [];
      setInsightsModal({ placar: `${h.placar_home} x ${h.placar_away}`, insights });
      if (!n.lida) marcarLida(n.id);
    } catch (e) {
      /* ignore */
    }
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
                    <Button size="sm" variant="outline" onClick={() => verInsights(n)}>
                      <Lightbulb className="w-3 h-3 mr-1" />Ver Insights
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

      <Dialog open={!!insightsModal} onOpenChange={(o) => !o && setInsightsModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" />Insights da Partida</DialogTitle>
          </DialogHeader>
          {insightsModal && (
            <div className="space-y-3">
              <p className="text-center text-2xl font-bold">{insightsModal.placar}</p>
              <div className="space-y-2">
                {insightsModal.insights.length > 0 ? (
                  insightsModal.insights.map((t, i) => (
                    <Card key={i} className="p-2 flex gap-2 items-start">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm">{t}</p>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">Sem insights registrados.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}