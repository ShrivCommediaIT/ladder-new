"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, Users } from "lucide-react";

const CreatePanel = ({
  role,
  ladderName,
  setLadderName,
  ladderType,
  setLadderType,
  csvFile,
  handleFileChange,
  handleCreate,
  loading,
  sportName,
}) => {
  const isAdmin = role === "admin";

  return (
    <div className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-xl p-4 sm:p-6 rounded-3xl">

      {/* HEADER */}
      <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        {isAdmin ? "Create a Roster" : "Create a Solution"}
      </h3>

      <div className="space-y-4">

        {/* NAME */}
        <div>
          <Label className="text-md text-white">Name :</Label>

          <div className="flex gap-2">
            {/* SUBADMIN SPORT NAME */}
            {!isAdmin && (
              <Input
                value={sportName}
                className="mt-1 w-28 h-11 rounded-xl bg-white/10 border-white/10 text-white"
                readOnly
              />
            )}

            <Input
              value={ladderName}
              onChange={(e) => setLadderName(e.target.value)}
              className="mt-1 h-11 rounded-xl bg-white/10 border-white/10 text-white"
              placeholder={
                isAdmin ? "Roster Name" : "Name of the Solution"
              }
            />
          </div>
        </div>

        {/* TYPE SELECT (ONLY SUBADMIN) */}
        {!isAdmin && (
          <div>
            <Label className="text-md text-white">
              Choose Type :
            </Label>

            <select
              value={ladderType}
              onChange={(e) => setLadderType(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl bg-white/10 border border-white/10 px-3 text-white"
            >
              <option className="bg-black" value="winlose">
                Ladder (Win/Lose)
              </option>
              <option className="bg-black" value="best3">
                Ladder (Best of 3)
              </option>
              <option className="bg-black" value="best5">
                Ladder (Best of 5)
              </option>
              <option className="bg-black" value="minileague">
                MiniLeagues
              </option>
              <option className="bg-black" value="skill">
                Skills/Performance Challenge Boards (Desc/Asc)
              </option>

              {/* ❌ ROSTER HIDDEN */}
              <option className="bg-black" value="positive">
                Leaderboard (Desc/Asc)
              </option>
              <option className="bg-black" value="negative">
                Leaderboard (Time Desc/Asc)
              </option>
            </select>
          </div>
        )}

        {/* CSV */}
        <div>
          <Label className="text-md text-white">Players CSV</Label>

          <div className="mt-1 mb-3 text-xs text-white/70 bg-black/40 border border-white/10 rounded-lg p-3">
            <p className="font-semibold text-white mb-1">
              CSV Instructions
            </p>
            <p>(1) Names in Column A Or</p>
            <p>(2) Name + Phone Number (Optional)</p>
          </div>

          <label className="group flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
            <div className="pointer-events-none flex flex-col items-center gap-2">
              <UploadCloud className="w-6 h-6 text-cyan-300" />
              <p className="text-xs text-white/70">
                Click or drag CSV
              </p>
            </div>

            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>

          {csvFile && (
            <div className="flex justify-between mt-2 bg-black/30 border border-white/10 px-3 py-2 rounded-xl">
              <span className="text-[11px] text-cyan-300 truncate">
                {csvFile.name}
              </span>
              <span className="text-[10px] text-green-400 font-semibold">
                Ready
              </span>
            </div>
          )}
        </div>

        {/* BUTTON */}
        <Button
          onClick={handleCreate}
          disabled={!ladderName || !csvFile || loading}
          className="w-full h-12 rounded-2xl text-base font-bold bg-gray-800 border-t border-b border-cyan-500 shadow-xl active:scale-95"
        >
          {loading
            ? "Creating..."
            : isAdmin
              ? "Create a Roster"
              : "Create Solution"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePanel;