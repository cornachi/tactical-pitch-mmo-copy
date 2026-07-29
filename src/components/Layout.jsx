import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Shield } from "lucide-react";
import NotificationCenter from "@/components/notificacao/NotificationCenter";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Shield className="w-5 h-5 text-primary" />
            <span>Tactical Pitch</span>
          </Link>
          <NotificationCenter />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}