"use client"

import React, { useState, useRef, useEffect } from 'react';
import Navbar from "@/components/shared/Navbar";

// ─── Q&A DATA ────────────────────────────────────────────────────────────────
const qaData = [
  {
    category: "Admin Setup",
    icon: "⚙️",
    items: [
      {
        q: "What's involved for Admin?",
        a: `After registering, Main Admin needs to do just three things:\n\n1. THE CLUB ID — Create the CLUB ID and PIN from your drop-down menu. This gives you sole access to the club's main admin dashboard (and the app's main admin dashboard) where all competitions appear. You may share with trusted coworkers.\n\n2. CREATE SECTION DASHBOARDS — Grant specific section administrators access to their own section dashboards with individual PINs.\n\n3. THE CLUB ROSTER — A ranked leaderboard of all members showing token totals, redeemable tokens, redemption links, and membership status.`,
      },
      {
        q: "How much admin involvement is there?",
        a: "That's it! Beyond initial setup, admin occasionally adds or removes players as membership changes — the software makes this especially easy.",
      },
      {
        q: "Setting up the free app",
        a: "All competitions are visible to admin in the app. Simply link the app to the competitions so that players may use it to upload their results.",
      },
    ],
  },
  {
    category: "Competitions",
    icon: "🏆",
    items: [
      {
        q: "How are competitions created?",
        a: `Section administrators select the competition type from a drop-down menu, upload a list of names and phone numbers, and the competition is instantly created.\n\nAvailable types:\n• Ladders — always fun, great to get started\n• Leaderboards — ideal for specific activities\n• Minileagues — fun round-robin / box game style\n• Skills/Performance Challenge Boards — unique to SSP. Coaches can choose up to 12 activities, set targets, and generate an overall ranking. Perfect for racket skills, football, badminton, athletics times, and fitness regimes.`,
      },
      {
        q: "What format should lists (CSV files) be in?",
        a: "Lists must be simple Excel CSV files: Column A = Names, Column B = Phone Numbers.\n\nTip: Pre-order or pre-group members in your CSV file before uploading. The software allows some amending but is ready for fine-tuning, not major restructuring.",
      },
    ],
  },
  {
    category: "Members & Login",
    icon: "👤",
    items: [
      {
        q: "How do members log in to the app and competitions?",
        a: "Members log into the app using the Club ID, then navigate to their competitions. For each competition, they register once with their name and a PIN of their choice.\n\nNote: SSP does not collect members' email addresses.",
      },
      {
        q: "What if registration fails?",
        a: "If registration fails, the member's name has not been added to the competition. The member should inform admin to add them, and check that the correct spelling of their name was used.",
      },
      {
        q: "How do members post their results?",
        a: "Members log into the app → click on their competition → log in with their PIN → post their results.",
      },
    ],
  },
  {
    category: "Security & Transparency",
    icon: "🔒",
    items: [
      {
        q: "How is admin security handled?",
        a: "The main administrator has sole access to the main dashboard where all section competitions are visible.\n\nSection administrators receive private dashboards with private PINs — their work is fully protected and cannot be accessed by others. This ensures the system remains stable even if internal disagreements arise.",
      },
      {
        q: "How is transparency and validation ensured?",
        a: "All posts are recorded in an Activity Log visible to all members on the competition page. Any irregularities are quickly spotted by the community.",
      },
    ],
  },
  {
    category: "Communications",
    icon: "💬",
    items: [
      {
        q: "How does intra-club communication work?",
        a: `The app enables text-messaging-style communications between selected groups:\n\n• All Club — Admin can message all members on the roster.\n• Sections Only — Section admins can message just their section members. This prevents unrelated messages (e.g., hockey updates going to footballers or cricketers).`,
      },
    ],
  },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0 }}>
    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QuestionIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 5 .5c0 2-2.5 2.5-2.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="18" r="0.8" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── FAQ ACCORDION ITEM ───────────────────────────────────────────────────────
