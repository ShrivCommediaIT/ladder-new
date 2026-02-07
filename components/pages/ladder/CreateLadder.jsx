

"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createLadder } from "@/redux/slices/ladderSlice";
import { setLadderId } from "@/redux/slices/userSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateLadder = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state) => state.user?.user);
  const loading = useSelector((state) => state.createLadder?.loading);

  const [ladderName, setLadderName] = useState("");

  const handleCreateLadder = () => {
    if (!user?.id || !ladderName.trim()) {
      toast.warn("User ID or Ladder Name missing.");
      return;
    }

    if (ladderName.trim().toLowerCase() !== user.name?.trim().toLowerCase()) {
      toast.error("Ladder name must exactly match your registered name.");
      return;
    }

    dispatch(createLadder({ user_id: user.id, name: ladderName }))
      .unwrap()
      .then((res) => {
        toast.success(res?.success_message || "Ladder created successfully.");
        setLadderName("");

        const createdLadderId = res?.data?.ladder_id;
        if (createdLadderId) {
          dispatch(setLadderId(createdLadderId));
        }

        // ✅ Redirect to login page with success message flag
        setTimeout(() => {
          // router.push("/login-page?from=ladder");
          router.push(`/login-page?from=ladder&ladderName=${encodeURIComponent(ladderName)}`);
        }, 1000);
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to create ladder. Please try again.");
      });
  };

  return (
    <div className="w-full min-h-screen mx-auto p-4 space-y-6 bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 flex items-center justify-center">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <Card className="shadow-md border rounded-none w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">Create New Ladder</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ladderName" className="font-semibold text-lg">
              Ladder Name
            </Label>
            <Input
              id="ladderName"
              type="text"
              placeholder="Enter new ladder name (must match your registered name)"
              value={ladderName}
              onChange={(e) => setLadderName(e.target.value)}
              className="!py-5 rounded-none"
            />
            {user?.name && (
              <p className="text-sm text-gray-600">
                <span>Note :</span> Ladder name must match your registered name:{" "}
                <strong>{user.name}</strong>
              </p>
            )}
          </div>

          <Button
            onClick={handleCreateLadder}
            disabled={!ladderName || loading}
            className="bg-blue-600 hover:bg-blue-700 transition duration-300 rounded-none font-semibold"
          >
            {loading ? "Creating..." : "Create Ladder"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLadder;