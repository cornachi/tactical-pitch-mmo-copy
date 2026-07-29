import React from "react";
import { Card } from "@/components/ui/card";

export default function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${accent || "bg-primary/10 text-primary"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </Card>
  );
}