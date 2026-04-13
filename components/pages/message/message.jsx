// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// // ⚙️ Socket connection (backend server ka URL daalein)
// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId, ladderId }) => {
//   const [messages, setMessages] = useState([]); // all group messages
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const chatEndRef = useRef(null);

//   // 🟢 Fetch sender name from backend using senderId
//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   // 🟢 Join ladder-specific room
//   useEffect(() => {
//     if (ladderId) {
//       socket.emit("join_room", ladderId);
//     }
//   }, [ladderId]);

//   // 🟢 Listen for incoming group messages
//   useEffect(() => {
//     socket.on("group_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => socket.off("group_message");
//   }, []);

//   // 🟢 Fetch old messages (from DB)
//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => setMessages(res.data || []))
//       .catch((err) => console.error("❌ Error fetching messages:", err));
//   }, [ladderId]);

//   // 🟢 Auto-scroll to bottom
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // 🟢 Send new message
//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date(),
//     };

//     // Emit to socket & update local UI
//     socket.emit("group_message", msgData);
//     setMessages((prev) => [...prev, msgData]);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-100 p-4 rounded-xl shadow-lg">
//       <h2 className="text-lg font-semibold mb-3 text-gray-700">
//         📢 Public Message Board
//       </h2>

//       {/* Messages section */}
//       <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow-inner space-y-3">
//         {messages.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg, i) => (
//             <div key={i} className="flex flex-col">
//               <div className="bg-gray-200 px-3 py-2 rounded-lg shadow max-w-[75%]">
//                 <p className="text-sm whitespace-pre-line">{msg.message}</p>
//               </div>
//               <p className="text-xs text-gray-600 mt-1">
//                 <strong>{msg.senderName || "Unknown"}</strong> •{" "}
//                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           ))
//         )}
//         <div ref={chatEndRef} />
//       </div>

//       {/* Message input */}
//       <div className="mt-4 flex">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 border rounded-lg px-3 py-2 mr-2"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;






// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const chatEndRef = useRef(null);

//   // ✅ Fetch sender name
//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   // ✅ Join ladder room
//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   // ✅ Listen for new messages
//   useEffect(() => {
//     socket.on("group_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });
//     return () => socket.off("group_message");
//   }, []);

//   // ✅ Fetch previous messages
//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => setMessages(res.data || []))
//       .catch((err) => console.error("❌ Error fetching messages:", err));
//   }, [ladderId]);

//   // ✅ Scroll to bottom after messages update (ensures first & new messages visible)
//   useLayoutEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
//     }
//   }, [messages]);

//   // ✅ Send message
//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date(),
//     };

//     socket.emit("group_message", msgData);
//     setMessages((prev) => [...prev, msgData]);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-100 p-4 rounded-xl shadow-lg">
//       <h2 className="text-lg font-semibold mb-3 text-gray-700 text-center">
//         📢 Public Message Board
//       </h2>

//       {/* ✅ Scrollable Message Area */}
//       <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-lg shadow-inner">
//         <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
//           {messages.length === 0 ? (
//             <p className="text-gray-500 text-sm text-center">
//               No messages yet. Be the first to post!
//             </p>
//           ) : (
//             messages.map((msg, i) => (
//               <div key={i} className="flex flex-col">
//                 <div className="bg-gray-200 px-3 py-2 rounded-lg shadow max-w-[80%] break-words">
//                   <p className="text-sm whitespace-pre-line">{msg.message}</p>
//                 </div>
//                 <p className="text-xs text-gray-600 mt-1">
//                   <strong>{msg.senderName || "Unknown"}</strong> •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             ))
//           )}
//           <div ref={chatEndRef} />
//         </div>
//       </div>

//       {/* ✅ Input Section — Always Visible */}
//       <div className="mt-3 flex items-center bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;





// ==================final hai=============================


// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   useEffect(() => {
//     socket.on("group_message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });
//     return () => socket.off("group_message");
//   }, []);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => setMessages(res.data || []))
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim()) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date(),
//     };
//     socket.emit("group_message", msgData);
//     setMessages((prev) => [...prev, msgData]);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
//         📢 Public Message Board
//       </h2>

//       {/* ✅ Scrollable Messages */}
//       <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg shadow-inner p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 ? (
//           <p className="text-gray-400 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg, i) => (
//             <div key={i} className="flex flex-col">
//               <div className="bg-gray-700 px-3 py-2 rounded-lg shadow max-w-[80%] break-words">
//                 <p className="text-sm whitespace-pre-line">{msg.message}</p>
//               </div>
//               <p className="text-xs text-gray-400 mt-1">
//                 <strong className="text-gray-200">
//                   {msg.senderName || "Unknown"}
//                 </strong>{" "}
//                 •{" "}
//                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           ))
//         )}
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ Visible Input Box */}
//       <div className="mt-3 flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg sticky bottom-0">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;






