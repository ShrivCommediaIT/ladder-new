"use client";

import React, { useState, useEffect, useRef } from "react";
import { postRequest } from "@/services/apiService";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, User, Bot, Loader2, RefreshCcw, HelpCircle, ChevronRight } from "lucide-react";
import Logo from "@/public/logo1.png";
import Image from "next/image";

const HELP_DESK_ENDPOINT = "/user/helpDesk";

// ✅ PROJECT KNOWLEDGE BASE
const KNOWLEDGE_BASE = [
  {
    keywords: ["what", "project", "ladder", "about", "this app"],
    answer: "SSP OS is a performance management platform. It allows clubs to track player rankings across different competition formats like Win/Lose, Skills, and Multi-league structures.",
  },
  {
    keywords: ["leaderboard", "ranking", "rank", "points", "standing"],
    answer: "Rankings are determined by performance in matches or skill activities. Admins can configure 'OrderBy' parameters to sort by highest or lowest scores. Check your dashboard to see your current standing!",
  },
  {
    keywords: ["skill", "activity", "target", "green bubble"],
    answer: "Skill ladders track specific metrics (e.g., speed, accuracy). If you reach the 'Target' set by the admin, your row highlights in green! These activities contribute to your total leaderboard points.",
  },
  {
    keywords: ["leaderboard (time)", "time", "speed", "scoring type", "less is better"],
    answer: "We support both standard Leaderboards (calculated where more points are better) and 'Leaderboard (Time)' formats (where lower times or scores are better, similar to racing or golf). admins can specify this per ladder.",
  },
  {
    keywords: ["minileague", "section", "move player"],
    answer: "A Minileague typically groups 7-10 players. Admins can move players up or down between minileagues based on their performance using the 'Move Player' tools.",
  },
  {
    keywords: ["admin", "sub-admin", "manager", "permission"],
    answer: "Master Admins control everything. Sub-admins (Section Managers) can manage specific ladders or minileagues they've been assigned to. They can edit player scores and move ranks.",
  },
  {
    keywords: ["password", "reset", "login", "account", "security"],
    answer: "You can reset your password from the login screen. We use sessionStorage to keep your login safe—it clears automatically when you close your tab.",
  },
  {
    keywords: ["csv", "upload", "import", "bulk"],
    answer: "Admins can bulk-import players using the 'Upload CSV' feature. You'll need a file with Name, Position, and optionally Email/Phone.",
  },
  {
    keywords: ["help", "support", "contact", "person", "human", "talk", "team"],
    answer: "I can help you with support! Let's get your details so our team can reach out.",
  }
];

const QUICK_OPTIONS = [
  { id: "about", label: "What is this project?", keywords: ["what"] },
  { id: "ranking", label: "How are ranks calculated?", keywords: ["leaderboard"] },
  { id: "skills", label: "What are Skill Targets?", keywords: ["skill"] },
  { id: "support", label: "Talk to Human Support", keywords: ["support"] },
];

