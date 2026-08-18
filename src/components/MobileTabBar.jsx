import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Building, Swords, Trophy } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

// Barra de navegação inferior para mobile (5 abas principais). Some em desktop.
const TABS = [
  { to: "/", icon: Home, labelKey: "nav.dashboard" },
  { to: "/equipe", icon: Users, labelKey: "nav.equipe" },
  { to: "/estadio", icon: Building, labelKey: "nav.estadio" },
  { to: "/desafios", icon: Swords, labelKey: "nav.desafios" },
  { to: "/torneios", icon: Trophy, labelKey: "nav.torneios" },
];

export default function MobileTabBar() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  // Exibe apenas nas abas principais; telas-filho (partida, relatórios) ocultam a barra.
  const isTab = TABS.some((tab) => tab.to === pathname);
  if (!isTab) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-bottom">
      <div className="flex">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}