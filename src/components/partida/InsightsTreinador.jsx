import React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function InsightsTreinador({ insights }) {
  return (
    <div className="space-y-3">
      {insights.map((txt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.25 }}
          className="flex gap-3 p-3 rounded-lg bg-card border"
        >
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm">{txt}</p>
        </motion.div>
      ))}
    </div>
  );
}