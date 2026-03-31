"use client";

import { useState, useEffect } from "react";
import AdminHideShowInfo from "./info/AdminHideShowInfo";

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false); // ✅ define BEFORE the early return

  if (!isOpen) return null; // ✅ only once
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(2px)",
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          width: "100%",
          maxWidth: 480,
          padding: "0 16px",
        }}
      >
        <div
          style={{
            background: "#0d1b2a",
            border: "1px solid #1e3a5f",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: "1px solid #1e3a5f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00e5ff",
                  boxShadow: "0 0 6px #00e5ff",
                }}
              />
              <p
                style={{
                  color: "#00e5ff",
                  fontWeight: 700,
                  fontSize: 15,
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                Welcome to Admin Dashboard
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #1e3a5f",
                borderRadius: 8,
                color: "#7a9bbf",
                fontSize: 18,
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Modal Body — AdminHideShowInfo */}
          <div >
            <div
              style={{
                padding: "16px",
              }}
            >
              <AdminHideShowInfo isModel={true} />
            </div>
          </div>
          {/* Modal Footer */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #1e3a5f",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                background: "linear-gradient(135deg, #00e5ff, #0099cc)",
                color: "#000d1a",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Got it, let's start →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
