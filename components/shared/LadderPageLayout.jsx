"use client";

import React from "react";

export default function LadderPageLayout({
  controls,
  sidebar,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <main className={` min-h-screen relative ${className}`.trim()}>
      {controls}
      <div className={`grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_360px] xl:grid-cols-[minmax(0,0.86fr)_400px] ${contentClassName}`.trim()}>
        <div className="min-w-0">{children}</div>
        {sidebar}
      </div>
    </main>
  );
}
