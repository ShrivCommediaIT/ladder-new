"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";

const ResetGradebarDialog = ({ open, onClose, ladderId }) => {
  const dispatch = useDispatch();
  const [preset, setPreset] = useState(2); // default
  const [names, setNames] = useState(["Grade 1", "Grade 2"]); // default 2 grades
  const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

  // add new gradebar input
  const addGrade = () => {
    setNames([...names, `Grade ${names.length + 1}`]);
  };

  // update input value
  const handleChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  // reset API call
  const handleReset = async () => {
    try {
      const formData = new FormData();
      formData.append("APPKEY", "NeGame@ApPKeY!#!");
      formData.append("ladder_id", ladderId);
      formData.append("preset", preset);
      formData.append("gradebar_name", JSON.stringify(names));

      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/user/resetgradeBar`,
        {
          method: "POST",
          body: formData,
           headers: { APPKEY },
        }
      );

      const data = await res.json();
      console.log("📥 Reset API Response:", data);

      if (data.status === 200) {
        toast.success("✅ Gradebar reset successfully!");
        dispatch(fetchGradebars(ladderId)); // refresh Redux state
        onClose();
      } else {
        toast.error(data.message || "❌ Failed to reset gradebar");
      }
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("❌ Error resetting gradebar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Gradebar</DialogTitle>
        </DialogHeader>

        {/* Preset Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preset</label>
          <Input
            type="number"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            placeholder="Enter preset (e.g., 2, 3, 5)"
          />
        </div>

        {/* Dynamic Grade Names */}
        <div className="space-y-2 mt-3">
          <label className="text-sm font-medium">Gradebar Names</label>
          {names.map((name, index) => (
            <Input
              key={index}
              value={name}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Grade ${index + 1}`}
              className="mb-2"
            />
          ))}
          <Button variant="outline" size="sm" onClick={addGrade}>
            + Add Grade
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetGradebarDialog;