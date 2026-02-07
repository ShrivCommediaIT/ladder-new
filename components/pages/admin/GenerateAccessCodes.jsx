

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, X } from "lucide-react";

function AccessCodeParts({
  defaultPart1 = "STSRDX",
  defaultPart2 = "4734",
}) {
  const [part1, setPart1] = useState(defaultPart1);
  const [part2, setPart2] = useState(defaultPart2);

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-[#0047BB] to-[#051C4E] text-white p-6 space-y-5 shadow-2xl rounded-xl border border-white/10">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-wide">
          Your Access Codes
        </h3>
        <p className="text-[11px] text-slate-200/90">
          Customize these codes and share with players to access the free app.
        </p>
      </div>

      {/* Part 1 */}
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs font-semibold uppercase tracking-wide text-slate-100/90">
            Part 1
          </Label>
          <div className="relative">
            <Input
              value={part1}
              onChange={(e) => setPart1(e.target.value.toUpperCase())}
              className="h-9 bg-white/95 text-black font-semibold tracking-[0.2em] pr-8 rounded-md border-none shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="w-40 text-[10px] leading-snug text-slate-100/80">
          Change to something more memorable, maybe using club letters that have
          meaning.
        </p>
      </div>

      {/* Part 2 */}
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs font-semibold uppercase tracking-wide text-slate-100/90">
            Part 2
          </Label>
          <div className="relative">
            <Input
              value={part2}
              onChange={(e) => setPart2(e.target.value)}
              className="h-9 bg-white/95 text-black font-semibold tracking-[0.2em] pr-8 rounded-md border-none shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="w-40 text-[10px] leading-snug text-slate-100/80">
          Must be any combination of four letters or numbers.
        </p>
      </div>
    </Card>
  );
}

export function GenerateAccessCodes() {
  return (
    <div className="text-white py-4 space-y-2">
      <p className="text-sm font-semibold">
        Generate Access Codes for FREE APP{" "}
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-[#4BA8FF] underline underline-offset-2 cursor-pointer px-1 hover:text-cyan-300 transition-colors">
              Click Here
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-xl p-0">
            {/* Header with title + cross */}
            <DialogHeader className="flex flex-row items-center justify-between px-5 pt-4 pb-2 border-b border-slate-700/70">
              <DialogTitle className="text-sm font-semibold text-slate-100">
                Generate Access Codes
              </DialogTitle>

              <DialogClose asChild>
                <button
                  className="rounded-full p-1.5 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </DialogHeader>

            <div className="px-5 pb-5 pt-3">
              <AccessCodeParts />
            </div>
          </DialogContent>
        </Dialog>
      </p>
    </div>
  );
}
