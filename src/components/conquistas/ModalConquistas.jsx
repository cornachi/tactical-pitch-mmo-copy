import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Coins, Sparkles, Lock, Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function ModalConquistas({ clubeId, open, onOpenChange, onResgatado }) {
  const { t } = useI18n();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resgatando, setResgatando] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("conquistas", { acao: "status", clube_id: clubeId });
      const data = res?.data ?? res;
      if (data?.error) setErro(data.error);
      else setLista(data.conquistas || []);
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) carregar();
  }, [open, clubeId]);

  const resgatar = async (titulo) => {
    setResgatando(titulo);
    setErro("");
    try {
      const res = await base44.functions.invoke("conquistas", { acao: "resgatar", clube_id: clubeId, titulo });
      const data = res?.data ?? res;
      if (data?.error) {
        setErro(data.error);
      } else {
        await carregar();
        if (onResgatado) onResgatado();
      }
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setResgatando(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />{t("conquistas.titulo")}
          </DialogTitle>
        </DialogHeader>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t("common.carregando")}</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {lista.map((c) => {
              const pct = Math.min(100, Math.round((c.atual / c.meta) * 100));
              return (
                <Card key={c.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {c.resgatada ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : c.desbloqueada ? (
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{c.titulo}</p>
                        <p className="text-xs text-muted-foreground">{c.descricao}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold flex items-center gap-1 text-amber-600 shrink-0">
                      <Coins className="w-3 h-3" />
                      {c.recompensa_moedas.toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${c.desbloqueada ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {c.atual}/{c.meta}
                    </span>
                  </div>

                  {c.resgatada ? (
                    <p className="text-xs text-emerald-600 text-center font-medium">{t("conquistas.resgatado")}</p>
                  ) : c.desbloqueada ? (
                    <Button
                      size="sm"
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      disabled={resgatando === c.titulo}
                      onClick={() => resgatar(c.titulo)}
                    >
                      {resgatando === c.titulo ? t("conquistas.resgatando") : t("conquistas.resgatar")}
                    </Button>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}