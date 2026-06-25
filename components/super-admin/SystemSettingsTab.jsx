"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function SystemSettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-card border border-border rounded-3xl max-w-2xl mx-auto mt-8 shadow-sm">
      <div className="w-16 h-16 mb-5 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
        <Settings className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-wide text-foreground">
        System Settings & Configuration
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
        Configure global parameters, customize email notification templates, manage access control permissions, and audit platform security logs from this panel.
      </p>
      <div className="mt-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
        Under Development
      </div>
    </div>
  );
}
