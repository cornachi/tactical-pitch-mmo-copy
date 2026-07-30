import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/i18n/I18nContext";

const LABELS = { pt: "Sair", en: "Logout", es: "Salir" };

export default function LogoutButton({ className = "" }) {
  const { idioma } = useI18n();
  const [busy, setBusy] = useState(false);
  const label = LABELS[idioma] || LABELS.pt;

  const handle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await base44.auth.logout();
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handle}
      disabled={busy}
      aria-label={label}
      title={label}
      className={className}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}