"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsGrowthTab() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-card border border-border rounded-3xl max-w-2xl mx-auto mt-8 shadow-sm">
      <div className="w-16 h-16 mb-5 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
        <BarChart3 className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-wide text-foreground">
        Analytics & Growth Dashboard
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
        This module is reserved for future updates. Once activated, it will display real-time user engagement charts, monthly subscription revenue, and interactive club growth statistics.
      </p>
      <div className="mt-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
        Coming Soon
      </div>
    </div>
  );
}
