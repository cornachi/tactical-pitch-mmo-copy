import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { gerarVozTorcida } from "@/lib/vozTorcida";
import { useI18n } from "@/i18n/I18nContext";

// "Voz da Torcida" — reação cômica pós-jogo baseada em estatísticas reais.
// Calcula o texto uma única vez (useState initializer) para não mudar a
// cada re-render.
export default function VozTorcida({ placarHome, placarAway, domHome, domAway, momentum, expulsoes }) {
  const { t, idioma } = useI18n();
  const [texto] = useState(() =>
    gerarVozTorcida({ placarHome, placarAway, domHome, domAway, momentum, expulsoes }, idioma)
  );

  return (
    <Card className="p-4 bg-amber-500/5 border-amber-500/20">
      <h3 className="font-semibold flex items-center gap-2 mb-2">🗣️ {t("vozTorcida.titulo")}</h3>
      <p className="text-sm italic text-muted-foreground">{texto}</p>
    </Card>
  );
}