// =====================yhpure hai ======================================






// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   useEffect(() => {
//     // ✅ Avoid duplicates: use unique ID check
//     socket.on("group_message", (data) => {
//       setMessages((prev) => {
//         const isDuplicate = prev.some(
//           (msg) =>
//             msg.timestamp === data.timestamp &&
//             msg.senderId === data.senderId &&
//             msg.message === data.message
//         );
//         if (isDuplicate) return prev;
//         return [...prev, data];
//       });
//     });

//     return () => socket.off("group_message");
//   }, []);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => setMessages(res.data || []))
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };

//     // ✅ Emit message to server only (don't add locally)
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
//         Message Board
//       </h2>

//       {/* ✅ Scrollable Message Area */}
//       <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg shadow-inner p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 ? (
//           <p className="text-gray-400 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg, i) => (
//             <div key={i} className="flex flex-col">
//               <div className="bg-gray-700 px-3 py-2 rounded-lg shadow max-w-[80%] break-words">
//                 <p className="text-sm whitespace-pre-line">{msg.message}</p>
//               </div>
//               <p className="text-xs text-gray-400 mt-1">
//                 <strong className="text-gray-200">
//                   {msg.senderName || "Unknown"}
//                 </strong>{" "}
//                 •{" "}
//                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           ))
//         )}
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ Visible Input Box */}
//       <div className="mt-3 flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg sticky bottom-0">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
//         >
//           Send
//         </button>
//       </div>


      
//     </div>


//     // ==========================neew hai==============================




//   );
// };

// export default MessageBoard;





// =================================latest 31-10-25===========================





// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   useEffect(() => {
//     socket.on("group_message", (data) => {
//       setMessages((prev) => {
//         const isDuplicate = prev.some(
//           (msg) =>
//             msg.timestamp === data.timestamp &&
//             msg.senderId === data.senderId &&
//             msg.message === data.message
//         );
//         if (isDuplicate) return prev;
//         return [...prev, data];
//       });
//     });

//     return () => socket.off("group_message");
//   }, []);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => setMessages(res.data || []))
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };

//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       {/* Header */}
//       <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
//         Message Board
//       </h2>

//       {/* ✅ Scrollable Messages Area */}
//       <div className="flex-1 bg-gray-800 rounded-lg shadow-inner overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 ? (
//           <p className="text-gray-400 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg, i) => (
//             <div key={i} className="flex flex-col">
//               <div className="bg-gray-700 px-3 py-2 rounded-lg shadow max-w-[80%] break-words">
//                 <p className="text-sm whitespace-pre-line">{msg.message}</p>
//               </div>
//               <p className="text-xs text-gray-400 mt-1">
//                 <strong className="text-gray-200">
//                   {msg.senderName || "Unknown"}
//                 </strong>{" "}
//                 •{" "}
//                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           ))
//         )}
//         {/* add a spacer div for bottom padding */}
//         <div className="h-6" />
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ Fixed Input Section */}
//       <div className="pt-3">
//         <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg">
//           <input
//             type="text"
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;





// ==============ultimate-latest-31-10-25=======================






// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   useEffect(() => {
//     socket.on("group_message", (data) => {
//       setMessages((prev) => {
//         const isDuplicate = prev.some(
//           (msg) =>
//             msg.timestamp === data.timestamp &&
//             msg.senderId === data.senderId &&
//             msg.message === data.message
//         );
//         if (isDuplicate) return prev;
//         return [...prev, data];
//       });
//     });

//     return () => socket.off("group_message");
//   }, []);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => setMessages(res.data || []))
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };

//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       {/* Header */}
//       <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
//         Message Board
//       </h2>

//       {/* ✅ Scrollable Message Area */}
//       <div className="flex-1 bg-gray-800 rounded-lg shadow-inner overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 ? (
//           <p className="text-gray-400 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg, i) => {
//             const isOwn = msg.senderId === senderId;
//             return (
//               <div
//                 key={i}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-line">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn ? "text-blue-300 text-right" : "text-gray-400 text-left"
//                   }`}
//                 >
//                   <strong className="text-gray-200">
//                     {msg.senderName || "Unknown"}
//                   </strong>{" "}
//                   •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })
//         )}
//         <div className="h-6" />
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ Input Section */}
//       <div className="pt-3">
//         <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg">
//           <input
//             type="text"
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;







// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000", { transports: ["websocket"] });

