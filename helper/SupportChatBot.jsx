"use client";

import { useState } from "react";
import axios from "axios";

export default function ChatSupport() {
  const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    setLoading(true);
    setApiError("");

    const payload = {
      user_email: form.email,
      name: form.name,
      message: form.message,
    };

    const res = await axios.post(
      "https://ne-games.com/leaderBoard/api/user/helpDesk",
      payload,
      {
        headers: {
          APPKEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(res.data);

    setShowForm(false);
    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      message: "",
    });
  } catch (err) {
    console.log(err);
    setApiError("Failed to send message");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900 text-white text-2xl shadow-lg border border-slate-700"
        >
          💬
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-80 h-[520px] bg-slate-900 text-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-slate-700">

          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-700 p-3 flex justify-between">
            <span>Customer Support</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Chat */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">

            {/* Greeting */}
            <div className="flex gap-2">
              <img
                src="https://i.pravatar.cc/40"
                className="w-8 h-8 rounded-full"
              />

              <div>
                <div className="bg-slate-800 p-2 rounded-lg">
                  👋 Hi! How can I help you?
                </div>

                <div className="bg-slate-800 p-2 rounded-lg mt-2">
                  Please fill this form and we will contact you.
                </div>
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="flex gap-2">
                <img
                  src="https://i.pravatar.cc/40"
                  className="w-8 h-8 rounded-full"
                />

                <form
                  onSubmit={handleSubmit}
                  className="bg-slate-800 p-3 rounded-lg flex flex-col gap-1 w-full"
                >
                  <input
                    name="name"
                    placeholder="Name"
                    className="bg-slate-900 border border-slate-700 p-2 rounded text-white"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <span className="text-red-400 text-xs">
                      {errors.name}
                    </span>
                  )}

                  <input
                    name="email"
                    placeholder="Email"
                    className="bg-slate-900 border border-slate-700 p-2 rounded text-white"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <span className="text-red-400 text-xs">
                      {errors.email}
                    </span>
                  )}

                  <textarea
                    name="message"
                    placeholder="Message"
                    className="bg-slate-900 border border-slate-700 p-2 rounded text-white"
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && (
                    <span className="text-red-400 text-xs">
                      {errors.message}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-700 hover:bg-slate-600 p-2 rounded mt-2"
                  >
                    {loading ? "Sending..." : "Submit"}
                  </button>

                  {apiError && (
                    <span className="text-red-400 text-xs">
                      {apiError}
                    </span>
                  )}
                </form>
              </div>
            )}

            {/* Success */}
            {submitted && (
              <div className="flex gap-2">
                <img
                  src="https://i.pravatar.cc/40"
                  className="w-8 h-8 rounded-full"
                />

                <div className="bg-slate-800 p-2 rounded-lg">
                  ✅ Thank you! We will contact you soon.
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}