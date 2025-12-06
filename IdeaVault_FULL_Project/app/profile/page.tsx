"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "../../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // LOAD USER PROFILE
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const refUser = doc(db, "users", user.uid);
      const snap = await getDoc(refUser);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setRole(data.role || "");
        setProfilePicUrl(data.profilePicUrl || "");
      }
    };

    loadProfile();
  }, [user]);

  // SAVE USER PROFILE
  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);

    let uploadedUrl = profilePicUrl;

    // Upload picture if chosen
    if (profilePic) {
      const storageRef = ref(storage, `user_uploads/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, profilePic);
      uploadedUrl = await getDownloadURL(storageRef);
    }

    // Save profile to database
    await setDoc(
      doc(db, "users", user.uid),
      {
        name,
        bio,
        role,
        profilePicUrl: uploadedUrl,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setLoading(false);
    alert("Profile updated!");
  };

  if (!user)
    return <div className="text-white p-6">You must be logged in.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Profile</h1>

      {/* PROFILE CARD */}
      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-8 max-w-xl">

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              className="w-32 h-32 rounded-full border-4 border-gold object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gold" />
          )}

          <input
            type="file"
            className="mt-3"
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
        </div>

        {/* Name */}
        <label className="text-gray-300 text-sm">Display Name</label>
        <input
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        {/* Bio */}
        <label className="text-gray-300 text-sm">Bio</label>
        <textarea
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded h-24"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
        />

        {/* Role */}
        <label className="text-gray-300 text-sm">Role</label>
        <select
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select your role</option>
          <option value="Creator">Creator</option>
          <option value="Vendor">Vendor</option>
          <option value="Investor">Investor</option>
          <option value="Lawyer">Lawyer</option>
        </select>

        {/* Email */}
        <p className="text-gray-400 text-sm mb-4">
          Email: <span className="text-white">{user.email}</span>
        </p>

        {/* Save Button */}
        <button
          onClick={saveProfile}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