// const MessageBoard = ({ senderId: propSenderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   // ✅ Restore senderId
//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(propSenderId);
//       localStorage.setItem("senderId", propSenderId);
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   // ✅ Fetch sender name
//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`http://localhost:3000/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   // ✅ Join socket room
//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   // ✅ Unique ID per message
//   const getMsgId = (msg) =>
//     `${msg.senderId}-${msg.timestamp}-${msg.message.slice(0, 10)}`;

//   // ✅ Load from localStorage
//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(JSON.parse(saved));
//   }, [ladderId]);

//   // ✅ Fetch from backend safely
//   useEffect(() => {
//     if (!ladderId) return;

//     axios
//       .get(`http://localhost:3000/group-messages/${ladderId}`)
//       .then((res) => {
//         const serverMsgs = res.data || [];
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map(getMsgId));
//           const merged = [
//             ...prev,
//             ...serverMsgs.filter((m) => !existingIds.has(getMsgId(m))),
//           ];
//           localStorage.setItem(`messages_${ladderId}`, JSON.stringify(merged));
//           return merged;
//         });
//       })
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   // ✅ Socket listener (main source of truth)
//   useEffect(() => {
//     const handleIncoming = (data) => {
//       setMessages((prev) => {
//         const id = getMsgId(data);
//         if (prev.some((m) => getMsgId(m) === id)) return prev;
//         const updated = [...prev, data];
//         localStorage.setItem(`messages_${ladderId}`, JSON.stringify(updated));
//         return updated;
//       });
//     };

//     socket.on("group_message", handleIncoming);
//     return () => socket.off("group_message", handleIncoming);
//   }, [ladderId]);

//   // ✅ Auto-scroll
//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✅ Send message — rely only on socket (no local push)
//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;

//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };

//     socket.emit("group_message", msgData); // will arrive back through socket
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       {/* Header */}
//       <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
//         Message Board
//       </h2>

//       {/* ✅ Messages */}
//       <div className="flex-1 bg-gray-800 rounded-lg shadow-inner overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 ? (
//           <p className="text-gray-400 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg) => {
//             const isOwn = msg.senderId === senderId;
//             const id = getMsgId(msg);
//             return (
//               <div
//                 key={id}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-line">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn ? "text-blue-300 text-right" : "text-gray-400 text-left"
//                   }`}
//                 >
//                   <strong className="text-gray-200">
//                     {msg.senderName || "Unknown"}
//                   </strong>{" "}
//                   •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })
//         )}
//         <div className="h-6" />
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ Input */}
//       <div className="pt-3">
//         <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg">
//           <input
//             type="text"
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;








// ===========yh working tha build gya tha iska==============================


// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", { transports: ["websocket"] });

// const MessageBoard = ({ senderId: propSenderId, ladderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   // ✅ Initialize & persist senderId
//   useEffect(() => {
//     if (propSenderId) {
//       const id = String(propSenderId);
//       setSenderId(id);
//       localStorage.setItem("senderId", id);
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   // ✅ Fetch sender name
//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   // ✅ Join socket room
//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   // ✅ Generate unique key per message
//   const getMsgId = (msg) =>
//     `${msg.senderId}-${msg.timestamp}-${msg.message.slice(0, 15)}`;

//   // ✅ Normalize all messages
//   const normalizeMessages = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   // ✅ Load messages from localStorage
//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) {
//       const parsed = JSON.parse(saved);
//       setMessages(normalizeMessages(parsed));
//     }
//   }, [ladderId]);

//   // ✅ Fetch from backend & merge safely
//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => {
//         const serverMsgs = normalizeMessages(res.data || []);
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map(getMsgId));
//           const merged = [
//             ...prev,
//             ...serverMsgs.filter((m) => !existingIds.has(getMsgId(m))),
//           ];
//           localStorage.setItem(
//             `messages_${ladderId}`,
//             JSON.stringify(merged)
//           );
//           return merged;
//         });
//       })
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   // ✅ Socket message listener
//   useEffect(() => {
//     const handleIncoming = (data) => {
//       const normalized = normalizeMessages([data])[0];
//       setMessages((prev) => {
//         const id = getMsgId(normalized);
//         if (prev.some((m) => getMsgId(m) === id)) return prev;
//         const updated = [...prev, normalized];
//         localStorage.setItem(
//           `messages_${ladderId}`,
//           JSON.stringify(updated)
//         );
//         return updated;
//       });
//     };

//     socket.on("group_message", handleIncoming);
//     return () => socket.off("group_message", handleIncoming);
//   }, [ladderId]);

//   // ✅ Scroll to latest message
//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✅ Send message
//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   return (
//     <div className="flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       {/* Header */}
//       <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
//           ChatBoard
//       </h2>

