import React, { useState, useEffect, useRef } from "react";
import { Play, Gift, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/i18n/I18nContext";

const L = {
  pt: {
    titulo: "Anúncio",
    patrocinado: "PATROCINADO",
    aguarde: "Aguarde o anúncio terminar para receber sua recompensa",
    receber: "Receber +5 Energias",
    processando: "Processando...",
    cheio: "Energia já está no limite máximo",
  },
  en: {
    titulo: "Advertisement",
    patrocinado: "SPONSORED",
    aguarde: "Watch the ad to the end to claim your reward",
    receber: "Claim +5 Energy",
    processando: "Processing...",
    cheio: "Energy is already at the maximum",
  },
  es: {
    titulo: "Anuncio",
    patrocinado: "PATROCINADO",
    aguarde: "Espere al final del anuncio para reclamar tu recompensa",
    receber: "Reclamar +5 Energía",
    processando: "Procesando...",
    cheio: "La energía ya está al máximo",
  },
};

export default function ModalAnuncioEnergia({ open, onOpenChange, onConcluido }) {
  const { idioma } = useI18n();
  const l = L[idioma] || L.pt;
  const [duracao, setDuracao] = useState(0);
  const [restante, setRestante] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const intervalRef = useRef(null);

  // Inicia o "anúncio" (duração aleatória 5-30s) sempre que o modal abre.
  useEffect(() => {
    if (!open) return;
    const d = Math.floor(Math.random() * 26) + 5; // 5..30
    setDuracao(d);
    setRestante(d);
    setFinalizado(false);
    setProcessando(false);
    setErro("");
    intervalRef.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setFinalizado(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [open]);

  const receber = async () => {
    setProcessando(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("recarregarEnergiaAnuncio", {});
      const data = res?.data ?? res;
      if (data?.error) {
        setErro(data.cheio ? l.cheio : data.error);
        setProcessando(false);
        return;
      }
      if (onConcluido) onConcluido(data);
      onOpenChange(false);
    } catch (e) {
      setErro(e.response?.data?.error || e.message || "Erro");
      setProcessando(false);
    }
  };

  const progresso = duracao > 0 ? ((duracao - restante) / duracao) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        <div className="relative aspect-video bg-gradient-to-br from-primary/25 via-accent/20 to-primary/10 flex items-center justify-center">
          <span className="absolute top-2 left-2 text-[10px] font-bold tracking-wide bg-foreground/80 text-background px-1.5 py-0.5 rounded">
            {l.patrocinado}
          </span>
          <span className="absolute top-2 right-2 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
            {restante}s
          </span>
          <Play className="w-12 h-12 text-primary/70" />
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-foreground/10">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        <div className="p-5 space-y-3">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" /> {l.titulo}
            </DialogTitle>
            <DialogDescription>{l.aguarde}</DialogDescription>
          </DialogHeader>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button
            className="w-full"
            disabled={!finalizado || processando}
            onClick={receber}
          >
            {processando ? (
              l.processando
            ) : finalizado ? (
              <>
                <Check className="w-4 h-4" /> {l.receber}
              </>
            ) : (
              <span className="opacity-60">{l.receber}</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}