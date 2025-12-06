"use client";

import { useState, useRef } from "react";
import { auth, db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { sendNotification } from "../utils/notifications";

export default function NDAGenerator() {
  const [recipientName, setRecipientName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [idea, setIdea] = useState("");
  const [ownerSignature, setOwnerSignature] = useState("");
  const [recipientSignature, setRecipientSignature] = useState("");
  const [generatedNDA, setGeneratedNDA] = useState("");
  const [loading, setLoading] = useState(false);

  const generateNDA = async () => {
    if (!recipientName || !ownerName || !idea) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const ndaId = "NDA-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const date = new Date().toLocaleDateString();

    const template = `
📄 **NON-DISCLOSURE AGREEMENT (NDA)**  
**ID:** ${ndaId}  
**Date:** ${date}

This Non-Disclosure Agreement ("Agreement") is entered into between:

**Owner:** ${ownerName}  
**Recipient:** ${recipientName}

Both parties agree to the following terms:

---

### **1. Confidential Information**
This includes all ideas, concepts, strategies, and intellectual property related to:

**Idea:**  
${idea}

---

### **2. Obligations of Recipient**
The Recipient agrees:
- Not to disclose or steal the idea  
- Not to reproduce or exploit it  
- To use the information only for evaluation  

---

### **3. Ownership**
All rights remain with **${ownerName}**.

---

### **4. Term**
This Agreement is valid indefinitely unless mutually terminated.

---

### **5. Signatures**

**Owner Signature:**  
${ownerSignature ? ownerSignature : "_________________________"}  

**Recipient Signature:**  
${recipientSignature ? recipientSignature : "_________________________"}  

---

This Agreement is legally binding.
`;

    setGeneratedNDA(template);
    setLoading(false);

    // Save NDA + signatures to Firebase
    try {
      await addDoc(collection(db, "ndas"), {
        owner: ownerName,
        recipient: recipientName,
        idea,
        ndaId,
        date,
        ownerSignature,
        recipientSignature,
        content: template,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid ?? null
      });

      sendNotification(auth.currentUser?.uid, "New NDA Generated", `/nda/${ndaId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 text-white">

      {/* LEFT PANEL */}
      <div className="bg-white/10 backdrop-blur-lg border border-gold/40 rounded-xl p-6 shadow-lg w-full md:w-1/2">
        <h1 className="text-2xl font-bold text-gold mb-4">NDA Generator</h1>

        <input
          className="w-full p-3 mb-3 rounded bg-black/30 border border-gold/30 text-white"
          placeholder="Recipient Name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 rounded bg-black/30 border border-gold/30 text-white"
          placeholder="Owner Name (You)"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-3 rounded bg-black/30 border border-gold/30 text-white h-32"
          placeholder="Describe your idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />

        <h2 className="text-lg font-semibold text-gold mt-4">Signatures</h2>

        <input
          className="w-full p-3 my-2 rounded bg-black/30 border border-gold/30 text-white"
          placeholder="Owner Typed Signature"
          value={ownerSignature}
          onChange={(e) => setOwnerSignature(e.target.value)}
        />

        <input
          className="w-full p-3 my-2 rounded bg-black/30 border border-gold/30 text-white"
          placeholder="Recipient Typed Signature"
          value={recipientSignature}
          onChange={(e) => setRecipientSignature(e.target.value)}
        />

        <button
          onClick={generateNDA}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          {loading ? "Generating..." : "Generate NDA"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-white/10 backdrop-blur-lg border border-gold/40 rounded-xl p-6 shadow-lg w-full md:w-1/2">
        <h2 className="text-xl font-semibold text-gold mb-3">Generated NDA</h2>

        {!generatedNDA ? (
          <p className="text-gray-300">Your NDA will appear here once generated.</p>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-white">{generatedNDA}</pre>
        )}
      </div>
    </div>
  );
}