//       {/* ✅ Messages Area */}
//       <div className="flex-1 bg-gray-800 rounded-lg shadow-inner overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 ? (
//           <p className="text-gray-400 text-sm text-center">
//             No messages yet. Be the first to post!
//           </p>
//         ) : (
//           messages.map((msg) => {
//             const isOwn = msg.senderId === senderId; // ✅ Always string
//             const id = getMsgId(msg);
//             return (
//               <div
//                 key={id}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-line">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn
//                       ? "text-blue-300 text-right"
//                       : "text-gray-400 text-left"
//                   }`}
//                 >
//                   <strong className="text-gray-200">
//                     {msg.senderName || "Unknown"}
//                   </strong>{" "}
//                   •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })
//         )}
//         <div className="h-6" />
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ Input Section */}
//       <div className="pt-3">
//         <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg">
//           <input
//             type="text"
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;







// ================yh new changes hai===============================




// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", { transports: ["websocket"] });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   // ✅ Initialize & persist senderId
//   useEffect(() => {
//     if (propSenderId) {
//       const id = String(propSenderId);
//       setSenderId(id);
//       localStorage.setItem("senderId", id);
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   // ✅ Fetch sender name
//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   // ✅ Join socket room
//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   // ✅ Generate unique key per message
//   const getMsgId = (msg) =>
//     `${msg.senderId}-${msg.timestamp}-${msg.message.slice(0, 15)}`;

//   // ✅ Normalize all messages
//   const normalizeMessages = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   // ✅ Load messages from localStorage
//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) {
//       const parsed = JSON.parse(saved);
//       setMessages(normalizeMessages(parsed));
//     }
//   }, [ladderId]);

//   // ✅ Fetch from backend & merge safely
//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => {
//         const serverMsgs = normalizeMessages(res.data || []);
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map(getMsgId));
//           const merged = [
//             ...prev,
//             ...serverMsgs.filter((m) => !existingIds.has(getMsgId(m))),
//           ];
//           localStorage.setItem(
//             `messages_${ladderId}`,
//             JSON.stringify(merged)
//           );
//           return merged;
//         });
//       })
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [ladderId]);

//   // ✅ Socket message listener
//   useEffect(() => {
//     const handleIncoming = (data) => {
//       const normalized = normalizeMessages([data])[0];
//       setMessages((prev) => {
//         const id = getMsgId(normalized);
//         if (prev.some((m) => getMsgId(m) === id)) return prev;
//         const updated = [...prev, normalized];
//         localStorage.setItem(
//           `messages_${ladderId}`,
//           JSON.stringify(updated)
//         );
//         return updated;
//       });
//     };

//     socket.on("group_message", handleIncoming);
//     return () => socket.off("group_message", handleIncoming);
//   }, [ladderId]);

//   // ✅ Scroll to latest message
//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✅ Send message
//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   return (
//     <div className="relative flex flex-col w-full h-[80vh] bg-gray-900 text-white p-4 rounded-xl shadow-lg">
//       {/* ✅ Header with Close Button */}
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="text-lg font-semibold text-center flex-1">ChatBoard</h2>
//         <button
//           onClick={() => {
//             if (onClose) onClose();
//           }}
//           className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
//           title="Close"
//         >
//           ×
//         </button>
//       </div>

//       {/* ✅ Messages Area (Scrollbar always visible + padding fix) */}
//       <div className="flex-1 bg-gray-800 rounded-lg shadow-inner overflow-y-scroll p-4 space-y-3 scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-700 scroll-smooth">
//         <div className="pt-2"> {/* small top padding to prevent cutoff */}
//           {messages.length === 0 ? (
//             <p className="text-gray-400 text-sm text-center">
//               No messages yet. Be the first to post!
//             </p>
//           ) : (
//             messages.map((msg) => {
//               const isOwn = msg.senderId === senderId;
//               const id = getMsgId(msg);
//               return (
//                 <div
//                   key={id}
//                   className={`flex flex-col ${
//                     isOwn ? "items-end" : "items-start"
//                   }`}
//                 >
//                   <div
//                     className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                       isOwn
//                         ? "bg-blue-600 text-white rounded-br-none"
//                         : "bg-gray-700 text-gray-100 rounded-bl-none"
//                     }`}
//                   >
//                     <p className="text-sm whitespace-pre-line">{msg.message}</p>
//                   </div>
//                   <p
//                     className={`text-xs mt-1 ${
//                       isOwn
//                         ? "text-blue-300 text-right"
//                         : "text-gray-400 text-left"
//                     }`}
//                   >
//                     <strong className="text-gray-200">
//                       {msg.senderName || "Unknown"}
//                     </strong>{" "}
//                     •{" "}
//                     {new Date(msg.timestamp).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </p>
//                 </div>
//               );
//             })
//           )}
//           <div className="h-6" />
//           <div ref={chatEndRef} />
//         </div>
//       </div>

