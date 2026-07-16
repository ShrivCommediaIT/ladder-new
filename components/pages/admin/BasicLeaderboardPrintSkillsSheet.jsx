"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "react-toastify";
import { useRef } from "react";

export default function BasicLeaderboardPrintSkillsSheet({
  skills = [],
  ladderId = null,
  className = null,
  children = null,
  disabled = false,
}) {
  const printRef = useRef(null);

  const normalizedSkills = Array.from({ length: 12 }, (_, i) => {
    const skill = skills.find((s) => s.id === i + 1);
    return (
      skill || {
        id: i + 1,
        description: "",
        mode: "plus",
        target: "",
        unit: "",
      }
    );
  });

  const handlePrint = () => {
    if (disabled) return;
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups to print.");
      return;
    }

    const printContent = printRef.current.innerHTML;

    printWindow.document.open();
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Skills Sheet - A4</title>
<style>
@page {
  size: A4 portrait;
  margin: 8mm 10mm; /* Reduced margins */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #000;
  background: white;
  line-height: 1.1;
  font-size: 10px; /* Smaller base font */
}

.print-header {
  text-align: center;
  margin-bottom: 6px; /* Reduced */
  border-bottom: 1.5px solid #000;
  padding-bottom: 3px;
}

.print-header h1 {
  font-size: 13px; /* Smaller */
  font-weight: 700;
  margin-bottom: 1px;
}

.print-header .subtitle {
  font-size: 9px; /* Smaller */
  color: #333;
}

/* COMPACT TABLE */
.skills-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #000;
  margin-top: 4px; /* Reduced */
  font-size: 10px;
}

.skills-table th,
.skills-table td {
  border: 1px solid #000;
  padding: 2px 3px; /* Much smaller padding */
  text-align: center;
  vertical-align: middle;
  height: 9mm; /* Reduced row height */
}

.skills-table th:last-child,
.skills-table td:last-child {
  border-right: 1px solid #000;
}

.skills-table th {
  font-weight: 700;
  font-size: 9.5px; /* Smaller */
  background: #e6e6e6;
}

.skill-number {
  font-size: 12px; /* Slightly smaller */
  font-weight: 700;
  width: 9%; /* Slightly reduced */
}

.skill-sign {
  font-size: 11px; /* Smaller */
  font-weight: 900;
  width: 7%; /* Reduced */
}

.skill-target {
  font-size: 10px; /* Smaller */
  font-weight: 600;
  width: 13%; /* Reduced */
  background: #fff3cd;
}

.skill-name {
  font-size: 9px; /* Much smaller */
  font-weight: 600;
  width: 71%; /* Increased to compensate */
  line-height: 1.15;
  word-break: break-word;
  padding: 1px 3px; /* Minimal padding */
  background: #fff3cd;
}

.empty-row {
  background: #f5f5f5;
  color: #777;
}

.skill-unit {
  font-size: 9px;
  font-weight: 600;
  width: 10%;
  background: #eef6ff;
}

.skill-number { width: 8%; }
.skill-sign { width: 6%; }
.skill-target { width: 12%; }
.skill-unit { width: 10%; }
.skill-name { width: 64%; }


@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
</head>
<body>
<div class="print-header">
  <h1>SKILLS RECORD SHEET</h1>
  <div class="subtitle">
    Ladder ID: <strong>${ladderId || "N/A"}</strong> | 
    <strong>${new Date().toLocaleDateString("en-GB")}</strong>
  </div>
</div>

${printContent}

<script>
  window.onload = function() {
    window.focus();
    window.print();
  }
</script>
</body>
</html>
`);
    printWindow.document.close();
  };

  return (
    <>
      <div ref={printRef} style={{ display: "none" }}>
        <table className="skills-table">
          <thead>
            <tr>
              <th>SKILL #</th>
              <th>SIGN</th>
              <th>TARGET</th>
              <th>SKILL NAME</th>
              <th>UNIT</th>
            </tr>
          </thead>
          <tbody>
            {normalizedSkills.map((row) => (
              <tr
                key={row.id}
                className={row.description.trim() === "" ? "empty-row" : ""}
              >
                <td className="skill-number">{row.id}</td>
                <td className="skill-sign">
                  {row.mode === "plus" ? "+" : "−"}
                </td>
                <td className="skill-target">
                  {row.target != null && String(row.target).trim() !== ""
                    ? String(row.target).trim()
                    : "-"}
                </td>
                <td className="skill-name">
                  {row.description?.trim() || `Skill ${row.id}`}
                </td>

                <td className="skill-unit">{row.unit?.trim() || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {className === "hidden" ? (
        <button
          onClick={handlePrint}
          className="hidden"
          id="print-trigger"
          type="button"
          disabled={disabled}
        />
      ) : className ? (
        <button
          onClick={handlePrint}
          className={className}
          id="print-trigger"
          type="button"
          disabled={disabled}
        >
          {children || "Print Skills"}
        </button>
      ) : (
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="cursor-pointer border-sky-500/30 hover:border-sky-500/50 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          id="print-trigger"
          type="button"
          disabled={disabled}
        >
          <Printer size={16} className="text-sky-500" />
          {children || "Print Skills"}
        </Button>
      )}
    </>
  );
}
