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

export default function InvestorProfile() {
  const user = auth.currentUser;

  const [signedNDAs, setSignedNDAs] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [stats, setStats] = useState({
    ndaSigned: 0,
    dealsInterestedIn: 0,
  });

  useEffect(() => {
    if (!user) return;

    // --------------------------------------------
    // LOAD ALL NDA REQUESTS WHERE VIEWER = INVESTOR
    // --------------------------------------------
    const q = query(
      collection(db, "nda"),
      where("viewerEmail", "==", user.email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const ndaData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSignedNDAs(ndaData);

      setStats({
        ndaSigned: ndaData.length,
        dealsInterestedIn: ndaData.filter(
          (n) => n.status === "approved"
        ).length,
      });
    });

    return () => unsub();
  }, [user]);

  // --------------------------------------------
  // LOAD RECOMMENDED IDEAS (by low risk & high ROI)
  // --------------------------------------------
  useEffect(() => {
    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      let allIdeas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort recommended
      let sorted = allIdeas
        .filter((idea) => idea.riskLevel === "low")
        .sort((a, b) => {
          if (!a.roiEstimate || !b.roiEstimate) return 0;
          return parseInt(b.roiEstimate) - parseInt(a.roiEstimate);
        })
        .slice(0, 6);

      setRecommended(sorted);
    });

    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-white">
        <p>Please log in to view your investor profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">
        Investor Profile
      </h1>
      <p className="text-gray-400 text-lg mb-10">
        View your signed NDAs, track investment opportunities, and manage deals.
      </p>

      {/* -------------------------------------------------- */}
      {/* INVESTOR INFO CARD */}
      {/* -------------------------------------------------- */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-10">
        <h2 className="text-2xl font-bold text-yellow-400 mb-3">{user.email}</h2>

        <p className="text-gray-400 text-sm mb-4">Investor since 2025</p>

        <div className="flex gap-4">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg font-semibold text-sm">
            NDAs Signed: {stats.ndaSigned}
          </div>
          <div className="bg-green-500 text-black px-3 py-1 rounded-lg font-semibold text-sm">
            Deals Interested In: {stats.dealsInterestedIn}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* DEALS VIEWED / NDAs SIGNED */}
      {/* -------------------------------------------------- */}
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">
        Deals You're Viewing
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {signedNDAs.length === 0 && (
          <p className="text-gray-400">No NDAs signed yet.</p>
        )}

        {signedNDAs.map((nda) => (
          <Link key={nda.id} href={`/ideas/${nda.ideaId}`}>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-yellow-500 cursor-pointer transition">
              <h3 className="text-xl font-bold text-yellow-400">
                {nda.ideaTitle}
              </h3>

              <p className="text-gray-400 mt-2">
                Status:{" "}
                <span
                  className={
                    nda.status === "approved"
                      ? "text-green-400"
                      : nda.status === "pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }
                >
                  {nda.status?.toUpperCase()}
                </span>
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Request Date: {nda.createdAt?.toDate().toLocaleDateString()}
              </p>

              <div className="mt-3">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold">
                  NDA VIEWED
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* -------------------------------------------------- */}
      {/* RECOMMENDED DEALS */}
      {/* -------------------------------------------------- */}
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">
        Recommended For You
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommended.map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-yellow-500 cursor-pointer transition">

              <h3 className="text-xl font-bold text-yellow-400">{idea.title}</h3>

              <p className="text-gray-400 mt-2 line-clamp-3">
                {idea.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {idea.roiEstimate && (
                  <span className="bg-green-500 text-black text-xs px-2 py-1 rounded-full">
                    ROI: {idea.roiEstimate}
                  </span>
                )}
                {idea.equityOffered && (
                  <span className="bg-blue-500 text-black text-xs px-2 py-1 rounded-full">
                    Equity: {idea.equityOffered}%
                  </span>
                )}
                {idea.riskLevel && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      idea.riskLevel === "low"
                        ? "bg-green-600"
                        : idea.riskLevel === "medium"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                  >
                    {idea.riskLevel.toUpperCase()} RISK
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {idea.locationCity}, {idea.locationState}
              </p>

              <div className="mt-3">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold">
                  NDA REQUIRED
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