//       {/* ✅ Input Section */}
//       <div className="pt-3">
//         <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg">
//           <input
//             type="text"
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;

















// =======================idhar sab badhiya hai===================



// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", {
//   transports: ["websocket"],
// });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(String(propSenderId));
//       localStorage.setItem("senderId", String(propSenderId));
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   const normalize = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(normalize(JSON.parse(saved)));
//   }, [ladderId]);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => setMessages(normalize(res.data || [])))
//       .catch(() => {});
//   }, [ladderId]);

//   useEffect(() => {
//     const handleMsg = (data) => {
//       const newMsg = normalize([data])[0];
//       setMessages((prev) => [...prev, newMsg]);
//     };
//     socket.on("group_message", handleMsg);
//     return () => socket.off("group_message", handleMsg);
//   }, []);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   return (
//     // <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[400px] h-[80vh] bg-gray-900 text-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-700">
//     <div className="absolute top-0 left-0 w-full h-full bg-gray-900 text-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-700 z-50">
      
//       {/* ✅ HEADER (ALWAYS VISIBLE) */}
//       <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
//         <h2 className="text-lg font-semibold flex-1 text-center">
//           ChatBoard
//         </h2>
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl font-bold"
//         >
//           ×
//         </button>
//       </div>

//       {/* ✅ MESSAGES AREA (ONLY SCROLLS THIS) */}
//       <div className="flex-1 overflow-y-auto p-4 bg-gray-800 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
//         {messages.length === 0 && (
//           <div className="text-center text-gray-400 text-sm py-3">
//             No messages yet. Be the first to post!
//           </div>
//         )}

//         {messages.map((msg, i) => {
//           const isOwn = msg.senderId === senderId;
//           return (
//             <div
//               key={i}
//               className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
//             >
//               <div
//                 className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                   isOwn
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-gray-700 text-gray-100 rounded-bl-none"
//                 }`}
//               >
//                 <p className="text-sm whitespace-pre-line">{msg.message}</p>
//               </div>
//               <p
//                 className={`text-xs mt-1 ${
//                   isOwn ? "text-blue-300" : "text-gray-400"
//                 }`}
//               >
//                 <strong>{msg.senderName}</strong> •{" "}
//                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           );
//         })}
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ INPUT (ALWAYS AT BOTTOM) */}
//       <div className="bg-gray-800 border-t border-gray-700 p-3 flex items-center flex-shrink-0">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;










// ========================last gya tha build =======================







// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", {
//   transports: ["websocket"],
// });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(String(propSenderId));
//       localStorage.setItem("senderId", String(propSenderId));
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   const normalize = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(normalize(JSON.parse(saved)));
//   }, [ladderId]);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => setMessages(normalize(res.data || [])))
//       .catch(() => {});
//   }, [ladderId]);

