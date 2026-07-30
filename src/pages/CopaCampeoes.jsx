import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChaveCopa from "@/components/copa/ChaveCopa";
import { useI18n } from "@/i18n/I18nContext";

export default function CopaCampeoes() {
  const { t } = useI18n();
  const [copa, setCopa] = useState(null);
  const [clubesMap, setClubesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const lista = await base44.entities.CopaCampeoes.filter({ status: "CONCLUIDO" }, "-created_date", 10);
        const ultima = lista[0];
        setCopa(ultima);
        if (ultima) {
          const ids = new Set([...(ultima.classificados || []), ultima.campeao_id, ultima.vice_id].filter(Boolean));
          const map = {};
          await Promise.all([...ids].map(async (id) => {
            try { map[id] = await base44.entities.Clube.get(id); } catch (e) { /* ignore */ }
          }));
          setClubesMap(map);
        }
      } catch (e) { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("copa.carregando")}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> {t("copa.titulo")}</h1>
        <Button asChild variant="outline" size="sm"><Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />{t("common.voltar")}</Link></Button>
      </div>

      <p className="text-xs text-muted-foreground">{t("copa.descricao")}</p>

      {!copa ? (
        <div className="p-8 text-center text-muted-foreground space-y-2">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p>{t("copa.nenhuma")}</p>
        </div>
      ) : (
        <ChaveCopa copa={copa} clubesMap={clubesMap} />
      )}
    </div>
  );
}