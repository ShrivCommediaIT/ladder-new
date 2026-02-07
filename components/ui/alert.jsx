"use client";

import * as React from "react";


export const Alert = ({ variant = "default", className = "", ...props }) => {
  const bgColor =
    variant === "destructive" ? "bg-red-600 text-white" :
    variant === "success" ? "bg-green-600 text-white" :
    "bg-gray-800 text-white";

  return <div className={`p-3 rounded-md ${bgColor} ${className}`} {...props} />;
};

export const AlertTitle = ({ children }) => (
  <div className="font-bold mb-1">{children}</div>
);

export const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);
