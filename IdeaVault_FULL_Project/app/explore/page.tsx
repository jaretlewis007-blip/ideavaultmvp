"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function ExploreIdeas() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");

  const [locationFilter, setLocationFilter] = useState("all");

  // User location for “near me”
  const [userCity, setUserCity] = useState("");
  const [userState, setUserState] = useState("");

  // ----------------------------------------
  // LOAD IDEAS + SORT TRENDING
  // ----------------------------------------
  useEffect(() => {
    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIdeas(data);

      const trendingSorted = [...data]
        .sort((a, b) => (b.ndaCount || 0) - (a.ndaCount || 0))
        .slice(0, 10);

      setTrending(trendingSorted);
    });

    return () => unsub();
  }, []);

  // Optional: ask browser for user's city/state (manual fallback)
  const setUserLocation = () => {
    const city = prompt("Enter your city:");
    const state = prompt("Enter your state:");
    if (city) setUserCity(city.trim());
    if (state) setUserState(state.trim());
  };

  // ----------------------------------------
  // FILTER LOGIC
  // ----------------------------------------
  const filtered = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ? true : idea.category === categoryFilter;

    const matchesFunding =
      fundingFilter === "all"
        ? true
        : idea.fundingStatus === fundingFilter;

    // LOCATION FILTER LOGIC
    let matchesLocation = true;

    if (locationFilter === "near-me") {
      if (!userCity || !userState) return false;
      matchesLocation =
        idea.locationCity?.toLowerCase() === userCity.toLowerCase() &&
        idea.locationState?.toLowerCase() === userState.toLowerCase();
    } else if (locationFilter !== "all") {
      matchesLocation =
        idea.locationState?.toLowerCase() === locationFilter.toLowerCase();
    }

    return matchesSearch && matchesCategory && matchesFunding && matchesLocation;
  });

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">

      {/* ----------------------------------------------------- */}
      {/* HEADER */}
      {/* ----------------------------------------------------- */}
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">
        Explore Ideas
      </h1>

      {/* ----------------------------------------------------- */}
      {/* TRENDING SLIDER */}
      {/* ----------------------------------------------------- */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-3">🔥 Trending Ideas</h2>

      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {trending.map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`}>
            <div className="min-w-[260px] bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-yellow-500 transition cursor-pointer">
              <h3 className="text-lg font-semibold text-yellow-400">{idea.title}</h3>

              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {idea.description}
              </p>

              <p className="text-xs text-yellow-500 mt-2">
                NDA Requests: {idea.ndaCount || 0}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <hr className="border-zinc-800 my-8" />

      {/* ----------------------------------------------------- */}
      {/* SEARCH BAR */}
      {/* ----------------------------------------------------- */}
      <input
        type="text"
        placeholder="Search ideas…"
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ----------------------------------------------------- */}
      {/* CATEGORY FILTER */}
      {/* ----------------------------------------------------- */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {["all", "tech", "product", "service", "app", "local"].map((f) => (
          <button
            key={f}
            onClick={() => setCategoryFilter(f)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              categoryFilter === f
                ? "bg-yellow-500 text-black border-yellow-400"
                : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* FUNDING FILTER */}
      {/* ----------------------------------------------------- */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          "all",
          "needs-funding",
          "prototype-ready",
          "fully-developed",
          "seeking-investors",
          "open-partnerships",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFundingFilter(f)}
            className={`px-4 py-2 rounded-lg border text-sm ${
              fundingFilter === f
                ? "bg-yellow-500 text-black border-yellow-400"
                : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
            }`}
          >
            {f.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* LOCATION FILTER */}
      {/* ----------------------------------------------------- */}
      <h2 className="text-yellow-400 font-bold text-lg mb-2">Location</h2>

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setLocationFilter("all")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            locationFilter === "all"
              ? "bg-yellow-500 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
          }`}
        >
          ALL
        </button>

        <button
          onClick={() => {
            if (!userCity || !userState) setUserLocation();
            setLocationFilter("near-me");
          }}
          className={`px-4 py-2 rounded-lg border text-sm ${
            locationFilter === "near-me"
              ? "bg-yellow-500 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
          }`}
        >
          NEAR ME
        </button>

        <button
          onClick={() => setLocationFilter("alabama")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            locationFilter === "alabama"
              ? "bg-yellow-500 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
          }`}
        >
          ALABAMA
        </button>

        <button
          onClick={() => setLocationFilter("georgia")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            locationFilter === "georgia"
              ? "bg-yellow-500 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
          }`}
        >
          GEORGIA
        </button>

        <button
          onClick={() => setLocationFilter("florida")}
          className={`px-4 py-2 rounded-lg border text-sm ${
            locationFilter === "florida"
              ? "bg-yellow-500 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800"
          }`}
        >
          FLORIDA
        </button>
      </div>

      {/* ----------------------------------------------------- */}
      {/* IDEA GRID */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {filtered.map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-yellow-500 transition cursor-pointer">

              <h2 className="text-xl font-bold text-yellow-400">
                {idea.title}
              </h2>

              <p className="text-gray-400 mt-2 line-clamp-3">
                {idea.description}
              </p>

              {/* INVESTOR BADGES */}
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
                {idea.riskLevel && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      idea.riskLevel === "low"
                        ? "bg-green-500"
                        : idea.riskLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {idea.riskLevel.toUpperCase()} RISK
                  </span>
                )}
              </div>

              {/* CATEGORY + FUNDING */}
              <p className="text-xs text-yellow-500 mt-3">
                {idea.category} • {idea.fundingStatus}
              </p>

              {/* LOCATION BADGE */}
              <p className="text-xs text-gray-400 mt-1">
                {idea.locationCity}, {idea.locationState}
              </p>

              {/* NDA BADGE */}
              <div className="mt-4">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold">
                  NDA Required
                </span>
              </div>

            </div>
          </Link>
        ))}

      </div>
    </div>
  );
}