function FAQItem({ item, isOpen, onToggle }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <div style={{
      borderRadius: "10px",
      border: `1px solid ${isOpen ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.05)"}`,
      background: isOpen ? "rgba(34,211,238,0.05)" : "rgba(0,0,0,0.2)",
      overflow: "hidden",
      transition: "border-color 0.25s, background 0.25s",
      marginBottom: "8px",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px", padding: "13px 16px", background: "none", border: "none", cursor: "pointer",
        textAlign: "left", color: isOpen ? "#22d3ee" : "#d1d5db",
        fontSize: "13.5px", fontWeight: isOpen ? "600" : "500",
        lineHeight: "1.4", transition: "color 0.2s",
      }}>
        <span style={{ flex: 1 }}>{item.q}</span>
        <ChevronIcon open={isOpen} />
      </button>
      <div style={{ height: `${height}px`, overflow: "hidden", transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div ref={bodyRef}>
          <div style={{
            padding: "12px 16px 14px 16px", color: "#9ca3af",
            fontSize: "13px", lineHeight: "1.7", whiteSpace: "pre-line",
            borderTop: `1px solid ${isOpen ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.05)"}`,
          }}>
            {item.a}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Q&A SLIDE PANEL ─────────────────────────────────────────────────────────
function QAPanel({ onClose }) {
  const [openItems, setOpenItems] = useState({});
  const [search, setSearch] = useState("");

  const toggle = (key) => setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  const filtered = qaData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "24px 16px 16px", pointerEvents: "none" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn { from { opacity:0; transform: translateX(24px) scale(0.97) } to { opacity:1; transform: translateX(0) scale(1) } }
        .qa-input::placeholder { color: rgba(255,255,255,0.4) !important; }
        .qa-scroll::-webkit-scrollbar { width: 4px; }
        .qa-scroll::-webkit-scrollbar-track { background: transparent; }
        .qa-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", pointerEvents: "auto", animation: "fadeIn 0.2s ease" }} />

      <div style={{
        position: "relative", pointerEvents: "auto", width: "min(420px, 95vw)",
        maxHeight: "calc(100vh - 40px)", background: "#0f172a", borderRadius: "18px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ background: "linear-gradient(135deg, #0891b2 0%, #1e40af 100%)", padding: "20px 20px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <QuestionIcon />
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: "700", fontSize: "16px", letterSpacing: "-0.3px" }}>Help & FAQ</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11.5px" }}>SSP Platform Guide</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CloseIcon />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} className="qa-input" style={{
              width: "100%", padding: "9px 12px 9px 32px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.2)",
              color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box",
            }} />
          </div>
        </div>

        <div className="qa-scroll" style={{ overflowY: "auto", padding: "16px", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#64748b", fontSize: "13px" }}>
              No results found for &quot;{search}&quot;
            </div>
          ) : (
            filtered.map((cat) => (
              <div key={cat.category} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "15px" }}>{cat.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    {cat.category}
                  </span>
                </div>
                {cat.items.map((item, idx) => {
                  const key = `${cat.category}-${idx}`;
                  return <FAQItem key={key} item={item} isOpen={!!openItems[key]} onToggle={() => toggle(key)} />;
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const QAndAPage = () => {
  const [qaOpen, setQaOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#07111f] text-white">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 pb-8">

        <div className="max-w-4xl mx-auto rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-8">

          {/* Title row */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-gray-100">Help &amp; FAQ</h2>
            <button
              onClick={() => setQaOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "9px 18px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg, #5b21b6, #7c3aed)",
                color: "#fff", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", boxShadow: "0 4px 16px rgba(91,33,182,0.28)",
                whiteSpace: "nowrap",
              }}
            >
              <QuestionIcon />
              Quick Help
            </button>
          </div>

          <div className="space-y-8 text-gray-300">

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">WHAT&apos;S INVOLVED FOR ADMIN?</h2>
              <p className="mb-4">After registering, Main Admin needs to do just three things which take no time at all:</p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-100 mb-2">(1) THE CLUB ID</h3>
                  <p>Admin must create the CLUB ID and PIN from his drop down menu.</p>
                  <p className="mt-2">This combination gives him and only him access to the club&apos;s main admin dashboard where all the competitions appear.</p>
                  <p className="mt-2">It also gives him and only him access to the app&apos;s main admin dashboard.</p>
                  <p className="mt-2">This gives him total overall control with no unexpected external input. He may, of course, impart this information to trusted coworkers.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 mb-2">(2) CREATE SECTION DASHBOARDS</h3>
                  <p>Admin must create access for specific section administrators to their own specific section dashboards allocating them individual pins to use with the CLUB ID.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 mb-2">(3) THE CLUB ROSTER</h3>
                  <p>This is a list of all club members. This is where the members can see their tokens totals and redeemable tokens and the link in order to redeem them. It&apos;s actually a leaderboard where the members are ranked by the number of tokens they have earned. It is also where they can see their token membership status, the more tokens the higher their status.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">SETTING UP THE FREE APP</h2>
              <p>All competitions are visible to admin in the app. Admin simply link the app to the competitions so that the players may use the app to upload their results.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">HOW MUCH ADMIN INVOLVEMENT IS THERE?</h2>
              <p>That&apos;s it as detailed above!</p>
              <p className="mt-2">Obviously, members come and go and occasionally admin has to go into the dashboard and either remove or add players, but the software makes this particularly easy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">COMPETITIONS - HOW ARE THEY CREATED?</h2>
              <p className="mb-4">Section administrators select the type of competition they want from a drop-down menu and upload a list of names and phone numbers if desired, and the competition is instantly created.</p>
              <p className="font-semibold text-gray-100 mb-2">There&apos;s a choice of:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Ladders</strong> - always fun and could be a first choice to get things started.</li>
                <li><strong>Leaderboards</strong> - great for any specific activities</li>
                <li><strong>Minileagues</strong> - fun round Robin style, box game style popular competitions</li>
                <li><strong>Skills/Performance Challenge Boards</strong> - these are unique to SSP. Coaches and trainers can choose up to 12 activities within one set of challenges and set targets to be reached. Each challenge is ranked and a total for all challenges gives the overall ranking. These are great for ongoing challenges at different activities for instance racket skills, football skills, badminton skills et cetera plus fantastic for athletics times and fitness regimes (how many press ups, squats, star jumps etc in 60 seconds)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">LISTS - Excel CSV files</h2>
              <p>Lists need to be simple Excel CSV files with column A having names and column B having phone numbers.</p>
              <p className="mt-2 italic">Advice: for speed and convenience, if members need to be in specific orders or groups, it is wise to have them pre-ordered or pre-grouped in your CSV file. The software does enable some amending, but it is ready for fine-tuning.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">ADMIN SECURITY</h2>
              <p>Within one club, there may be several sections for same sport but different gender and or age groups and there may be different sections for different Sports with these sections.</p>
              <p className="mt-2">SSP is set up to handle any number of sections.</p>
              <p className="mt-2">The main administrator has sole access to the main dashboard where he can see all the competitions created by the various sections.</p>
              <p className="mt-2">Section administrators are given access to their own private dashboards with private pin numbers so that their work is protected and cannot be accessed by anyone else.</p>
              <p className="mt-2">SSP has recognised that it is important that section administrator can guarantee their work cannot be interfered with and this protects the whole system should any person within the administration have a fallout and/or get disgruntled.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">HOW DO MEMBERS LOG IN TO THE APP AND COMPETITIONS</h2>
              <p>Members log into the app by simply using the club ID. They then navigate to the various competitions they are in.</p>
              <p className="mt-2">Members login to any competition by first registering with their name and a pin number of their choice.</p>
              <p className="mt-2">Note that SSP does not acquire your members&apos; email addresses.</p>
              <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-400 mb-1">REGISTRATION FAILURE</h3>
                <p className="text-red-300 text-sm">If a registration fails, then their name has not been added to the competition and the member needs to inform admin to add them after checking that the correct spelling of their name has been used.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">HOW DO MEMBERS POST THEIR RESULTS?</h2>
              <p>Members log into the app, click on their competition, log into their competition and post their results.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">TRANSPARENCY AND VALIDATION</h2>
              <p>All posts are reported in an activity log that all members can see and check. Any tomfoolery is very quickly spotted.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">ACTIVITY LOG</h2>
              <p>The system lists all activity in an activity log viewable on the competition pages so that members can see daily activity within the club.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                INTRACLUB COMMUNICATIONS <span className="text-sm font-normal text-gray-500">- a major plus</span>
              </h2>
              <p className="mb-4">The app enables text messaging-like communications between selected groups which is a major bonus.</p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-100 mb-1">All Club</h3>
                  <p>Admin may communicate with the whole club by sending a message to the members on the roster.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 mb-1">Sections Only</h3>
                  <p>Section administrators may want to send messages just to their section members and can do so by logging into the app under the section admin and then any message they send will only go to their section members.</p>
                  <p className="mt-2">This is essential as it prevents unwanted messages for instance about hockey going to footballers, or cricketers, or other unrelated sections.</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {qaOpen && <QAPanel onClose={() => setQaOpen(false)} />}
    </div>
  );
};

export default QAndAPage;