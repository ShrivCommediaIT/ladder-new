"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UploadPlayerLists from "@/components/pages/uploadCsv/UploadPlayerLists";

const UploadCsvModal = ({ open, onOpenChange, ladderId, ladderType, onSuccess }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:max-w-xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Upload Player List (CSV)</DialogTitle>
        </DialogHeader>
        <UploadPlayerLists
          ladderId={ladderId}
          ladderType={ladderType}
          onSuccessClose={() => {
            onOpenChange(false);
            if (typeof onSuccess === "function") {
              onSuccess();
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadCsvModal;
