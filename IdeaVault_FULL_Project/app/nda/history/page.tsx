"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function NDAHistory() {
  const user = auth.currentUser;

  const [createdNDAs, setCreatedNDAs] = useState([]);
  const [signedNDAs, setSignedNDAs] = useState([]);

  useEffect(() => {
    if (!user) return;

    // NDAs creator made
    const q1 = query(
      collection(db, "nda"),
      where("creatorId", "==", user.uid)
    );

    // NDAs viewer signed
    const q2 = query(
      collection(db, "nda"),
      where("viewerId", "==", user.uid)
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      setCreatedNDAs(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      setSignedNDAs(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  if (!user)
    return (
      <p className="p-6 text-white">Login required.</p>
    );

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold text-yellow-400 mb-8">
        NDA History
      </h1>

      {/* -------------------- CREATED NDAs -------------------- */}
      <h2 className="text-2xl font-bold text-yellow-400">
        NDAs You Created
      </h2>

      {createdNDAs.length === 0 && (
        <p className="text-gray-500 mt-2">
          You haven’t created any NDAs yet.
        </p>
      )}

      <div className="space-y-4 mt-4">
        {createdNDAs.map((nda: any) => (
          <div
            key={nda.id}
            className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl"
          >
            <p className="text-yellow-400 font-bold text-lg">
              {nda.ideaTitle}
            </p>

            <p className="text-gray-300 mt-1">
              Viewer: {nda.viewerName || "Not assigned"}
            </p>

            <p className="text-gray-400">
              Status:{" "}
              <span className="text-yellow-500 font-bold">
                {nda.status}
              </span>
            </p>

            {nda.lawyerNotes && nda.lawyerNotes.length > 0 && (
              <p className="text-gray-500 text-sm mt-2">
                Lawyer Notes: {nda.lawyerNotes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* -------------------- SIGNED NDAs -------------------- */}
      <h2 className="text-2xl font-bold text-yellow-400 mt-10">
        NDAs You Signed
      </h2>

      {signedNDAs.length === 0 && (
        <p className="text-gray-500 mt-2">
          You haven’t signed any NDAs yet.
        </p>
      )}

      <div className="space-y-4 mt-4 mb-10">
        {signedNDAs.map((nda: any) => (
          <div
            key={nda.id}
            className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl"
          >
            <p className="text-yellow-400 font-bold text-lg">
              {nda.ideaTitle}
            </p>

            <p className="text-gray-300 mt-1">
              Creator: {nda.creatorEmail}
            </p>

            <p className="text-gray-400">
              Status:{" "}
              <span className="text-yellow-500 font-bold">
                {nda.status}
              </span>
            </p>

            {nda.lawyerNotes && nda.lawyerNotes.length > 0 && (
              <p className="text-gray-500 text-sm mt-2">
                Lawyer Notes: {nda.lawyerNotes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
