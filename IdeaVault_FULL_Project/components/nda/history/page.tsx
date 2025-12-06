"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

export default function NDAHistoryPage() {
  const [ndas, setNDAs] = useState([]);

  const fetchNDAs = async () => {
    const q = query(collection(db, "ndaDocuments"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setNDAs(results);
  };

  useEffect(() => {
    fetchNDAs();
  }, []);

  const deleteNDA = async (id: string) => {
    await deleteDoc(doc(db, "ndaDocuments", id));
    fetchNDAs();
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-2">
        NDA History
      </h1>
      <p className="text-gray-400 mb-8">
        View all NDAs you've generated and saved inside IdeaVault.
      </p>

      <div className="space-y-4 max-w-3xl">
        {ndas.length === 0 && (
          <p className="text-gray-500 text-lg">No NDAs found yet.</p>
        )}

        {ndas.map((nda: any) => (
          <div
            key={nda.id}
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg"
          >
            <h2 className="text-xl font-semibold text-yellow-300">
              {nda.ideaName}
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Owner: {nda.ownerName}
            </p>
            <p className="text-gray-400 text-sm">
              Recipient: {nda.recipientName}
            </p>

            <p className="text-gray-500 text-xs mt-2">
              Created:{" "}
              {nda.createdAt?.toDate
                ? nda.createdAt.toDate().toLocaleString()
                : "Unknown"}
            </p>

            <div className="flex gap-3 mt-4">
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                  nda.ndaText
                )}`}
                download={`NDA-${nda.ideaName}.txt`}
                className="px-3 py-1 bg-yellow-500 text-black rounded text-sm"
              >
                Download
              </a>

              <button
                onClick={() => deleteNDA(nda.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
