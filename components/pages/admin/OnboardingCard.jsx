"use client";

import { useState } from "react";
import Link from "next/link";

export default function OnboardingCard() {
  const [step, setStep] = useState(1);

  if (step === "dismissed") return null;

  if (step === "done") {
    return (
      <div className="max-w-[520px] w-full">
        <div
          style={{
            background: "#0d1b2a",
            border: "1px solid #1e3a5f",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(0,255,180,0.1)",
              border: "1px solid #00e5ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "#00e5ff",
              fontSize: 20,
            }}
          >
            ✓
          </div>
          <p style={{ color: "#00e5ff", fontWeight: 600, fontSize: 15, margin: "0 0 4px" }}>
            All set!
          </p>
          <p style={{ color: "#7a9bbf", fontSize: 13, margin: 0 }}>
            Setup complete. This card won't appear again.
          </p>
        </div>
      </div>
    );
  }

  const progressWidth =
    step === 1 ? "0%" : step === 2 ? "33%" : "66%";

  const stepLabel =
    step === 1
      ? "Step 1 of 3"
      : step === 2
      ? "Step 1 of 3 complete"
      : "Step 2 of 3 complete";

  return (
    <div style={{ maxWidth: 520, width: "100%" }}>
      <div
        style={{
          background: "#0d1b2a",
          border: "1px solid #1e3a5f",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <p style={{ color: "#00e5ff", fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>
              Getting Started
            </p>
            <p style={{ color: "#5a7a9a", fontSize: 12, margin: 0 }}>{stepLabel}</p>
          </div>
          {/* <button
            onClick={() => setStep("dismissed")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#5a7a9a", fontSize: 20, lineHeight: 1, padding: 0 }}
          >
            ×
          </button> */}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#1e3a5f", borderRadius: 99, overflow: "hidden", marginBottom: "1.25rem" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg, #00e5ff, #00bfff)",
              width: progressWidth,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* STEP 1 */}
        <StepRow num={1} isDone={step > 1} isActive={step === 1} isLocked={false} title="Explore your Profile menu">
          {step === 1 && (
            <>
              <p style={{ fontSize: 12, color: "#7a9bbf", margin: "0 0 12px" }}>
                Click your profile icon in the top-right corner. A dropdown will appear with these options:
              </p>

              {/* Dropdown preview */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "6px 0",
                  width: 230,
                  marginBottom: 12,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 13, color: "#94a3b8" }}>
                  <CircleIcon>@</CircleIcon>
                  User Name
                </div>
                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 13, color: "#334155" }}>
                  <CircleIcon color="#334155">⊞</CircleIcon>
                  Admin Dashboard
                </div>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px", fontSize: 13,
                    color: "#00bfff",
                    background: "rgba(0,191,255,0.08)",
                    borderLeft: "2px solid #00bfff",
                  }}
                >
                  <CircleIcon color="#00bfff">⊕</CircleIcon>
                  Generate Club ID &amp; Section Admins
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 13, color: "#334155" }}>
                  <CircleIcon color="#334155">⚙</CircleIcon>
                  Change Password
                </div>
                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 13, color: "#ef4444" }}>
                  <CircleIcon color="#ef4444">→</CircleIcon>
                  Logout
                </div>
              </div>

              <HintBox>
                The highlighted option{" "}
                <strong style={{ color: "#00e5ff" }}>Generate Club ID &amp; Section Admins</strong>{" "}
                is what you'll use in the next steps.
              </HintBox>

              <PrimaryButton onClick={() => setStep(2)}>Next step →</PrimaryButton>
            </>
          )}
        </StepRow>

        <Divider />

        {/* STEP 2 */}
        <StepRow num={2} isDone={step > 2} isActive={step === 2} isLocked={step < 2} title="Generate your Club ID">
          {step === 2 && (
            <>
              <p style={{ fontSize: 12, color: "#7a9bbf", margin: "0 0 12px" }}>
                A Club ID is your unique identifier on the platform. You need this before assigning any section admins.
              </p>
              <HintBox>
                Go to <strong style={{ color: "#00e5ff" }}>Profile → Generate Club ID and Section Administrators</strong>, then click <strong style={{ color: "#00e5ff" }}>Generate Club ID</strong>.
              </HintBox>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/create-club-setup?type=Club"
                  style={{
                    background: "linear-gradient(135deg, #00e5ff, #0099cc)",
                    color: "#000d1a",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "7px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Go to Create Club ID ↗
                </Link>
                <button
                  onClick={() => setStep(3)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#5a7a9a", textDecoration: "underline" }}
                >
                  Already done? Next →
                </button>
              </div>
            </>
          )}
        </StepRow>

        <Divider />

        {/* STEP 3 */}
        <StepRow num={3} isDone={false} isActive={step === 3} isLocked={step < 3} title="Assign Section Administrators">
          {step === 3 && (
            <>
              <p style={{ fontSize: 12, color: "#7a9bbf", margin: "0 0 12px" }}>
                Section admins manage specific parts of your ladder. Assign them now that your Club ID is generated.
              </p>
              <HintBox>
                Go to <strong style={{ color: "#00e5ff" }}>Profile → Generate Club ID and Section Administrators</strong>, then assign admins to each section.
              </HintBox>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/create-club-setup?type=Admins"
                  style={{
                    background: "linear-gradient(135deg, #00e5ff, #0099cc)",
                    color: "#000d1a",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "7px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Go to Section Admins ↗
                </Link>
                <button
                  onClick={() => setStep("done")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#5a7a9a", textDecoration: "underline" }}
                >
                  Mark as done →
                </button>
              </div>
            </>
          )}
        </StepRow>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StepRow({ num, isDone, isActive, isLocked, title, children }) {
  return (
    <div style={{ opacity: isLocked ? 0.4 : 1, pointerEvents: isLocked ? "none" : "auto" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 2,
            background: isDone ? "rgba(0,255,180,0.1)" : isActive ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.05)",
            border: isDone ? "1px solid #00e5b0" : isActive ? "1px solid #00e5ff" : "1px solid #1e3a5f",
            color: isDone ? "#00e5b0" : isActive ? "#00e5ff" : "#5a7a9a",
          }}
        >
          {isDone ? "✓" : num}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: isDone ? "#5a7a9a" : "#cce8ff" }}>
              {title}
            </p>
            <span
              style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 600,
                background: isDone ? "rgba(0,255,180,0.1)" : isActive ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.05)",
                color: isDone ? "#00e5b0" : isActive ? "#00e5ff" : "#5a7a9a",
                border: isDone ? "1px solid #00e5b0" : isActive ? "1px solid #00e5ff" : "1px solid #1e3a5f",
              }}
            >
              {isDone ? "Done" : isActive ? "Current" : "Locked"}
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function HintBox({ children }) {
  return (
    <div
      style={{
        background: "rgba(0,229,255,0.05)",
        borderLeft: "3px solid #00e5ff",
        borderRadius: "0 8px 8px 0",
        padding: "10px 12px",
        fontSize: 12,
        color: "#7a9bbf",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #00e5ff, #0099cc)",
        color: "#000d1a",
        fontWeight: 700,
        fontSize: 13,
        padding: "7px 18px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function CircleIcon({ children, color = "#94a3b8" }) {
  return (
    <div
      style={{
        width: 18, height: 18, borderRadius: "50%",
        border: `1.5px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color, flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#1e3a5f", margin: "12px 0" }} />;
}
