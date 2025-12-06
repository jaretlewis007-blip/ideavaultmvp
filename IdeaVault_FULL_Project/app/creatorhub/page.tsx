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
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreatorHub() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedIdea, setSelectedIdea] = useState(null);

  const user = auth.currentUser;

  // Load ideas
  useEffect(() => {
    const loadIdeas = async () => {
      const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const list = snapshot.docs
        .filter((d) => d.data().userId === user?.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setIdeas(list);
    };

    loadIdeas();
  }, [user]);

  // Upload Idea
  const uploadIdea = async () => {
    if (!title || !description || !category) {
      alert("Fill all fields.");
      return;
    }

    setLoading(true);

    let imageUrl = null;

    if (image) {
      const imagePath = `user_uploads/${user.uid}/ideas/${Date.now()}_${image.name}`;
      const storageRef = ref(storage, imagePath);
      await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "ideas"), {
      title,
      description,
      category,
      imageUrl,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    setCategory("");
    setImage(null);
    setLoading(false);
    alert("Idea uploaded!");
    window.location.reload();
  };

  // Delete idea
  const deleteIdea = async (id) => {
    await deleteDoc(doc(db, "ideas", id));
    alert("Idea deleted!");
    window.location.reload();
  };

  return (
    <div className="min-h-screen text-white bg-black p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Creator Hub</h1>

      {/* Upload Form */}
      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gold mb-4">Upload Idea</h2>

        <input
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          placeholder="Idea Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded h-32"
          placeholder="Describe your idea..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Category Dropdown */}
        <select
          className="w-full p-3 mb-3 bg-black/30 border border-gold/30 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Business">Business</option>
          <option value="Technology">Technology</option>
          <option value="Clothing">Clothing</option>
          <option value="App">App</option>
          <option value="Product">Product</option>
          <option value="Service">Service</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="file"
          className="block mb-3"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          onClick={uploadIdea}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          {loading ? "Uploading..." : "Upload Idea"}
        </button>
      </div>

      {/* Idea List */}
      <h2 className="text-2xl font-bold text-gold mb-4">My Ideas</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white/10 border border-gold/30 rounded-xl p-4 cursor-pointer"
          >
            {idea.imageUrl && (
              <img
                src={idea.imageUrl}
                className="rounded-xl mb-3 border border-gold/20"
              />
            )}

            <h3 className="text-xl font-bold text-gold">{idea.title}</h3>
            <p className="text-gray-400 text-sm">{idea.category}</p>

            <button
              className="mt-3 bg-blue-600 hover:bg-blue-700 p-2 rounded w-full"
              onClick={() => setSelectedIdea(idea)}
            >
              View
            </button>

            <button
              className="mt-2 bg-red-600 hover:bg-red-700 p-2 rounded w-full"
              onClick={() => deleteIdea(idea.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedIdea && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center p-4"
          onClick={() => setSelectedIdea(null)}
        >
          <div
            className="bg-white/10 border border-gold/30 rounded-xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gold">{selectedIdea.title}</h2>
            <p className="text-gray-300 mt-2">{selectedIdea.description}</p>

            {selectedIdea.imageUrl && (
              <img
                src={selectedIdea.imageUrl}
                className="rounded-xl mt-4 border border-gold/20"
              />
            )}

            <p className="mt-4 text-gray-400">
              Category: {selectedIdea.category}
            </p>

            <button
              className="mt-4 bg-green-600 hover:bg-green-700 p-3 rounded-lg w-full font-bold"
              onClick={() =>
                (window.location.href = "/nda")
              }
            >
              Generate NDA
            </button>

            <button
              className="mt-2 bg-gray-600 hover:bg-gray-700 p-3 rounded-lg w-full font-bold"
              onClick={() => setSelectedIdea(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
