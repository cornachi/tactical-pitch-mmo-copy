import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { OPCOES_COR, OPCOES_ICONE } from "@/lib/identidade";
import EscudoClube from "@/components/clube/EscudoClube";
import { useI18n } from "@/i18n/I18nContext";

export default function IdentidadeClube({ clube, onSalvo }) {
  const { t } = useI18n();
  const [cor1, setCor1] = useState(clube.cor_principal || OPCOES_COR[6]);
  const [cor2, setCor2] = useState(clube.cor_secundaria || OPCOES_COR[11]);
  const [icone, setIcone] = useState(clube.icone_escudo || "escudo");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const res = await base44.functions.invoke("atualizarIdentidade", {
        clube_id: clube.id,
        cor_principal: cor1,
        cor_secundaria: cor2,
        icone_escudo: icone,
      });
      const data = res?.data ?? res;
      if (data?.error) setErro(data.error);
      else if (onSalvo) onSalvo();
    } catch (e) {
      setErro(e.response?.data?.error || e.message);
    } finally {
      setSalvando(false);
    }
  };

  const preview = { ...clube, cor_principal: cor1, cor_secundaria: cor2, icone_escudo: icone };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t("identidade.titulo")}</h2>
        <EscudoClube clube={preview} size={48} />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">{t("identidade.corPrimaria")}</p>
        <div className="flex flex-wrap gap-2">
          {OPCOES_COR.map((c) => (
            <button
              key={c}
              onClick={() => setCor1(c)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: c, outline: cor1 === c ? "2px solid #888" : "2px solid transparent", outlineOffset: 1 }}
            >
              {cor1 === c && <Check className="w-4 h-4 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">{t("identidade.corSecundaria")}</p>
        <div className="flex flex-wrap gap-2">
          {OPCOES_COR.map((c) => (
            <button
              key={c}
              onClick={() => setCor2(c)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: c, outline: cor2 === c ? "2px solid #888" : "2px solid transparent", outlineOffset: 1 }}
            >
              {cor2 === c && <Check className="w-4 h-4 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">{t("identidade.icone")}</p>
        <div className="grid grid-cols-6 gap-2">
          {OPCOES_ICONE.map((o) => {
            const Icon = o.Icon;
            return (
              <button
                key={o.key}
                onClick={() => setIcone(o.key)}
                title={o.label}
                className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-colors ${
                  icone === o.key ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button className="w-full" disabled={salvando} onClick={salvar}>
        {salvando ? t("identidade.salvando") : t("identidade.salvar")}
      </Button>
    </Card>
  );
}