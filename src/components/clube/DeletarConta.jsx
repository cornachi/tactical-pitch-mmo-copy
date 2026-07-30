import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function DeletarConta() {
  const { t } = useI18n();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const pode = confirmText.trim().toUpperCase() === "DELETAR";

  const deletar = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke("deletarConta", {});
      await base44.auth.logout();
      window.location.href = "/login";
    } catch (e) {
      setLoading(false);
      alert(e.message || "Erro ao deletar conta");
    }
  };

  return (
    <Card className="p-4 border-rose-200">
      <h3 className="font-semibold flex items-center gap-2 text-rose-600">
        <Trash2 className="w-4 h-4" />{t("deletar.titulo")}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{t("deletar.desc")}</p>
      <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirmText(""); }}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="mt-3 w-full">{t("deletar.titulo")}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deletar.certeza")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deletar.confirmar")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETAR"
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("desafios.cancelar")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deletar(); }}
              disabled={!pode || loading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("deletar.permanentemente")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}