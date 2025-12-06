"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ExploreIdeas() {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "ideas"));
      setIdeas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    load();
  }, []);

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Explore Ideas
      </h1>

      {ideas.length === 0 && (
        <p className="text-gray-400">No ideas uploaded yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea: any) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-yellow-500"
          >
            <h2 className="text-xl font-bold text-yellow-400">{idea.title}</h2>
            <p className="text-gray-300 mt-2">{idea.teaser}</p>
            <p className="text-gray-500 text-sm mt-3">
              Category: {idea.category}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
