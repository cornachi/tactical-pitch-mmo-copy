import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { traducoes, IDIOMAS } from "./dicionario";

const I18nContext = createContext(null);
const STORAGE_KEY = "tp_idioma";
const DEFAULT = "pt";

// Provider de internacionalização. Lê o idioma salvo no perfil do usuário
// (idiomaSelecionado via base44.auth.updateMe) e cai em localStorage como
// fallback imediato para não logados / latência de carregamento.
export function I18nProvider({ children }) {
  const [idioma, setIdiomaState] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.idiomaSelecionado && IDIOMAS.some((i) => i.code === user.idiomaSelecionado)) {
          setIdiomaState(user.idiomaSelecionado);
          localStorage.setItem(STORAGE_KEY, user.idiomaSelecionado);
        }
      } catch (e) {
        /* não logado — mantém localStorage */
      }
    })();
  }, []);

  const setIdioma = useCallback(async (code) => {
    setIdiomaState(code);
    localStorage.setItem(STORAGE_KEY, code);
    try {
      await base44.auth.updateMe({ idiomaSelecionado: code });
    } catch (e) {
      /* perfil pode não permitir escrita — mantém localStorage */
    }
  }, []);

  const t = useCallback(
    (key) => {
      return (traducoes[idioma] && traducoes[idioma][key]) || (traducoes[DEFAULT] && traducoes[DEFAULT][key]) || key;
    },
    [idioma]
  );

  return (
    <I18nContext.Provider value={{ idioma, setIdioma, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { idioma: DEFAULT, setIdioma: () => {}, t: (k) => k };
  return ctx;
}