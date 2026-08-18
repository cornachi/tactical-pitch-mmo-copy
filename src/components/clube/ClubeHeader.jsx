import React from "react";
import { ESPECIALIZACAO_LABELS } from "@/lib/tactical";
import EscudoClube from "@/components/clube/EscudoClube";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/i18n/I18nContext";

export default function ClubeHeader({ clube }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border" style={{ borderColor: clube.cor_principal ? `${clube.cor_principal}66` : undefined }}>
      <EscudoClube clube={clube} size={56} />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{clube.nome_clube}</h1>
        <p className="text-sm text-muted-foreground">{clube.pais}</p>
      </div>
      <div className="text-right space-y-1">
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
        <p className="text-xs text-muted-foreground">{t("clube.especializacao")}</p>
        <p className="font-semibold">
          {t(ESPECIALIZACAO_LABELS[clube.especializacao] || clube.especializacao)}
        </p>
      </div>
    </div>
  );
}