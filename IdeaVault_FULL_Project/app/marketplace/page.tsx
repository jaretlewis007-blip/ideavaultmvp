"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where
} from "firebase/firestore";

export default function Marketplace() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Load ALL marketplace services
  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "marketplace"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setServices(list);
    };

    load();
  }, []);

  const filtered = services.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || item.category === category)
    );
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Marketplace</h1>

      {/* Search + Filters */}
      <div className="bg-white/10 border border-gold/20 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <input
          className="flex-1 p-3 bg-black/40 border border-gold/30 rounded"
          placeholder="Search services or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-3 bg-black/40 border border-gold/30 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Design">Design</option>
          <option value="Development">Development</option>
          <option value="Legal">Legal</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Marketing">Marketing</option>
          <option value="Branding">Branding</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filtered.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center">
            No marketplace items found.
          </p>
        )}

        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 border border-gold/30 rounded-xl p-4"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                className="rounded-xl w-full h-40 object-cover mb-4 border border-gold/20"
              />
            )}

            <h2 className="text-xl font-bold text-gold">{item.title}</h2>

            <p className="text-gray-300 mt-2 line-clamp-3">
              {item.description}
            </p>

            <p className="mt-3 text-gray-400 text-sm">
              Category: {item.category}
            </p>

            <p className="mt-1 text-xl font-bold text-green-400">
              ${item.price}
            </p>

            <button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
              onClick={() =>
                alert("Messaging system coming next!")
              }
            >
              Contact Vendor
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
