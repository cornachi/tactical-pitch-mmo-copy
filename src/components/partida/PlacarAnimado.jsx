import React from "react";
import { motion } from "framer-motion";

export default function PlacarAnimado({ home, away, nomeHome, nomeAway }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
      className="flex items-center justify-center gap-4 py-6"
    >
      <div className="text-center flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-1 truncate">{nomeHome}</p>
        <motion.p
          className="text-6xl font-bold"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {home}
        </motion.p>
      </div>
      <span className="text-2xl text-muted-foreground font-light">×</span>
      <div className="text-center flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-1 truncate">{nomeAway}</p>
        <motion.p
          className="text-6xl font-bold"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {away}
        </motion.p>
      </div>
    </motion.div>
  );
}