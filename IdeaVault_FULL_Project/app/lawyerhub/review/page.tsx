"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function NDAReviewPage() {
  const user = auth.currentUser;
  const [ndas, setNDAs] = useState([]);

  useEffect(() => {
    // LIVE LISTENER FOR ALL NDAs
    const unsub = onSnapshot(collection(db, "nda"), (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setNDAs(items);
    });

    return () => unsub();
  }, []);

  const handleDecision = async (ndaId: string, decision: "approved" | "rejected") => {
    if (!user) {
      alert("Login required.");
      return;
    }

    const notes = prompt("Add lawyer notes (optional):") || "";

    await updateDoc(doc(db, "nda", ndaId), {
      status: decision,
      reviewedByLawyerId: user.uid,
      lawyerNotes: notes,
    });

    alert(`NDA has been ${decision}.`);
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8">
        NDA Review Queue
      </h1>

      {ndas.length === 0 && (
        <p className="text-gray-500">No NDAs submitted yet.</p>
      )}

      <div className="space-y-4">
        {ndas.map((nda: any) => (
          <div
            key={nda.id}
            className="bg-zinc-900 p-5 rounded-xl border border-zinc-800"
          >
            {/* IDEA TITLE */}
            <p className="text-yellow-400 font-bold text-lg">
              NDA — {nda.ideaTitle}
            </p>

            {/* USER INFO */}
            <p className="text-gray-300 mt-2">
              <strong>Creator:</strong> {nda.creatorEmail}
            </p>

            <p className="text-gray-300">
              <strong>Viewer Name:</strong> {nda.viewerName}
            </p>

            {/* STATUS */}
            <p className="text-gray-400 mt-2">
              <strong>Status:</strong>{" "}
              <span className="text-yellow-500 font-bold">{nda.status}</span>
            </p>

            {/* LAWYER NOTES (IF EXISTS) */}
            {nda.lawyerNotes && nda.lawyerNotes.length > 0 && (
              <p className="text-gray-500 mt-2 text-sm">
                <strong>Notes:</strong> {nda.lawyerNotes}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDecision(nda.id, "approved")}
                className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold"
              >
                Approve
              </button>

              <button
                onClick={() => handleDecision(nda.id, "rejected")}
                className="bg-red-500 text-black px-4 py-2 rounded-lg font-bold"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
