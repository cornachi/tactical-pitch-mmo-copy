import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { IDIOMAS } from "@/i18n/dicionario";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Seletor de idioma: bottom sheet (vaul) no mobile, dropdown no desktop.
export default function LanguageSelector() {
  const { idioma, setIdioma } = useI18n();
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const isMobile = useIsMobile();
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const atual = IDIOMAS.find((i) => i.code === idioma) || IDIOMAS[0];

  const escolher = (code) => {
    setIdioma(code);
    setOpen(false);
    setDdOpen(false);
  };

  const lista = IDIOMAS.map((i) => (
    <button
      key={i.code}
      type="button"
      onClick={() => escolher(i.code)}
      className="flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
    >
      <span className="flex items-center gap-2">
        <span>{i.flag}</span>
        {i.label}
      </span>
      {idioma === i.code && <Check className="w-4 h-4 text-primary" />}
    </button>
  ));

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Idioma"
          >
            <Globe className="w-4 h-4" />
            <span>{atual.flag}</span>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Idioma</DrawerTitle>
          </DrawerHeader>
          <div className="px-2 pb-6">{lista}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setDdOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Idioma"
      >
        <Globe className="w-4 h-4" />
        <span>{atual.flag}</span>
        <span className="hidden sm:inline uppercase text-xs">{atual.code}</span>
      </button>
      {ddOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border bg-popover shadow-md z-50 overflow-hidden">
          {lista}
        </div>
      )}
    </div>
  );
}