"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "../../firebase/config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function LawyerHub() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [legalServices, setLegalServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  // Load legal services
  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "legal_services"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setLegalServices(list);
    };
    load();
  }, []);

  const uploadService = async () => {
    if (!title || !desc || !price) {
      alert("Fill all fields.");
      return;
    }

    setLoading(true);

    let imageUrl = null;

    if (image) {
      const filePath = `user_uploads/${user.uid}/lawyerhub/${Date.now()}_${image.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "legal_services"), {
      userId: user.uid,
      title,
      description: desc,
      price,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDesc("");
    setPrice("");
    setImage(null);
    setLoading(false);

    alert("Legal service posted!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Lawyer Hub</h1>

      {/* Tools Section */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button
          className="bg-white/10 border border-gold/30 p-4 rounded-xl text-left hover:bg-white/20"
          onClick={() => (window.location.href = "/nda")}
        >
          <h3 className="text-xl font-bold text-gold">Generate NDA</h3>
          <p className="text-gray-300 text-sm mt-2">
            Quickly create a Non-Disclosure Agreement.
          </p>
        </button>

        <button className="bg-white/10 border border-gold/30 p-4 rounded-xl text-left hover:bg-white/20">
          <h3 className="text-xl font-bold text-gold">Contract Template</h3>
          <p className="text-gray-300 text-sm mt-2">
            A simple starter contract for small business deals.
          </p>
        </button>

        <button className="bg-white/10 border border-gold/30 p-4 rounded-xl text-left hover:bg-white/20">
          <h3 className="text-xl font-bold text-gold">Partnership Agreement</h3>
          <p className="text-gray-300 text-sm mt-2">
            Basic partnership terms made easy.
          </p>
        </button>
      </div>

      {/* Lawyer Upload Section */}
      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold text-gold mb-4">
          Offer a Legal Service
        </h2>

        <input
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          placeholder="Service Title (ex: Contract Review)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded h-32"
          placeholder="Service Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          placeholder="Price ($)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="file"
          className="block mb-3"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          onClick={uploadService}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          {loading ? "Uploading..." : "Upload Legal Service"}
        </button>
      </div>

      {/* Legal Services Display */}
      <h2 className="text-2xl font-bold text-gold mb-4">Available Legal Services</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {legalServices.map((service) => (
          <div
            key={service.id}
            className="bg-white/10 border border-gold/30 rounded-xl p-4"
          >
            {service.imageUrl && (
              <img
                src={service.imageUrl}
                className="rounded-xl w-full h-40 object-cover mb-4 border border-gold/20"
              />
            )}

            <h3 className="text-xl font-bold text-gold">{service.title}</h3>
            <p className="text-gray-300 mt-2">{service.description}</p>

            <p className="mt-3 text-xl font-bold text-green-400">
              ${service.price}
            </p>

            <button
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
              onClick={() => alert("Messaging system coming soon!")}
            >
              Contact Lawyer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