export default function SupportChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hello! I'm the SSP OS Assistant. Ask me anything about the project or type 'help' for support.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("idle"); // idle, kb_active, name, email, message, loading, success
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addMessage = (text, sender) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const findKnowledgeAnswer = (text) => {
    const lowerText = text.toLowerCase();
    return KNOWLEDGE_BASE.find(item => 
      item.keywords.some(keyword => lowerText.includes(keyword))
    );
  };

  const handleBotResponse = async (userText) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);

    const txt = userText.toLowerCase().trim();

    // 1. Knowledge Base OR Initial Interaction
    if (step === "idle" || step === "kb_active") {
        const kbMatch = findKnowledgeAnswer(txt);
        
        // Check for affirmative OR support request
        const isSupportRequest = ["help", "support", "contact", "human", "talk", "team", "query"].some(term => txt.includes(term));
        const isAffirmative = ["yes", "ok", "okay", "sure", "yep", "do it"].some(term => txt.includes(term));

        if (kbMatch && !isSupportRequest) {
            addMessage(kbMatch.answer, "bot");
            
            setIsTyping(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setIsTyping(false);
            
            addMessage("Did that clarify your query? Below are some other things I can explain, or you can send a message directly to our support team.", "bot");
            setStep("kb_active");
            return;
        }

        if (isSupportRequest || (step === "kb_active" && isAffirmative)) {
           addMessage("No problem! Let's get you in touch with our team. What is your name?", "bot");
           setStep("name");
           return;
        }

        // Fallback
        addMessage("I'm not quite sure about that specific detail. Should I connect you with our human support team instead?", "bot");
        setStep("kb_active");
        return;
    }

    // 2. Linear Support Information Gathering
    if (step === "name") {
      setFormData((prev) => ({ ...prev, name: userText }));
      addMessage(`Nice to meet you, ${userText}! What is your email address?`, "bot");
      setStep("email");
    } else if (step === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userText.trim())) {
        addMessage("That doesn't look like a valid email. Please try again.", "bot");
        return;
      }
      setFormData((prev) => ({ ...prev, email: userText }));
      addMessage("Excellent. Finally, please describe your query or the issue you are facing.", "bot");
      setStep("message");
    } else if (step === "message") {
      const finalData = { ...formData, message: userText };
      setFormData(finalData);
      setStep("loading");
      
      try {
        await postRequest(HELP_DESK_ENDPOINT, {
          user_email: finalData.email,
          name: finalData.name,
          message: finalData.message,
        });
        
        addMessage("All set! I've dispatched your message to our support team. They'll reach out to " + finalData.email + " soon.", "bot");
        addMessage("Is there something else about the SSP OS I can help you with?", "bot");
        setStep("idle");
      } catch (err) {
        addMessage("I encountered an error while sending. Please try again in a moment.", "bot");
        setStep("message"); 
      }
    }
  };

  const onOptionClick = (option) => {
    addMessage(option.label, "user");
    handleBotResponse(option.keywords[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || step === "loading") return;

    const userText = input.trim();
    addMessage(userText, "user");
    setInput("");
    
    handleBotResponse(userText);
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const resetChat = () => {
      setMessages([
        {
          id: 1,
          sender: "bot",
          text: "👋 Hi! I'm the SSP OS Assistant. How can I help you today?",
          timestamp: new Date(),
        }
      ]);
      setStep("idle");
      setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-2xl z-50 flex items-center justify-center border border-white/20"
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-28 right-6 w-[350px] sm:w-[420px] h-[650px] bg-slate-950/90 border border-slate-800 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/30">
                    <Image src={Logo} alt="Support" width={36} height={36} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">SSP OS AI</h3>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-emerald-500/80 uppercase">Active Assistant</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={resetChat} className="p-2 text-slate-500 hover:text-white transition-all">
                      <RefreshCcw size={18} />
                  </button>
                  <button onClick={toggleChat} className="p-2 text-slate-500 hover:text-white transition-all">
                    <X size={24} />
                  </button>
              </div>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.sender === "bot" && (
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800 flex items-center justify-center flex-shrink-0">
                            <Bot size={20} />
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed tracking-wide ${
                          msg.sender === "bot" 
                            ? "bg-slate-900/80 text-slate-200 rounded-tl-none border border-slate-800 shadow-xl" 
                            : "bg-indigo-600 text-white rounded-tr-none border border-indigo-500 shadow-indigo-600/30"
                        }`}>
                          {msg.text}
                        </div>
                    </div>
                  </div>
                </div>
              ))}

              {(step === "idle" || step === "kb_active") && (
                <div className="flex flex-col gap-2 ml-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
                   {QUICK_OPTIONS.map((opt) => (
                     <button
                        key={opt.id}
                        onClick={() => onOptionClick(opt)}
                        className="text-[11px] font-bold bg-slate-900/50 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/40 py-3 px-5 rounded-xl w-fit transition-all flex items-center gap-2 group"
                     >
                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       {opt.label}
                     </button>
                   ))}
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start ml-12">
                  <div className="flex gap-1.5 p-4 bg-slate-900/80 rounded-2xl rounded-tl-none border border-slate-800">
                    <span className="w-1.5 h-1.5 bg-indigo-500/80 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900/40 border-t border-slate-800/50 backdrop-blur-md">
              <div className="relative">
                <input
                  ref={inputRef}
                  disabled={step === "loading"}
                  type="text"
                  placeholder="Type your question..."
                  className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-indigo-600/50 transition-all placeholder:text-slate-600 shadow-inner"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  disabled={!input.trim() || step === "loading"}
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg active:scale-95 disabled:opacity-20"
                >
                  {step === "loading" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <div className="mt-4 flex justify-between items-center px-2">
                 <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest">
                    AI Knowledge Bot
                  </p>
                  <div className="h-px bg-slate-800 w-12" />
                  <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest">
                    Support Mode Ready
                  </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}