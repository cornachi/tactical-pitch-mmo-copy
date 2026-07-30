import React, { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModalAnuncioEnergia from "@/components/partida/ModalAnuncioEnergia";
import { useI18n } from "@/i18n/I18nContext";

const L = {
  pt: { assistir: "Assistir Anúncio", ilimitado: "ILIMITADO" },
  en: { assistir: "Watch Ad", ilimitado: "UNLIMITED" },
  es: { assistir: "Ver Anuncio", ilimitado: "ILIMITADO" },
};

export default function RecargaAnuncioEnergia({ onConcluido }) {
  const { idioma } = useI18n();
  const l = L[idioma] || L.pt;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="w-full" onClick={() => setOpen(true)}>
        <Play className="w-4 h-4 mr-1.5" />
        {l.assistir} +5
        <span className="ml-1.5 text-[9px] font-extrabold tracking-wide bg-primary-foreground/20 px-1.5 py-0.5 rounded">
          {l.ilimitado}
        </span>
      </Button>
      <ModalAnuncioEnergia open={open} onOpenChange={setOpen} onConcluido={onConcluido} />
    </>
  );
}