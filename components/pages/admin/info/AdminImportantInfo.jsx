"use client";

import React from "react";
import { X } from "lucide-react";

const AdminImportantInfo = ({ onClose = () => { } }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-4 md:p-8">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 active:scale-95
        rounded-full p-2.5 shadow-md transition-all border border-white/20 z-[110]"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Image */}
      <div className="w-full h-full flex justify-center items-center">
        <img
          src="/poster1.png"
          alt="Sports Solutions Pro Guide"
          className="max-h-[92vh] max-w-full rounded-xl shadow-2xl object-contain border border-white/10"
        />
      </div>

    </div>
  );
};

export default AdminImportantInfo;