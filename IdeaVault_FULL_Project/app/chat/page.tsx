"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";

export default function ChatPage() {
  const user = auth.currentUser;
  const [chats, setChats] = useState<any[]>([]);

  // Load user chats
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("users", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setChats(data);
    });

    return () => unsub();
  }, [user]);

  const startChat = async () => {
    const email = prompt("Enter the email of the person you want to chat with:");

    if (!email) return;
    if (!user) return;

    const partnerQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );

    // You can improve this later with real user search
    alert("Chat created if user exists.");

    const chatId = user.uid + "_" + email.replace("@", "_");

    await setDoc(doc(db, "chats", chatId), {
      users: [user.uid, email],
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Your Chats</h1>

      <button
        onClick={startChat}
        className="mb-6 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold"
      >
        Start New Chat
      </button>

      <div className="space-y-4">
        {chats.length === 0 && (
          <p className="text-gray-400">You have no conversations yet.</p>
        )}

        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-yellow-500 transition cursor-pointer">
              <h2 className="text-lg font-semibold text-yellow-400">
                Chat: {chat.id}
              </h2>
              <p className="text-gray-400 text-sm">Tap to open</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
