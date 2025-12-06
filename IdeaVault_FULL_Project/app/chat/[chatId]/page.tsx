"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatThread({ params }: any) {
  const { chatId } = params;
  const user = auth.currentUser;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load live messages
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(data);

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsub();
  }, [chatId]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!user) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      seen: false,
    });

    // Update chat timestamp
    await updateDoc(doc(db, "chats", chatId), {
      updatedAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="p-6 text-white max-w-2xl mx-auto flex flex-col h-screen">

      <h1 className="text-2xl font-bold text-yellow-400 mb-4">
        Chat Conversation
      </h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.senderId === user?.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-[70%] ${
                msg.senderId === user?.uid
                  ? "bg-yellow-500 text-black"
                  : "bg-zinc-800 text-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type your message…"
          className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={() => setTyping(true)}
          onBlur={() => setTyping(false)}
        />

        <button
          onClick={sendMessage}
          className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </div>

      {typing && (
        <p className="text-xs text-gray-400 mt-2">Typing…</p>
      )}
    </div>
  );
}
