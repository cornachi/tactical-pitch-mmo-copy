import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import { useI18n } from "@/i18n/I18nContext";

const L = {
  pt: {
    guestMsg: "Modo Convidado ativo. Seu progresso é salvo localmente.",
    entrar: "Entrar",
    sair: "Sair",
    conta: "Conta",
  },
  en: {
    guestMsg: "Guest mode active. Progress saved locally.",
    entrar: "Sign In",
    sair: "Logout",
    conta: "Account",
  },
  es: {
    guestMsg: "Modo invitado activo. Progreso guardado localmente.",
    entrar: "Entrar",
    sair: "Salir",
    conta: "Cuenta",
  },
};

export default function AccountControl() {
  const { idioma } = useI18n();
  const { user, logout } = useAuth();
  const l = L[idioma] || L.pt;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isGuest = !!user?.isGuest;
  const isReal = !!user && !isGuest;

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (isReal) {
        // SDK recarrega o app; ao voltar, volta como convidado (pode entrar c/ outra conta)
        await base44.auth.logout();
      } else {
        logout();
        window.location.reload();
      }
    } catch (e) {
      setBusy(false);
    }
  };

  if (isGuest) {
    return (
      <>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-xl flex items-center justify-between text-sm font-medium gap-3">
          <span className="min-w-0">🎮 {l.guestMsg}</span>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="shrink-0"
          >
            <LogIn className="w-4 h-4 mr-1" />
            {l.entrar}
          </Button>
        </div>
        <LoginModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  if (isReal) {
    return (
      <div className="bg-muted/60 border p-3 rounded-xl flex items-center justify-between text-sm gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <UserCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="font-medium truncate">
            {user?.email || user?.full_name || user?.name || l.conta}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleLogout}
          disabled={busy}
          className="shrink-0"
        >
          <LogOut className="w-4 h-4 mr-1" />
          {l.sair}
        </Button>
      </div>
    );
  }

  return null;
}