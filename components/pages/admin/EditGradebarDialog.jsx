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

const EditGradebarDialog = ({ open, onClose, ladderId, gradebarDetails }) => {
  const dispatch = useDispatch();
  const { gradebarDetails: reduxGradebars } = useSelector(
    (state) => state.gradebar
  );



  const [localGrades, setLocalGrades] = useState([]);

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
      dispatch(fetchGradebars(ladderId)); // refresh
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("❌ Failed to update gradebar");
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
    </>
  );
};

export default EditGradebarDialog;