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
    <div className="w-full">

      {/* HEADER */}
      <h3 className="text-h3 font-bold text-primary flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        {isAdmin ? "Create a Roster" : "Create a Solution"}
      </h3>

      <div className="space-y-4">

        {/* NAME */}
        <div>
          <Label className="text-p2 text-foreground">Name :</Label>

          <div className="flex gap-2">
            {/* SUBADMIN SPORT NAME */}
            {!isAdmin && (
              <Input
                value={sportName}
                className="mt-1 w-60 h-11 rounded-xl bg-card border-border text-foreground"
                readOnly
              />
            )}

            <Input
              value={ladderName}
              onChange={(e) => setLadderName(e.target.value)}
              className="mt-1 h-11 rounded-xl bg-card border-border text-foreground"
              placeholder={
                isAdmin ? "Roster Name" : "Name of the Solution"
              }
            />
          </div>
        </div>

        {/* TYPE SELECT (ONLY SUBADMIN) */}
        {!isAdmin && (
          <div>
            <Label className="text-p2 text-foreground">
              Choose Type :
            </Label>

            <select
              value={ladderType}
              onChange={(e) => setLadderType(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl bg-card border border-border px-3 text-foreground"
            >
              <option className="bg-card text-foreground" value="winlose">
                Ladder (Win/Lose)
              </option>
              <option className="bg-card text-foreground" value="best3">
                Ladder (Best of 3)
              </option>
              <option className="bg-card text-foreground" value="best5">
                Ladder (Best of 5)
              </option>
              <option className="bg-card text-foreground" value="minileague">
                MiniLeagues
              </option>
              <option className="bg-card text-foreground" value="skill">
                Skills/Performance Challenge Boards (Desc/Asc)
              </option>
              <option className="bg-card text-foreground" value="positive">
                Leaderboard (Desc/Asc)
              </option>
              <option className="bg-card text-foreground" value="negative">
                Leaderboard (Time Asc/Desc)
              </option>
            </select>
          </div>
        )}

        {/* CSV */}
        <div>
          <Label className="text-p2 text-foreground">Players CSV</Label>

          <div className="mt-1 mb-3 text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg p-3">
            <p className="font-semibold text-foreground mb-1">
              CSV Instructions
            </p>
            <p>(1) Names in Column A Or</p>
            <p>(2) Name + Phone Number (Optional)</p>
          </div>

          <label className="group flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-border bg-card hover:bg-muted/50 transition cursor-pointer relative">
            <div className="pointer-events-none flex flex-col items-center gap-2">
              <UploadCloud className="w-6 h-6 text-primary" />
              <p className="text-xs text-muted-foreground">
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
            <div className="flex justify-between mt-2 bg-muted/50 border border-border px-3 py-2 rounded-xl">
              <span className="text-p4 text-primary truncate">
                {csvFile.name}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold">
                Ready
              </span>
            </div>
          )}
        </div>

        {/* BUTTON */}
        <Button
          onClick={handleCreate}
          disabled={!ladderName || !csvFile || loading}
          className="w-full h-12 rounded-2xl text-p1 font-bold bg-primary hover:bg-primary/90 text-white shadow-xl active:scale-95 transition-all"
        >
          {loading
            ? "Creating..."
            : "Create Solution"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePanel;