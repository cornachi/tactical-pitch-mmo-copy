import React, { useRef } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Mantém as abas principais (Dashboard, Equipe, Estádio, Copa, Loja) montadas
// e preserva o estado/stack ao trocar de aba. Sub-rotas usam transição animada.
const KEEP_TABS = ["/", "/equipe", "/estadio", "/copa", "/loja"];

export default function KeepAliveOutlet() {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const cache = useRef({});

  if (KEEP_TABS.includes(pathname)) {
    cache.current[pathname] = outlet;
  }

  const cachedTabs = Object.entries(cache.current).map(([p, el]) => (
    <div key={p} style={{ display: p === pathname ? "block" : "none" }}>
      {el}
    </div>
  ));

  const isTab = KEEP_TABS.includes(pathname);

  return (
    <>
      {cachedTabs}
      <AnimatePresence mode="wait">
        {!isTab && (
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {outlet}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}