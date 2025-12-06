"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function InvestorHub() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [sending, setSending] = useState(false);

  const user = auth.currentUser;

  // Load all ideas
  useEffect(() => {
    const loadIdeas = async () => {
      const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIdeas(list);
    };

    loadIdeas();
  }, []);

  // FULL REBUILT OFFER + PROJECT CREATION LOGIC
  const sendOffer = async () => {
    if (!offerAmount) {
      alert("Enter an amount.");
      return;
    }

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setSending(true);

    // 1. Create Offer
    const offerRef = await addDoc(collection(db, "offers"), {
      ideaId: selectedIdea.id,
      creatorId: selectedIdea.userId,
      investorId: user.uid,
      amount: offerAmount,
      message: offerMessage,
      createdAt: serverTimestamp(),
    });

    // 2. Auto-create Project
    const projectRef = await addDoc(collection(db, "projects"), {
      ideaId: selectedIdea.id,
      ideaTitle: selectedIdea.title,
      creatorId: selectedIdea.userId,
      investorId: user.uid,
      offerAmount,
      offerMessage,
      offerId: offerRef.id,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // 3. Optional notification (safe)
    try {
      await addDoc(collection(db, "notifications"), {
        toUser: selectedIdea.userId,
        fromUser: user.uid,
        type: "offer",
        message: `You received an investor offer on "${selectedIdea.title}".`,
        projectId: projectRef.id,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (err) {
      console.log("Notification error:", err);
    }

    setSending(false);
    setOfferAmount("");
    setOfferMessage("");
    setSelectedIdea(null);

    // 4. AUTO REDIRECT TO PROJECT ROOM
    window.location.href = `/project/${projectRef.id}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Investor Hub</h1>

      <p className="text-gray-400 mb-6">
        Browse ideas uploaded by creators and make investment offers.
      </p>

      {/* Ideas Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white/10 border border-gold/30 rounded-xl p-4"
          >
            {idea.imageUrl && (
              <img
                src={idea.imageUrl}
                className="rounded-xl w-full h-40 object-cover mb-4 border border-gold/20"
              />
            )}

            <h2 className="text-xl font-bold text-gold">{idea.title}</h2>

            <p className="text-gray-300 mt-2 line-clamp-3">
              {idea.description}
            </p>

            <p className="text-gray-400 mt-2 text-sm">
              Category: {idea.category}
            </p>

            <button
              className="mt-4 bg-green-600 hover:bg-green-700 p-3 rounded-lg w-full font-bold"
              onClick={() => setSelectedIdea(idea)}
            >
              Make Offer
            </button>
          </div>
        ))}
      </div>

      {/* OFFER MODAL */}
      {selectedIdea && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center p-4"
          onClick={() => setSelectedIdea(null)}
        >
          <div
            className="bg-white/10 border border-gold/30 rounded-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gold">
              Offer for: {selectedIdea.title}
            </h2>

            <input
              className="w-full p-3 bg-black/30 border border-gold/30 rounded mt-4"
              placeholder="Offer Amount ($)"
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
            />

            <textarea
              className="w-full p-3 bg-black/30 border border-gold/30 rounded mt-3 h-28"
              placeholder="Message to Creator (optional)"
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
            />

            <button
              className="w-full mt-4 bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
              onClick={sendOffer}
            >
              {sending ? "Sending..." : "Send Offer"}
            </button>

            <button
              className="w-full mt-2 bg-gray-600 hover:bg-gray-700 p-3 rounded-lg font-bold"
              onClick={() => setSelectedIdea(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
