"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function CreatorJobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "jobs"),
      where("creatorId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Your Jobs
      </h1>

      {jobs.length === 0 && (
        <p className="text-gray-500">You haven’t posted any jobs yet.</p>
      )}

      <div className="space-y-4">
        {jobs.map((job: any) => (
          <div
            key={job.id}
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl"
          >
            <h2 className="text-xl font-bold text-yellow-400">{job.title}</h2>
            <p className="text-gray-300 mt-2">{job.description}</p>

            <p className="text-gray-500 text-sm mt-2">
              Budget: ${job.budget} • Status: {job.status}
            </p>

            <Link
              href={`/jobs/manage/${job.id}`}
              className="inline-block mt-4 py-2 px-4 bg-yellow-500 text-black rounded-lg font-bold"
            >
              Manage Job
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
