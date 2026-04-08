"use client";

import React from "react";
import { X } from "lucide-react";

const AdminImportantInfo = ({ onClose = () => {} }) => {
  return (
    <div className="relative w-full flex justify-center items-center p-2">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 bg-white hover:bg-gray-100
        rounded-full p-2 shadow-md transition"
      >
        <X size={20} className="text-black" />
      </button>

      {/* Image */}
      <img
        src="/poster1.jpg"
        alt="Sports Solutions Pro Guide"
        className="w-full max-w-5xl rounded-lg shadow-lg"
      />

    </div>
  );
};

export default AdminImportantInfo;