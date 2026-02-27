"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const AdminEditPhone = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("Success");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  //  Load user from localStorage directly
  useEffect(() => {
    const stored = localStorage.getItem("userData") || localStorage.getItem("subAdmin");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      // ✅ role check
      if (parsed.user_type === "admin" || parsed.user_type === "sub_admin") {
        setUser(parsed);
        setName(parsed.name || "");
        setPhone(parsed.phone || "");
      } else {
        setDialogTitle("Access Denied");
        setDialogMessage("Only Admin or Sub Admin can edit details");
        setOpen(true);
      }
    } catch (e) {
      console.log("localStorage parse error", e);
    }
  }, []);

  
const handleEdit = async () => {
  if (!user || !["admin", "sub_admin"].includes(user.user_type)) {
    setDialogTitle("Access Denied");
    setDialogMessage("You are not authorized");
    setOpen(true);
    return;
  }

  if (!name.trim()) {
    setDialogTitle("Error");
    setDialogMessage("Name required");
    setOpen(true);
    return;
  }

  setLoading(true);

  try {
    let url = "";
    let payload = {};

    // ✅ role based switch
    if (user.user_type === "admin") {
      url = "https://ne-games.com/leaderBoard/api/user/editDetails";

      payload = {
        id: user.id,
        user_id: user.user_id,
        name: name,
        phone: phone,
        role: user.user_type,
      };
    }

    if (user.user_type === "sub_admin") {
      url = "https://ne-games.com/leaderBoard/api/app/user/updateSubadminProfile";

      payload = {
        id: user.id,
        name: name,
        phone: phone,
      };
    }

    const res = await axios.post(url, payload, {
      headers: {
        APPKEY: APPKEY,
        "Content-Type": "application/json",
      },
    });

    if (res.data.status == 200 || res.data.status === "success") {
      // update localStorage
      const updated = { ...user, name, phone };

      if (localStorage.getItem("subAdmin")) {
        localStorage.setItem("subAdmin", JSON.stringify(updated));
      } else {
        localStorage.setItem("userData", JSON.stringify(updated));
      }

      setDialogTitle("Success");
      setDialogMessage(res.data.message || "Updated successfully");
    } else {
      setDialogTitle("API Error");
      setDialogMessage(res.data.message || "Update failed");
    }
  } catch (err) {
    setDialogTitle("Error");
    setDialogMessage(
      err.response?.data?.message || err.message || "Something wrong",
    );
  } finally {
    setLoading(false);
    setOpen(true);
  }
};



  return (
    <div className="w-full p-6">
      <h2 className="text-white text-xl font-semibold mb-4">Admin Contact</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm text-zinc-300">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-800 text-white"
          />
        </div>

        <div className="flex-1">
          <label className="text-sm text-zinc-300">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-zinc-800 text-white"
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleEdit} disabled={loading}>
            {loading ? "Updating..." : "Edit"}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEditPhone;
