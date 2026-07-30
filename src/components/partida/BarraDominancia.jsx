import React from "react";
import { motion } from "framer-motion";

export default function BarraDominancia({ domHome, domAway, nomeHome, nomeAway, corHome, corAway }) {
  const cHome = corHome || "#98FF30";
  const cAway = corAway || "#f43f5e";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium truncate" style={{ color: cHome }}>{nomeHome} {domHome}%</span>
        <span className="font-medium truncate" style={{ color: cAway }}>{domAway}% {nomeAway}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden" style={{ background: cAway, opacity: 0.25 }}>
        <motion.div
          className="h-full rounded-l-full"
          style={{ background: cHome }}
          initial={{ width: 0 }}
          animate={{ width: `${domHome}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}