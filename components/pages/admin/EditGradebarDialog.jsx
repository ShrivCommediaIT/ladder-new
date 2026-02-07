"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
// import { fetchGradebars, updategradeBar } from "@/redux/slices/gradebarSlice";

const EditGradebarDialog = ({ open, onClose, ladderId, gradebarDetails }) => {
  const dispatch = useDispatch();
  const { gradebarDetails: reduxGradebars } = useSelector(
    (state) => state.gradebar
  );

  const APPKEY =
    "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

  const [localGrades, setLocalGrades] = useState([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [preset, setPreset] = useState("");
  const [resetBaseName, setResetBaseName] = useState("");

  // Load gradebars from Redux first, fallback to props
  useEffect(() => {
    const source =
      reduxGradebars.length > 0 ? reduxGradebars : gradebarDetails || [];
    setLocalGrades(
      source.map((g) => ({
        ...g,
        gradebar_name: g.gradebar_name || "",
      }))
    );
  }, [reduxGradebars, gradebarDetails]);

  // Handle input changes
  const handleInputChange = (index, value) => {
    setLocalGrades((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], gradebar_name: value };
      return updated;
    });
  };

  // Save API call
  const handleSave = async () => {
    if (!ladderId) {
      toast.error("Ladder ID not found");
      return;
    }

    const payload = {
      gradebar_id: ladderId,
      gradebar_details: localGrades.map((g) => ({
        id: g.id,
        gradebar_name: g.gradebar_name,
      })),
    };

    try {
      await dispatch(updategradeBar(payload)).unwrap();
      // toast.success(" Gradebar updated successfully!");
      dispatch(fetchGradebars(ladderId)); // refresh
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("❌ Failed to update gradebar");
    }
  };

  // Confirm Reset API call (auto-generate details)
  const handleConfirmReset = async () => {
    if (!preset || !resetBaseName) {
      toast.error("⚠️ Please enter both Preset and Base Name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("APPKEY", "NeGame@ApPKeY!#!");
      formData.append("gradebar_id", ladderId);
      formData.append("ladder_id", ladderId);
      formData.append("preset", preset);
      formData.append("gradebar_name", resetBaseName);

      // Auto-generate gradebar_details
      for (let i = 0; i < Number(preset); i++) {
        formData.append("gradebar_details[]", `${resetBaseName} ${i}`);
      }

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
        // toast.success("✅ Gradebar reset successfully!");
        dispatch(fetchGradebars(ladderId));
        setResetDialogOpen(false);
        onClose();
      } else {
        toast.error(data.message || "❌ Failed to reset gradebar");
      }
    } catch (err) {
      console.error("Reset failed:", err);
      toast.error("❌ Error resetting gradebar");
    }
  };

  return (
    <>
      {/* Main Edit Dialog */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sections</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {localGrades.map((grade, index) => (
              <div key={grade.id || index} className="flex items-center gap-2">
                <Input
                  value={grade.gradebar_name}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Grade ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-2 mt-4">
            {/* <Button
              variant="destructive"
              onClick={() => setResetDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset
            </Button> */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Gradebar</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <Input
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              placeholder="Enter Preset (e.g., 3)"
              type="number"
              min="1"
            />
            <Input
              value={resetBaseName}
              onChange={(e) => setResetBaseName(e.target.value)}
              placeholder="Enter Base Gradebar Name (e.g., kitu)"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditGradebarDialog;