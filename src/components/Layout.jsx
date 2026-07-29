import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Shield, Home, Users, Trophy, ShoppingBag, Building } from "lucide-react";
import NotificationCenter from "@/components/notificacao/NotificationCenter";
import DesafiosNavItem from "@/components/desafio/DesafiosNavItem";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", labelKey: "nav.dashboard", icon: Home },
  { to: "/equipe", labelKey: "nav.equipe", icon: Users },
  { to: "/estadio", labelKey: "nav.estadio", icon: Building },
  { to: "/ranking", labelKey: "nav.ranking", icon: Trophy },
  { to: "/copa", labelKey: "nav.copa", icon: Trophy },
  { to: "/loja", labelKey: "nav.loja", icon: ShoppingBag },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 font-bold shrink-0">
            <Shield className="w-5 h-5 text-primary" />
            <span className="hidden sm:inline">Tactical Pitch</span>
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
                  <span className="hidden sm:inline">{t(item.labelKey)}</span>
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
      <main>
        <Outlet />
      </main>
    </div>
  );
}