"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SavedIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDocs(collection(db, "savedIdeas", user.uid, "saved"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIdeas(data);
    };
    load();
  }, []);

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">
        Saved Ideas
      </h1>

      {ideas.length === 0 && (
        <p className="text-gray-400">No saved ideas.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ideas.map((idea: any) => (
          <div
            key={idea.id}
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl"
          >
            <h2 className="text-xl font-bold text-yellow-400">
              {idea.ideaTitle}
            </h2>

            <p className="text-gray-400 mt-2 line-clamp-3">
              {idea.description}
            </p>

            <button
              className="w-full mt-4 py-2 bg-yellow-500 text-black rounded font-bold"
              onClick={() => router.push(`/ideas/${idea.id}`)}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