//   useEffect(() => {
//     const handleMsg = (data) => {
//       const newMsg = normalize([data])[0];
//       setMessages((prev) => [...prev, newMsg]);
//     };
//     socket.on("group_message", handleMsg);
//     return () => socket.off("group_message", handleMsg);
//   }, []);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   // ✅ Prevent background scroll when board is open
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   return (
//     <div className="absolute top-0 left-0 w-full h-full bg-gray-900 text-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-700 z-50">
//       {/* ✅ HEADER */}
//       <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
//         <h2 className="text-lg font-semibold flex-1 text-center">
//           ChatBoard
//         </h2>
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl font-bold"
//         >
//           ×
//         </button>
//       </div>

//       {/* ✅ MESSAGES AREA (Scroll Only Inside) */}
//       <div
//         className="flex-1 overflow-y-auto p-4 bg-gray-800 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
//         style={{ overscrollBehavior: "contain" }} // ✅ Prevent outer scroll
//       >
//         {messages.length === 0 && (
//           <div className="text-center text-gray-400 text-sm py-3">
//             No messages yet. Be the first to post!
//           </div>
//         )}

//         {messages.map((msg, i) => {
//           const isOwn = msg.senderId === senderId;
//           return (
//             <div
//               key={i}
//               className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
//             >
//               <div
//                 className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                   isOwn
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-gray-700 text-gray-100 rounded-bl-none"
//                 }`}
//               >
//                 <p className="text-sm whitespace-pre-line">{msg.message}</p>
//               </div>
//               <p
//                 className={`text-xs mt-1 ${
//                   isOwn ? "text-blue-300" : "text-gray-400"
//                 }`}
//               >
//                 <strong>{msg.senderName}</strong> •{" "}
//                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>
//           );
//         })}
//         <div ref={chatEndRef} />
//       </div>

//       {/* ✅ INPUT SECTION */}
//       <div className="bg-gray-800 border-t border-gray-700 p-3 flex items-center flex-shrink-0">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;














// ==================================sham ka code=======================


// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", {
//   transports: ["websocket"],
// });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(String(propSenderId));
//       localStorage.setItem("senderId", String(propSenderId));
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   const normalize = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(normalize(JSON.parse(saved)));
//   }, [ladderId]);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => setMessages(normalize(res.data || [])))
//       .catch(() => {});
//   }, [ladderId]);

//   useEffect(() => {
//     const handleMsg = (data) => {
//       const newMsg = normalize([data])[0];
//       setMessages((prev) => [...prev, newMsg]);
//     };
//     socket.on("group_message", handleMsg);
//     return () => socket.off("group_message", handleMsg);
//   }, []);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   // ✅ Prevent background scroll when open
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   return (
//     <div
//       className="
//         fixed
//         inset-0
//         flex
//         items-center
//         justify-center
//         z-[9999]
//         bg-transparent
//       "
//     >
//       <div
//         className="
//           w-[95vw]
//           max-w-[400px]
//           h-[85vh]
//           sm:h-[80vh]
//           bg-gray-900
//           text-white
//           rounded-xl
//           shadow-2xl
//           flex
//           flex-col
//           overflow-hidden
//           border
//           border-gray-700
//         "
//       >
//         {/* ✅ HEADER */}
//         <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0 relative">
//           <h2 className="text-lg font-semibold flex-1 text-center">
//             ChatBoard
//           </h2>
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-2 text-gray-400 hover:text-white text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         {/* ✅ MESSAGES AREA */}
//         <div
//           className="
//             flex-1
//             overflow-y-auto
//             p-4
//             bg-gray-800
//             space-y-3
//             scrollbar-thin
//             scrollbar-thumb-gray-600
//             scrollbar-track-gray-700
//           "
//           style={{
//             overscrollBehavior: "contain",
//             minHeight: 0,
//           }}
//         >
//           {messages.length === 0 && (
//             <div className="text-center text-gray-400 text-sm py-3">
//               No messages yet. Be the first to post!
//             </div>
//           )}

//           {messages.map((msg, i) => {
//             const isOwn = msg.senderId === senderId;
//             return (
//               <div
//                 key={i}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-line">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn ? "text-blue-300" : "text-gray-400"
//                   }`}
//                 >
//                   <strong>{msg.senderName}</strong> •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })}
//           <div ref={chatEndRef} />
//         </div>

//         {/* ✅ INPUT SECTION */}
//         <div className="bg-gray-800 border-t border-gray-700 p-3 flex items-center flex-shrink-0">
//           <input
//             type="text"
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold ml-2"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;








//part-2




// ==============================





// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", {
//   transports: ["websocket"],
// });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(String(propSenderId));
//       localStorage.setItem("senderId", String(propSenderId));
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   const normalize = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(normalize(JSON.parse(saved)));
//   }, [ladderId]);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => setMessages(normalize(res.data || [])))
//       .catch(() => {});
//   }, [ladderId]);

//   useEffect(() => {
//     const handleMsg = (data) => {
//       const newMsg = normalize([data])[0];
//       setMessages((prev) => [...prev, newMsg]);
//     };
//     socket.on("group_message", handleMsg);
//     return () => socket.off("group_message", handleMsg);
//   }, []);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   // ✅ Prevent background scroll when open
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   return (
//     <div
//       className="
//         fixed
//         inset-0
//         flex
//         items-center
//         justify-center        
//       "
//     >
//       <div
//         className="
//           w-[70vw]
//           max-w-[280px]
//           h-[55vh]
//           sm:h-[55vh]
//           bg-gray-900
//           text-white
//           rounded-xl
//           shadow-2xl
//           flex
//           flex-col
//           overflow-hidden
//           border
//           border-gray-700
//         "
//       >
//         {/* ✅ HEADER */}
//         <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0 relative">
//           <h2 className="text-lg font-semibold flex-1 text-center">
//             ChatBoard
//           </h2>
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-2 text-gray-400 hover:text-white text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         {/* ✅ MESSAGES AREA */}
//         <div
//           className="
//             flex-1
//             overflow-y-auto
//             p-4
//             bg-white
//             space-y-3
//             scrollbar-thin
//             scrollbar-thumb-gray-600
//             scrollbar-track-gray-700
//           "
//           style={{
//             overscrollBehavior: "contain",
//             minHeight: 0,
//           }}
//         >
//           {messages.length === 0 && (
//             <div className="text-center text-gray-400 text-sm py-3">
//               No messages yet. Be the first to post!
//             </div>
//           )}

//           {messages.map((msg, i) => {
//             const isOwn = msg.senderId === senderId;
//             return (
//               <div
//                 key={i}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words whitespace-pre-wrap ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn ? "text-blue-300" : "text-gray-400"
//                   }`}
//                 >
//                   <strong>{msg.senderName}</strong> •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })}
//           <div ref={chatEndRef} />
//         </div>

//         {/* ✅ INPUT SECTION */}
//         <div className="bg-gray-800 border-t border-gray-700 p-3 flex items-center flex-shrink-0 space-x-2">
//           <textarea
//             placeholder="Type your message..."
//             className="flex-1 bg-transparent text-white border-none focus:ring-0 outline-none px-3 py-2 text-sm resize-none leading-5 rounded-md overflow-y-auto max-h-32"
//             value={message}
//             rows={1}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
//           >
//             Send
//           </button>
//           <button
//             onClick={onClose}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;













// =========================1/11/25=================================




// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", {
//   transports: ["websocket"],
// });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(String(propSenderId));
//       localStorage.setItem("senderId", String(propSenderId));
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   const normalize = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(normalize(JSON.parse(saved)));
//   }, [ladderId]);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => setMessages(normalize(res.data || [])))
//       .catch(() => {});
//   }, [ladderId]);

//   useEffect(() => {
//     const handleMsg = (data) => {
//       const newMsg = normalize([data])[0];
//       setMessages((prev) => [...prev, newMsg]);
//     };
//     socket.on("group_message", handleMsg);
//     return () => socket.off("group_message", handleMsg);
//   }, []);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   // ✅ Prevent background scroll when open
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 flex items-center justify-center">
//       <div
//         className="
//           w-[70vw]
//           max-w-[276px]
//           h-[50vh]
//           sm:h-[55vh]
//           bg-gray-900
//           text-white
//           rounded-xl
//           shadow-2xl
//           flex
//           flex-col
//           overflow-hidden
//           border
//           border-gray-700
//         "
//       >
//         {/* ✅ HEADER */}
//         <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0 relative">
//           <h2 className="text-lg font-semibold flex-1 text-center">
//             ChatBoard
//           </h2>
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-2 text-gray-400 hover:text-white text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         {/* ✅ MESSAGES AREA */}
//         <div
//           className="
//             flex-1
//             overflow-y-auto
//             p-4
//             bg-white
//             space-y-3
//             scrollbar-thin
//             scrollbar-thumb-gray-600
//             scrollbar-track-gray-700
//           "
//           style={{
//             overscrollBehavior: "contain",
//             minHeight: 0,
//           }}
//         >
//           {messages.length === 0 && (
//             <div className="text-center text-gray-400 text-sm py-3">
//               No messages yet. Be the first to post!
//             </div>
//           )}

//           {messages.map((msg, i) => {
//             const isOwn = msg.senderId === senderId;
//             return (
//               <div
//                 key={i}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words whitespace-pre-wrap ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn ? "text-blue-300" : "text-gray-400"
//                   }`}
//                 >
//                   <strong>{msg.senderName}</strong> •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })}
//           <div ref={chatEndRef} />
//         </div>

//         {/* ✅ INPUT SECTION (FIXED) */}
//         <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center flex-shrink-0 space-x-1">
//           <textarea
//             placeholder="Type your message..."
//             className="
//               flex-1
//               bg-gray-700
//               text-white
//               placeholder-gray-400
//               border
//               border-gray-600
//               focus:border-blue-500
//               focus:ring-0
//               outline-none
//               px-2
//               py-2
//               text-sm
//               resize-none
//               rounded-md
//               leading-5
//               overflow-y-auto
//               max-h-30
//             "
//             value={message}
//             rows={1}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
//           >
//             Send
//           </button>
//           <button
//             onClick={onClose}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;





// part-2


// "use client";

// import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io("https://sportssolutionspro.com:8443", {
//   transports: ["websocket"],
// });

// const MessageBoard = ({ senderId: propSenderId, ladderId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [senderName, setSenderName] = useState("Unknown");
//   const [senderId, setSenderId] = useState(null);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     if (propSenderId) {
//       setSenderId(String(propSenderId));
//       localStorage.setItem("senderId", String(propSenderId));
//     } else {
//       const stored = localStorage.getItem("senderId");
//       if (stored) setSenderId(stored);
//     }
//   }, [propSenderId]);

//   useEffect(() => {
//     if (!senderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/player/${senderId}`)
//       .then((res) => setSenderName(res.data?.name || "Unknown"))
//       .catch(() => setSenderName("Unknown"));
//   }, [senderId]);

//   useEffect(() => {
//     if (ladderId) socket.emit("join_room", ladderId);
//   }, [ladderId]);

//   const normalize = (arr) =>
//     arr.map((msg) => ({
//       ...msg,
//       senderId: String(msg.senderId),
//       senderName: msg.senderName || "Unknown",
//       timestamp: msg.timestamp || new Date().toISOString(),
//       message: msg.message || "",
//     }));

//   useEffect(() => {
//     if (!ladderId) return;
//     const saved = localStorage.getItem(`messages_${ladderId}`);
//     if (saved) setMessages(normalize(JSON.parse(saved)));
//   }, [ladderId]);

//   useEffect(() => {
//     if (!ladderId) return;
//     axios
//       .get(`https://sportssolutionspro.com:8443/group-messages/${ladderId}`)
//       .then((res) => setMessages(normalize(res.data || [])))
//       .catch(() => {});
//   }, [ladderId]);

//   useEffect(() => {
//     const handleMsg = (data) => {
//       const newMsg = normalize([data])[0];
//       setMessages((prev) => [...prev, newMsg]);
//     };
//     socket.on("group_message", handleMsg);
//     return () => socket.off("group_message", handleMsg);
//   }, []);

//   useLayoutEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !senderId) return;
//     const msgData = {
//       senderId,
//       senderName,
//       ladderId,
//       message,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("group_message", msgData);
//     setMessage("");
//   };

//   // ✅ Prevent background scroll when open
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   // ✅ Detect iPhone/iPad
//   const isIOS =
//     typeof navigator !== "undefined" &&
//     /iPhone|iPad|iPod/i.test(navigator.userAgent);

//   return (
//     <div className="fixed inset-0 flex items-center justify-center">
//       <div
//         className="
//           w-[40vw]
//           max-w-[276px]
//           h-[50vh]
//           sm:h-[50vh]
//           bg-gray-900
//           text-white
//           rounded-xl
//           shadow-2xl
//           flex
//           flex-col
//           overflow-hidden
//           border
//           border-gray-700
//         "
//       >
//         {/* ✅ HEADER */}
//         <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0 relative">
//           <h2 className="text-lg font-semibold flex-1 text-center">
//             ChatBoard
//           </h2>
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-2 text-gray-400 hover:text-white text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         {/* ✅ MESSAGES AREA */}
//         <div
//           className="
//             flex-1
//             overflow-y-auto
//             p-4
//             bg-white
//             space-y-3
//             scrollbar-thin
//             scrollbar-thumb-gray-600
//             scrollbar-track-gray-700
//           "
//           style={{
//             overscrollBehavior: "contain",
//             minHeight: 0,
//           }}
//         >
//           {messages.length === 0 && (
//             <div className="text-center text-gray-400 text-sm py-3">
//               No messages yet. Be the first to post!
//             </div>
//           )}

//           {messages.map((msg, i) => {
//             const isOwn = msg.senderId === senderId;
//             return (
//               <div
//                 key={i}
//                 className={`flex flex-col ${
//                   isOwn ? "items-end" : "items-start"
//                 }`}
//               >
//                 <div
//                   className={`px-3 py-2 rounded-lg shadow max-w-[80%] break-words whitespace-pre-wrap ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-700 text-gray-100 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm">{msg.message}</p>
//                 </div>
//                 <p
//                   className={`text-xs mt-1 ${
//                     isOwn ? "text-blue-300" : "text-gray-400"
//                   }`}
//                 >
//                   <strong>{msg.senderName}</strong> •{" "}
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             );
//           })}
//           <div ref={chatEndRef} />
//         </div>

//         {/* ✅ INPUT SECTION (with iPhone RETURN fix) */}
//         <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center flex-shrink-0 space-x-1">
//           <textarea
//             placeholder="Type your message..."
//             className="
//               flex-1
//               bg-gray-700
//               text-white
//               placeholder-gray-400
//               border
//               border-gray-600
//               focus:border-blue-500
//               focus:ring-0
//               outline-none
//               px-2
//               py-2
//               text-sm
//               resize-none
//               rounded-md
//               leading-5
//               overflow-y-auto
//               max-h-30
//             "
//             value={message}
//             rows={1}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={(e) => {
//               // ✅ Allow normal newline on iPhone/iPad
//               if (isIOS) return; 
//               // ✅ Desktop/Android: Enter sends message, Shift+Enter makes newline
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
//           >
//             Send
//           </button>
//           <button
//             onClick={onClose}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessageBoard;









// ============part-3====








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
