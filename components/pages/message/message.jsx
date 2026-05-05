
"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://sportssolutionspro.com:8443", {
  transports: ["websocket"],
});

const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("Unknown");
  const [senderId, setSenderId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (propSenderId) {
      setSenderId(String(propSenderId));
      localStorage.setItem("senderId", String(propSenderId));
    } else {
      const stored = localStorage.getItem("senderId");
      if (stored) setSenderId(stored);
    }
  }, [propSenderId]);

  useEffect(() => {
    if (!senderId) return;
    fetch(`https://sportssolutionspro.com:8443/player/${senderId}`)
      .then((res) => res.json())
      .then((data) => setSenderName(data?.name || "Unknown"))
      .catch(() => setSenderName("Unknown"));
  }, [senderId]);

  useEffect(() => {
    if (ladderId) socket.emit("join_room", ladderId);
  }, [ladderId]);

  const normalize = (arr) =>
    arr.map((msg) => ({
      ...msg,
      senderId: String(msg.senderId),
      senderName: msg.senderName || "Unknown",
      timestamp: msg.timestamp || new Date().toISOString(),
      message: msg.message || "",
    }));

  useEffect(() => {
    if (!ladderId) return;
    const saved = localStorage.getItem(`messages_${ladderId}`);
    if (saved) setMessages(normalize(JSON.parse(saved)));
  }, [ladderId]);

  useEffect(() => {
    if (!ladderId) return;
    fetch(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
      .then((res) => res.json())
      .then((data) => setMessages(normalize(data || [])))
      .catch(() => {});
  }, [ladderId]);

  useEffect(() => {
    const handleMsg = (data) => {
      const newMsg = normalize([data])[0];
      setMessages((prev) => [...prev, newMsg]);
    };
    socket.on("group_message", handleMsg);
    return () => socket.off("group_message", handleMsg);
  }, []);

  useLayoutEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !senderId) return;
    const msgData = {
      senderId,
      senderName,
      ladderId,
      message,
      timestamp: new Date().toISOString(),
    };
    socket.emit("group_message", msgData);
    setMessage("");
  };

  // ✅ Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ✅ Detect iPhone/iPad
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="
      
          max-w-[280px]
         
          h-[50vh]
          sm:h-[50vh]
          bg-gray-900
          text-white
          rounded-xl
          shadow-2xl
          flex
          flex-col
          overflow-hidden
          border
          border-gray-700
        "
      >
        {/* ✅ HEADER */}
        <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0 relative">
          <h2 className="text-lg font-semibold flex-1 text-center">
            ChatBoard
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-2 text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* ✅ MESSAGES AREA */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-4
            bg-white
            space-y-3
            scrollbar-thin
            scrollbar-thumb-gray-600
            scrollbar-track-gray-700
          "
          style={{
            overscrollBehavior: "contain",
            minHeight: 0,
          }}
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-3">
              No messages yet. Be the first to post!
            </div>
          )}

          {messages.map((msg, i) => {
            const isOwn = msg.senderId === senderId;
            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words whitespace-pre-wrap ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? "text-blue-300" : "text-gray-400"
                  }`}
                >
                  <strong>{msg.senderName}</strong> •{" "}
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* ✅ INPUT SECTION (with iPhone RETURN fix) */}
        <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center flex-shrink-0 space-x-1">
          <textarea
            placeholder="Type your message..."
            className="
              flex-1
              bg-gray-700
              text-white
              placeholder-gray-400
              border
              border-gray-600
              focus:border-blue-500
              focus:ring-0
              outline-none
              px-2
              py-2
              text-sm
              resize-none
              rounded-md
              leading-5
              overflow-y-auto
              max-h-30
            "
            value={message}
            rows={1}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              // ✅ Allow normal newline on iPhone/iPad
              if (isIOS) return;
              // ✅ Desktop/Android: Enter sends message, Shift+Enter makes newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
          >
            Send
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBoard;
