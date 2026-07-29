import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import EscudoClube from "@/components/clube/EscudoClube";

export default function PlacarAnimado({ home, away, nomeHome, nomeAway, clubeHome, clubeAway }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
      className="flex items-center justify-center gap-4 py-6"
    >
      <div className="text-center flex-1 min-w-0 flex flex-col items-center gap-2">
        {clubeHome && <EscudoClube clube={clubeHome} size={40} />}
        <p className="text-sm text-muted-foreground truncate">{nomeHome}</p>
        <motion.p
          className="text-6xl font-bold"
          style={{ color: clubeHome?.cor_principal }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Number(home)}
        </motion.p>
      </div>
      <span className="text-2xl text-muted-foreground font-light">×</span>
      <div className="text-center flex-1 min-w-0 flex flex-col items-center gap-2">
        {clubeAway && <EscudoClube clube={clubeAway} size={40} />}
        <p className="text-sm text-muted-foreground truncate">{nomeAway}</p>
        <motion.p
          className="text-6xl font-bold"
          style={{ color: clubeAway?.cor_principal }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Number(away)}
        </motion.p>
      </div>
    </motion.div>
  );
}