"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { addTransaction } from "../../../../utils/wallet";

export default function ManageJob({ params }: any) {
  const { id } = params;

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [rating, setRating] = useState("");
  const [reviewText, setReviewText] = useState("");

  const user = auth.currentUser;

  //--------------------------------------------------------
  // LOAD JOB + APPLICANTS
  //--------------------------------------------------------
  useEffect(() => {
    const loadJob = async () => {
      const snap = await getDoc(doc(db, "jobs", id));
      if (snap.exists()) {
        setJob({ id: snap.id, ...snap.data() });
      }
    };
    loadJob();

    const unsub = onSnapshot(
      collection(db, "jobApplications", id, "applicants"),
      async (snap) => {
        const list: any[] = [];

        for (const docSnap of snap.docs) {
          const data = docSnap.data();

          const vendorProfileSnap = await getDoc(
            doc(db, "vendorServices", data.vendorId)
          );

          list.push({
            id: docSnap.id,
            ...data,
            vendorProfile: vendorProfileSnap.exists()
              ? vendorProfileSnap.data()
              : null,
          });
        }

        setApplicants(list);
      }
    );

    return () => unsub();
  }, []);

  //--------------------------------------------------------
  // ASSIGN VENDOR
  //--------------------------------------------------------
  const assignVendor = async (vendorId: string) => {
    if (!job) return;

    await updateDoc(doc(db, "jobs", id), {
      assignedVendorId: vendorId,
      status: "assigned",
    });

    // CREATE CHAT
    await addDoc(collection(db, "chats"), {
      members: [job.creatorId, vendorId],
      jobId: id,
      jobTitle: job.title,
      createdAt: serverTimestamp(),
    });

    alert("Vendor assigned!");
  };

  //--------------------------------------------------------
  // APPROVE + RELEASE PAYMENT + REVIEW
  //--------------------------------------------------------
  const approveAndReview = async () => {
    if (!rating) return alert("Enter a rating (1–5).");
    if (!reviewText) return alert("Write a review.");

    // PAY VENDOR
    await addTransaction(
      job.assignedVendorId,
      Number(job.budget),
      "earn",
      `Payment for completing job: ${job.title}`,
      job.creatorId,
      job.assignedVendorId,
      job.id
    );

    // CREATOR WALLET GOES NEGATIVE
    await addTransaction(
      job.creatorId,
      -Number(job.budget),
      "payment",
      `Paid vendor for: ${job.title}`,
      job.creatorId,
      job.assignedVendorId,
      job.id
    );

    // STORE REVIEW
    await addDoc(collection(db, "reviews", job.assignedVendorId, "list"), {
      rating: Number(rating),
      reviewText,
      jobId: job.id,
      creatorId: job.creatorId,
      creatorEmail: job.creatorEmail,
      createdAt: serverTimestamp(),
    });

    // UPDATE JOB STATUS
    await updateDoc(doc(db, "jobs", id), {
      creatorApproved: true,
      status: "completed",
    });

    alert("Payment released & review submitted!");
    setRating("");
    setReviewText("");
  };

  //--------------------------------------------------------
  // RENDERING
  //--------------------------------------------------------
  if (!user) return <p className="p-6 text-white">Login required.</p>;
  if (!job) return <p className="p-6 text-white">Loading job...</p>;

  if (job.creatorId !== user.uid) {
    return (
      <p className="p-6 text-yellow-400 font-bold">
        You cannot manage this job.
      </p>
    );
  }

  const creatorCanApprove =
    job.status === "assigned" && job.vendorCompleted === true;

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold text-yellow-400">
        Manage Job: {job.title}
      </h1>

      <p className="mt-2 text-gray-400">Status: {job.status}</p>

      <p className="mt-4 text-gray-300">{job.description}</p>
      <p className="text-gray-500 mt-2">Budget: ${job.budget}</p>

      <hr className="my-6 border-zinc-700" />

      {/* APPLICANTS */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">
        Applicants
      </h2>

      {applicants.length === 0 && (
        <p className="text-gray-500">No applicants yet.</p>
      )}

      <div className="space-y-4">
        {applicants.map((app: any) => (
          <div
            key={app.id}
            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
          >
            <h3 className="text-lg font-bold text-yellow-400">
              {app.vendorEmail}
            </h3>

            <p className="mt-2 text-gray-300">
              <strong>Application Message:</strong> {app.message}
            </p>

            {app.vendorProfile && (
              <div className="mt-2 text-gray-400">
                <p><strong>Skills:</strong> {app.vendorProfile.skills}</p>
                <p><strong>Services:</strong> {app.vendorProfile.services}</p>
                <p><strong>Rate:</strong> ${app.vendorProfile.rate}</p>
              </div>
            )}

            <button
              onClick={() => assignVendor(app.vendorId)}
              className="mt-3 py-2 px-4 bg-yellow-500 text-black font-bold rounded-lg"
            >
              Assign Vendor
            </button>
          </div>
        ))}
      </div>

      {/* APPROVE + REVIEW */}
      {creatorCanApprove && (
        <div className="mt-10 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            Approve Job & Leave Review
          </h2>

          <label className="text-gray-300">Rating (1–5):</label>
          <input
            type="number"
            min="1"
            max="5"
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mt-2"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />

          <textarea
            className="w-full mt-3 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            placeholder="Write a detailed review..."
            value={reviewText}
            rows={4}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <button
            onClick={approveAndReview}
            className="mt-4 w-full py-3 bg-green-500 text-black font-bold rounded-lg"
          >
            Approve & Release Payment + Submit Review
          </button>
        </div>
      )}
    </div>
  );
}
