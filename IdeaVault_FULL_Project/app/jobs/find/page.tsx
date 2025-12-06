"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { auth, db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NDAGenerator() {
  const [recipientName, setRecipientName] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");

  const user = auth.currentUser;

  const generateNDA = async () => {
    if (!recipientName || !ideaTitle) {
      alert("Fill everything out.");
      return;
    }

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const text = `
NON-DISCLOSURE AGREEMENT (NDA)

Creator: ${user.email}
Viewer: ${recipientName}

Idea: "${ideaTitle}"

The viewer agrees not to share, copy, or disclose protected information.
This NDA is legally binding.

Signed electronically by:
Creator: ${user.email}
Viewer: ${recipientName}

Date: ${new Date().toLocaleDateString()}
    `;

    // Generate PDF
    const pdf = new jsPDF();
    pdf.text(text, 10, 10);

    // Save NDA to Firestore
    await addDoc(collection(db, "nda"), {
      creatorId: user.uid,
      creatorEmail: user.email,

      viewerId: null,
      viewerEmail: null,
      viewerName: recipientName,

      ideaId: null,
      ideaTitle,

      pdfUrl: null,
      status: "pending",

      reviewedByLawyerId: null,
      lawyerNotes: null,

      createdAt: serverTimestamp(),
    });

    // 🔔 Direct notification write (no utils import)
    await addDoc(collection(db, "notifications", user.uid, "list"), {
      message: `You generated an NDA for: "${ideaTitle}".`,
      link: "/nda/history",
      read: false,
      createdAt: serverTimestamp(),
    });

    // Download PDF for user
    pdf.save("NDA.pdf");

    alert("NDA generated, saved, and logged.");
  };

  return (
    <div className="p-6 text-white max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Generate NDA
      </h1>

      <input
        type="text"
        placeholder="Viewer Full Name"
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-4"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Idea Title"
        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-4"
        value={ideaTitle}
        onChange={(e) => setIdeaTitle(e.target.value)}
      />

      <button
        onClick={generateNDA}
        className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg"
      >
        Create NDA
      </button>
    </div>
  );
}
