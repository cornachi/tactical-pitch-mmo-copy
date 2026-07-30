import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { getMeta } from "@/lib/metas";
import { useI18n } from "@/i18n/I18nContext";

export default function MetaBanner() {
  const { t } = useI18n();
  const [meta, setMeta] = useState(null);
  const [temporada, setTemporada] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const ativas = await base44.entities.Temporada.filter({ ativa: true });
        const tmp = ativas[0];
        if (!tmp) return;
        setTemporada(tmp);
        setMeta(getMeta(tmp.evento_meta_atual));
      } catch (e) {
        /* ignore */
      }
    })();
  }, []);

  if (!meta) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-orange-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20 text-amber-600 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">
            {t("meta.evento")} {temporada?.mes_ano}
          </p>
          <p className="font-bold text-lg">{meta.nome}</p>
          <p className="text-sm text-muted-foreground">{meta.descricao}</p>
        </div>
      </div>
    </div>
  );
}