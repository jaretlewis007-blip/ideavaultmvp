"use client";

import { useState } from "react";
import { auth, db } from "../../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadIdea() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tech");
  const [fundingStatus, setFundingStatus] = useState("needs-funding");
  const [fullPlan, setFullPlan] = useState("");

  // Investor Fields
  const [fundingGoal, setFundingGoal] = useState("");
  const [equityOffered, setEquityOffered] = useState("");
  const [roiEstimate, setRoiEstimate] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [marketSize, setMarketSize] = useState("");

  // Location Fields
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCountry, setLocationCountry] = useState("USA");

  const user = auth.currentUser;

  const uploadIdea = async () => {
    if (!title || !description) {
      alert("Fill required fields.");
      return;
    }

    if (!user) {
      alert("Login required.");
      return;
    }

    await addDoc(collection(db, "ideas"), {
      creatorId: user.uid,
      creatorEmail: user.email,

      title,
      description,
      fullPlan,
      category,
      fundingStatus,

      // Investor Data
      fundingGoal,
      equityOffered,
      roiEstimate,
      riskLevel,
      marketSize,

      // Location Data
      locationCity,
      locationState,
      locationCountry,

      ndaCount: 0,
      createdAt: serverTimestamp(),
    });

    alert("Idea Uploaded!");
    setTitle("");
    setDescription("");
    setFullPlan("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Upload Your Idea
      </h1>

      {/* TITLE */}
      <input
        type="text"
        placeholder="Idea Title"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Short Teaser Description"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      {/* FULL PLAN */}
      <textarea
        placeholder="Full Business Plan (Locked Behind NDA)"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={fullPlan}
        onChange={(e) => setFullPlan(e.target.value)}
        rows={6}
      />

      {/* CATEGORY */}
      <label>Category</label>
      <select
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="tech">Tech</option>
        <option value="product">Product</option>
        <option value="service">Service</option>
        <option value="app">App</option>
        <option value="local">Local</option>
      </select>

      {/* FUNDING STATUS */}
      <label>Funding Stage</label>
      <select
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={fundingStatus}
        onChange={(e) => setFundingStatus(e.target.value)}
      >
        <option value="needs-funding">Needs Funding</option>
        <option value="prototype-ready">Prototype Ready</option>
        <option value="fully-developed">Fully Developed</option>
        <option value="seeking-investors">Seeking Investors</option>
        <option value="open-partnerships">Open to Partnerships</option>
      </select>

      {/* ---------------- LOCATION SECTION ---------------- */}
      <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-3">
        Location (for Local Startup Discovery)
      </h2>

      <input
        type="text"
        placeholder="City"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={locationCity}
        onChange={(e) => setLocationCity(e.target.value)}
      />

      <input
        type="text"
        placeholder="State"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={locationState}
        onChange={(e) => setLocationState(e.target.value)}
      />

      <input
        type="text"
        placeholder="Country"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={locationCountry}
        onChange={(e) => setLocationCountry(e.target.value)}
      />

      {/* ---------------- INVESTOR SECTION ---------------- */}
      <h2 className="text-xl font-bold text-yellow-400 mt-6 mb-3">
        Investor Information
      </h2>

      <input
        type="text"
        placeholder="Funding Goal ($)"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={fundingGoal}
        onChange={(e) => setFundingGoal(e.target.value)}
      />

      <input
        type="text"
        placeholder="Equity Offered (%)"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={equityOffered}
        onChange={(e) => setEquityOffered(e.target.value)}
      />

      <input
        type="text"
        placeholder="ROI Estimate (e.g., 3x, 40%)"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={roiEstimate}
        onChange={(e) => setRoiEstimate(e.target.value)}
      />

      <label>Risk Level</label>
      <select
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={riskLevel}
        onChange={(e) => setRiskLevel(e.target.value)}
      >
        <option value="low">Low Risk</option>
        <option value="medium">Medium Risk</option>
        <option value="high">High Risk</option>
      </select>

      <input
        type="text"
        placeholder="Market Size (Small / Medium / Large)"
        className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        value={marketSize}
        onChange={(e) => setMarketSize(e.target.value)}
      />

      <button
        onClick={uploadIdea}
        className="w-full p-3 bg-yellow-500 text-black font-bold rounded-xl mt-4"
      >
        Upload Idea
      </button>
    </div>
  );
}
