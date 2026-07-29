import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Home, Users, Trophy, ShoppingBag, Building, Medal } from "lucide-react";
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

export default function Layout() {
  const { pathname } = useLocation();
  const { t } = useI18n();

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

      {/* Mobile top header */}
      <header
        className="flex md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="w-full flex items-center justify-between px-4 h-12">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-base">Tactical Pitch</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Page content with framer-motion transitions */}
      <main className="pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around h-14">
          {MOBILE_TABS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
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