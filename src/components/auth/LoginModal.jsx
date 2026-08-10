import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const L = {
  pt: {
    title: "Entrar na Conta",
    email: "E-mail",
    password: "Senha",
    submit: "Entrar",
    err: "E-mail ou senha inválidos.",
    cancel: "Cancelar",
  },
  en: {
    title: "Sign In",
    email: "Email",
    password: "Password",
    submit: "Sign In",
    err: "Invalid email or password.",
    cancel: "Cancel",
  },
  es: {
    title: "Iniciar Sesión",
    email: "Correo",
    password: "Contraseña",
    submit: "Entrar",
    err: "Correo o contraseña inválidos.",
    cancel: "Cancelar",
  },
};

export default function LoginModal({ open, onClose }) {
  const { idioma } = useI18n();
  const l = L[idioma] || L.pt;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Após login, o SDK recarrega o app (redirecionamento hard p/ returnTo).
      await base44.auth.loginViaEmailPassword(email, password);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || l.err);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !loading) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary" />
            {l.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="lm-email">{l.email}</Label>
            <Input
              id="lm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="lm-pass">{l.password}</Label>
            <Input
              id="lm-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {l.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "..." : l.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}