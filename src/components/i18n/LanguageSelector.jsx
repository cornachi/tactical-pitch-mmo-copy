import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { IDIOMAS } from "@/i18n/dicionario";

// Seletor de idioma (PT/EN/ES) exibido no cabeçalho. Persiste a escolha no
// perfil do usuário via useI18n().setIdioma (base44.auth.updateMe).
export default function LanguageSelector() {
  const { idioma, setIdioma } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const atual = IDIOMAS.find((i) => i.code === idioma) || IDIOMAS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Idioma"
      >
        <Globe className="w-4 h-4" />
        <span>{atual.flag}</span>
        <span className="hidden sm:inline uppercase text-xs">{atual.code}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border bg-popover shadow-md z-50 overflow-hidden">
          {IDIOMAS.map((i) => (
            <button
              key={i.code}
              type="button"
              onClick={() => {
                setIdioma(i.code);
                setOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <span>{i.flag}</span>
                {i.label}
              </span>
              {idioma === i.code && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}