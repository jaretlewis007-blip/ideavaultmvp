"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

export default function CreatorProfile() {
  const user = auth.currentUser;
  const [ideas, setIdeas] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalNDA: 0,
    trendingIdeas: 0,
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "ideas"),
      where("creatorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIdeas(data);

      // stats
      const totalIdeas = data.length;
      const totalNDA = data.reduce((sum, idea) => sum + (idea.ndaCount || 0), 0);
      const trendingIdeas = data.filter((idea) => (idea.ndaCount || 0) >= 5).length;

      setStats({
        totalIdeas,
        totalNDA,
        trendingIdeas,
      });
    });

    return () => unsub();
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-white">
        <p>Please log in to view your creator profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">
        Your Creator Profile
      </h1>

      <p className="text-gray-400 mb-10 text-lg">
        Manage your ideas, view performance, and grow your creator brand.
      </p>

      {/* ------------------------------------------------------- */}
      {/* CREATOR INFO */}
      {/* ------------------------------------------------------- */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-10">
        <h2 className="text-2xl font-bold text-yellow-400 mb-3">
          {user.email}
        </h2>

        <p className="text-gray-400 text-sm mb-3">Creator since 2025</p>

        <div className="flex gap-4 mt-4">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-semibold">
            Total Ideas: {stats.totalIdeas}
          </div>
          <div className="bg-green-500 text-black px-3 py-1 rounded-lg text-sm font-semibold">
            NDA Requests: {stats.totalNDA}
          </div>
          {stats.trendingIdeas > 0 && (
            <div className="bg-blue-500 text-black px-3 py-1 rounded-lg text-sm font-semibold">
              Trending Ideas: {stats.trendingIdeas}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* YOUR IDEAS LIST */}
      {/* ------------------------------------------------------- */}
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">
        Your Uploaded Ideas
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {ideas.map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-yellow-500 transition cursor-pointer">

              <h2 className="text-xl font-bold text-yellow-400">
                {idea.title}
              </h2>

              <p className="text-gray-400 mt-2 line-clamp-3">
                {idea.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {idea.roiEstimate && (
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
                    ROI: {idea.roiEstimate}
                  </span>
                )}

                {idea.equityOffered && (
                  <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                    Equity: {idea.equityOffered}%
                  </span>
                )}
              </div>

              {/* Stats */}
              <p className="text-xs text-yellow-500 mt-3">
                NDA Requests: {idea.ndaCount || 0}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {idea.category} • {idea.fundingStatus}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {idea.locationCity}, {idea.locationState}
              </p>

            </div>
          </Link>
        ))}

        {ideas.length === 0 && (
          <p className="text-gray-400">You haven't uploaded any ideas yet.</p>
        )}
      </div>
    </div>
  );
}
