"use client";

import { useRef } from "react";
import Papa from "papaparse";

export const CSVUpload = ({ onPlayersParsed }) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedPlayers = results.data.map((row, index) => ({
          id: index + 1,
          name: row.name || row.Name || `Player ${index + 1}`,
          image: row.image || "/avatar.png",
        }));
        onPlayersParsed(parsedPlayers);
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="text-sm"
      />
    </div>
  );
};
