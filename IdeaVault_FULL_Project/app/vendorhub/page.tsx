"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "../../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function VendorHub() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const uploadService = async () => {
    if (!title || !description || !price || !category) {
      alert("Fill all fields.");
      return;
    }

    setLoading(true);

    let imageUrl = null;

    if (image) {
      const filePath = `user_uploads/${user.uid}/marketplace/${Date.now()}_${image.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "marketplace"), {
      userId: user.uid,
      title,
      description,
      price,
      category,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImage(null);
    setLoading(false);

    alert("Service uploaded!");
  };

  return (
    <div className="min-h-screen text-white bg-black p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Vendor Hub</h1>

      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gold mb-4">Upload Your Service</h2>

        <input
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          placeholder="Service Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded h-32"
          placeholder="Describe your service..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          placeholder="Price ($)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Design">Design</option>
          <option value="Development">Development</option>
          <option value="Legal">Legal</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Marketing">Marketing</option>
          <option value="Branding">Branding</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="file"
          className="block mb-3"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          onClick={uploadService}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          {loading ? "Uploading..." : "Upload Service"}
        </button>
      </div>
    </div>
  );
}
