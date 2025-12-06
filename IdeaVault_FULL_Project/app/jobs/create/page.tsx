"use client";

import { useState } from "react";
import { auth, db } from "../../../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CreateJobPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");

  const createJob = async () => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");

    if (!title || !description || !budget) {
      return alert("Fill out all required fields.");
    }

    await addDoc(collection(db, "jobs"), {
      creatorId: user.uid,
      creatorEmail: user.email,
      title,
      description,
      budget: Number(budget),
      category,
      status: "open",
      assignedVendorId: null,
      createdAt: serverTimestamp(),
    });

    alert("Job created successfully!");
    setTitle("");
    setDescription("");
    setBudget("");
    setCategory("");
  };

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Create New Job
      </h1>

      <input
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
        placeholder="Job Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg mt-4"
        placeholder="Job Description *"
        rows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg mt-4"
        placeholder="Budget *"
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />

      <input
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg mt-4"
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button
        className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg mt-6"
        onClick={createJob}
      >
        Post Job
      </button>
    </div>
  );
}
