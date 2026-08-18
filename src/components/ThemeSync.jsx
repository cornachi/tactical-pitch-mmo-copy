import { useEffect } from "react";

// Sincroniza o tema (claro/escuro) com a preferência do sistema, alternando a
// classe `.dark` no <html>. O Tailwind está configurado com darkMode: ["class"].
export default function ThemeSync() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle("dark", mql.matches);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return null;
}