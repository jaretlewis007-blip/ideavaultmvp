"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function JobDetails({ params }: any) {
  const { id } = params;
  const [job, setJob] = useState<any>(null);
  const [message, setMessage] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "jobs", id));
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() });
    };
    load();
  }, []);

  const applyForJob = async () => {
    if (!user) return alert("You must be logged in.");
    if (user.uid === job.creatorId)
      return alert("You cannot apply to your own job.");

    await addDoc(collection(db, "jobApplications", id, "applicants"), {
      vendorId: user.uid,
      vendorEmail: user.email,
      message,
      createdAt: serverTimestamp(),
    });

    alert("Application submitted!");
    setMessage("");
  };

  const markComplete = async () => {
    if (!user) return alert("Login required.");

    await updateDoc(doc(db, "jobs", id), {
      vendorCompleted: true,
    });

    alert("You marked the job complete. Waiting for creator approval.");
  };

  if (!job) return <p className="p-6 text-white">Loading...</p>;

  const isCreator = user && user.uid === job.creatorId;
  const isAssignedVendor =
    user &&
    job.assignedVendorId === user.uid &&
    job.status === "assigned";

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400">{job.title}</h1>

      <p className="mt-3 text-gray-300">{job.description}</p>

      <div className="mt-4 text-gray-400">
        <p>Budget: ${job.budget}</p>
        <p>Category: {job.category || "None"}</p>
        <p>Posted By: {job.creatorEmail}</p>
        <p>Status: {job.status}</p>
      </div>

      {/* APPLY SECTION (Vendors Only) */}
      {!isCreator && job.status === "open" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-yellow-400">Apply for Job</h2>

          <textarea
            className="w-full mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
            placeholder="Explain why you're the best fit..."
            value={message}
            rows={4}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={applyForJob}
            className="w-full mt-3 py-3 bg-yellow-500 text-black font-bold rounded-lg"
          >
            Submit Application
          </button>
        </div>
      )}

      {/* MARK COMPLETE (Assigned Vendor Only) */}
      {isAssignedVendor && (
        <button
          onClick={markComplete}
          className="mt-10 w-full py-3 bg-green-500 text-black font-bold rounded-lg"
        >
          Mark Job Completed
        </button>
      )}

      {/* CREATOR NOTICE */}
      {isCreator && (
        <p className="mt-10 text-yellow-400 font-bold">
          You posted this job. Manage applicants in your Job Manager.
        </p>
      )}
    </div>
  );
}
