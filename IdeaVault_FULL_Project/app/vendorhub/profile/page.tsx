"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc, onSnapshot, collection } from "firebase/firestore";

export default function VendorProfile() {
  const user = auth.currentUser;

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    // Load vendor profile
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "vendorServices", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    loadProfile();

    // Load vendor reviews live
    const unsub = onSnapshot(
      collection(db, "reviews", user.uid, "list"),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews(list);

        if (list.length > 0) {
          const avg =
            list.reduce((a, b) => a + b.rating, 0) / list.length;
          setAverageRating(Number(avg.toFixed(1)));
        } else {
          setAverageRating(null);
        }
      }
    );

    return () => unsub();
  }, []);

  if (!user) return <p className="p-6 text-white">Login required.</p>;
  if (!profile)
    return <p className="p-6 text-white">Loading profile...</p>;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400">Your Vendor Profile</h1>

      {/* Rating Section */}
      <div className="mt-5">
        <h2 className="text-xl font-bold text-yellow-400">Rating</h2>

        {averageRating ? (
          <p className="mt-1 text-yellow-400 font-bold text-lg">
            ⭐ {averageRating} / 5 ({reviews.length} reviews)
          </p>
        ) : (
          <p className="text-gray-500 mt-1">No ratings yet.</p>
        )}
      </div>

      {/* Skills Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-yellow-400">Skills</h2>
        <p className="text-gray-300 mt-2">{profile.skills}</p>
      </div>

      {/* Services Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-yellow-400">Services</h2>
        <p className="text-gray-300 mt-2">{profile.services}</p>
      </div>

      {/* Rate Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-yellow-400">Hourly Rate</h2>
        <p className="text-gray-300 mt-2">${profile.rate} / hour</p>
      </div>

      {/* Review List */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-yellow-400">Reviews</h2>

        {reviews.length === 0 && (
          <p className="text-gray-500 mt-2">No reviews yet.</p>
        )}

        <div className="space-y-4 mt-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl"
            >
              <p className="text-yellow-400 font-bold">
                ⭐ {rev.rating} / 5
              </p>
              <p className="mt-2 text-gray-300">{rev.reviewText}</p>
              <p className="mt-2 text-gray-500 text-sm">
                From: {rev.creatorEmail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
