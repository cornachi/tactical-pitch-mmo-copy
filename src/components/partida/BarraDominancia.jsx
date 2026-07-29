import React from "react";
import { motion } from "framer-motion";

export default function BarraDominancia({ domHome, domAway, nomeHome, nomeAway }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium truncate">{nomeHome} <span className="text-primary">{domHome}%</span></span>
        <span className="font-medium truncate"><span className="text-rose-500">{domAway}%</span> {nomeAway}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden bg-rose-500/30">
        <motion.div
          className="h-full bg-primary rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${domHome}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}