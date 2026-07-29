import React, { useRef, useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

const THRESHOLD = 70;

// Pull-to-refresh via toque, respeitando o scroll da janela (só ativa no topo).
export default function PullToRefresh({ onRefresh, enabled = true, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  const setBoth = (v) => { pullRef.current = v; setPull(v); };

  useEffect(() => {
    if (!enabled) return;
    const onStart = (e) => {
      startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e) => {
      if (startY.current == null || refreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      setBoth(delta > 0 ? Math.min(delta * 0.5, THRESHOLD + 30) : 0);
    };
    const onEnd = async () => {
      if (pullRef.current >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setBoth(THRESHOLD);
        try { await refreshRef.current?.(); } catch (e) {}
        setRefreshing(false);
      }
      setBoth(0);
      startY.current = null;
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, [enabled, refreshing]);

  const pct = Math.min(1, pull / THRESHOLD);
  return (
    <>
      <div className="flex items-center justify-center overflow-hidden" style={{ height: pull }}>
        {refreshing ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <RefreshCw
            className="w-5 h-5 text-muted-foreground transition-opacity"
            style={{ opacity: pct, transform: `rotate(${pull * 3}deg)` }}
          />
        )}
      </div>
      {children}
    </>
  );
}