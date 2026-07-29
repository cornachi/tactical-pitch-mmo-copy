import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Home, Users, Trophy, ShoppingBag, Building, Medal, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import NotificationCenter from "@/components/notificacao/NotificationCenter";
import DesafiosNavItem from "@/components/desafio/DesafiosNavItem";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import KeepAliveOutlet from "@/components/KeepAliveOutlet";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", labelKey: "nav.dashboard", icon: Home },
  { to: "/equipe", labelKey: "nav.equipe", icon: Users },
  { to: "/estadio", labelKey: "nav.estadio", icon: Building },
  { to: "/ranking", labelKey: "nav.ranking", icon: Trophy },
  { to: "/copa", labelKey: "nav.copa", icon: Trophy },
  { to: "/torneios", labelKey: "nav.torneios", icon: Medal },
  { to: "/loja", labelKey: "nav.loja", icon: ShoppingBag },
];

const MOBILE_TABS = [
  { to: "/", labelKey: "nav.dashboard", icon: Home },
  { to: "/equipe", labelKey: "nav.equipe", icon: Users },
  { to: "/estadio", labelKey: "nav.estadio", icon: Building },
  { to: "/copa", labelKey: "nav.copa", icon: Trophy },
  { to: "/loja", labelKey: "nav.loja", icon: ShoppingBag },
];

const MAIN_TABS = ["/", "/equipe", "/estadio", "/copa", "/loja"];

// Mapeia qualquer caminho à aba dona (para memória de navegação entre abas).
function tabOf(p) {
  if (p.startsWith("/equipe")) return "/equipe";
  if (p.startsWith("/estadio")) return "/estadio";
  if (p.startsWith("/copa")) return "/copa";
  if (p.startsWith("/loja")) return "/loja";
  if (p.startsWith("/torneios")) return "/copa";
  return "/";
}

function resolveHeader(pathname) {
  if (MAIN_TABS.includes(pathname)) return { sub: false };
  const staticMap = {
    "/ranking": "Ranking",
    "/missoes": "Missões",
    "/desafios": "Desafios",
    "/torneios": "Torneios",
    "/simular-partida": "Simulação",
    "/pre-partida": "Pré-Partida",
    "/resultado-partida": "Resultado",
    "/torneios/criar": "Criar Torneio",
    "/relatorio-tatico": "Relatório Tático",
  };
  if (staticMap[pathname]) return { sub: true, label: staticMap[pathname] };
  if (pathname.startsWith("/desafios/relatorio/")) return { sub: true, label: "Relatório do Desafio" };
  if (pathname.startsWith("/torneios/")) {
    return { sub: true, label: null, torneioId: pathname.split("/")[2] };
  }
  return { sub: true, label: "Tactical Pitch" };
}

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [torneioNome, setTorneioNome] = useState(null);
  const lastPaths = useRef({});

  const headerInfo = resolveHeader(pathname);

  useEffect(() => {
    if (headerInfo.torneioId) {
      setTorneioNome(null);
      base44.entities.Torneio.get(headerInfo.torneioId)
        .then((tr) => setTorneioNome(tr?.nome || "Torneio"))
        .catch(() => setTorneioNome("Torneio"));
    } else {
      setTorneioNome(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Memória de navegação: guarda o último caminho ativo de cada aba.
  useEffect(() => {
    lastPaths.current[tabOf(pathname)] = pathname;
  }, [pathname]);

  const mobileTitle = headerInfo.sub
    ? headerInfo.torneioId
      ? (torneioNome || "Torneio")
      : headerInfo.label
    : "Tactical Pitch";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop top navbar */}
      <header
        className="hidden md:flex sticky top-0 z-40 border-b bg-background/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 font-bold shrink-0">
            <Shield className="w-5 h-5 text-primary" />
            <span>Tactical Pitch</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <DesafiosNavItem />
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Mobile top header (back arrow + section name on sub-routes) */}
      <header
        className="flex md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="w-full flex items-center gap-1 px-2 h-12">
          {headerInfo.sub ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-0.5 text-sm font-medium text-muted-foreground hover:text-foreground px-1.5 py-1 -ml-1"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2 font-bold px-1.5">
              <Shield className="w-5 h-5 text-primary" />
            </Link>
          )}
          <span className="font-semibold truncate flex-1 text-center">
            {mobileTitle}
          </span>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Page content: keep-alive para abas + transição para sub-rotas */}
      <main className="pt-[calc(3rem+env(safe-area-inset-top))] md:pt-[calc(3.5rem+env(safe-area-inset-top))] pb-20 md:pb-0">
        <KeepAliveOutlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around h-14">
          {MOBILE_TABS.map((item) => {
            const Icon = item.icon;
            const activeTab = tabOf(pathname) === item.to;
            const dest = activeTab ? item.to : (lastPaths.current[item.to] || item.to);
            return (
              <Link
                key={item.to}
                to={dest}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 text-[11px] font-medium transition-colors",
                  activeTab ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}