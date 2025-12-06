"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth, db, storage } from "../../../firebase/config";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProjectRoom() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [attachFile, setAttachFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  // Load Project Data
  useEffect(() => {
    const loadProject = async () => {
      const projectRef = doc(db, "projects", id);
      const snap = await getDoc(projectRef);

      if (snap.exists()) setProject(snap.data());
    };

    const loadMessages = async () => {
      const msgsRef = collection(db, "projects", id, "messages");
      const q = query(msgsRef, orderBy("createdAt", "asc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);
    };

    loadProject();
    loadMessages();
  }, [id]);

  // Send message
  const sendMessage = async () => {
    if (!msgInput && !attachFile) return;

    setLoading(true);

    let attachmentUrl = null;

    if (attachFile) {
      const filePath = `user_uploads/projects/${id}/attachments/${Date.now()}_${attachFile.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, attachFile);
      attachmentUrl = await getDownloadURL(storageRef);
    }

    const msgRef = collection(db, "projects", id, "messages");

    await addDoc(msgRef, {
      senderId: user.uid,
      text: msgInput,
      attachmentUrl,
      createdAt: serverTimestamp(),
    });

    setMsgInput("");
    setAttachFile(null);
    setLoading(false);
  };

  // ACCEPT OFFER
  const acceptOffer = async () => {
    await updateDoc(doc(db, "projects", id), {
      status: "active",
      decisionAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      toUser: project.investorId,
      fromUser: user.uid,
      type: "offerAccepted",
      message: `Your offer for "${project.ideaTitle}" was ACCEPTED!`,
      projectId: id,
      createdAt: serverTimestamp(),
      read: false,
    });

    alert("Offer Accepted!");
    window.location.reload();
  };

  // DECLINE OFFER
  const declineOffer = async () => {
    await updateDoc(doc(db, "projects", id), {
      status: "declined",
      decisionAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      toUser: project.investorId,
      fromUser: user.uid,
      type: "offerDeclined",
      message: `Your offer for "${project.ideaTitle}" was DECLINED.`,
      projectId: id,
      createdAt: serverTimestamp(),
      read: false,
    });

    alert("Offer Declined.");
    window.location.reload();
  };

  if (!project)
    return <p className="text-white p-6">Loading project...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gold">
          Project Room — {project.ideaTitle}
        </h1>

        {/* STATUS BADGE */}
        <span
          className={`px-4 py-2 rounded-lg text-sm font-bold ${
            project.status === "active"
              ? "bg-green-700"
              : project.status === "declined"
              ? "bg-red-700"
              : "bg-yellow-600"
          }`}
        >
          {project.status ? project.status.toUpperCase() : "PENDING"}
        </span>
      </div>

      {/* Project Summary */}
      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-gold mb-2">Project Summary</h2>

        <p className="text-gray-300">
          <span className="text-gold">Offer Amount:</span> ${project.offerAmount}
        </p>

        <p className="text-gray-300 mt-1">
          <span className="text-gold">Creator:</span> {project.creatorId}
        </p>

        <p className="text-gray-300 mt-1">
          <span className="text-gold">Investor:</span> {project.investorId}
        </p>

        {project.offerMessage && (
          <p className="text-gray-400 mt-3 italic">
            “{project.offerMessage}”
          </p>
        )}
      </div>

      {/* Chat Section */}
      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-gold mb-4">Messages</h2>

        {/* Messages Window */}
        <div className="max-h-96 overflow-y-auto border border-gold/20 rounded p-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 p-3 rounded-xl w-fit max-w-xs ${
                msg.senderId === user.uid
                  ? "bg-green-700 ml-auto"
                  : "bg-gray-700 mr-auto"
              }`}
            >
              {msg.text && <p>{msg.text}</p>}

              {msg.attachmentUrl && (
                <img
                  src={msg.attachmentUrl}
                  className="rounded-xl mt-2 border border-gold/20"
                />
              )}
            </div>
          ))}
        </div>

        <textarea
          className="w-full bg-black/40 border border-gold/30 rounded p-3 text-sm mb-3"
          placeholder="Write a message..."
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
        />

        <input
          type="file"
          className="mb-3"
          onChange={(e) => setAttachFile(e.target.files[0])}
        />

        <button
          onClick={sendMessage}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>

      {/* Accept / Decline Buttons */}
      {project.status === "pending" && (
        <div className="flex gap-4">
          <button
            onClick={acceptOffer}
            className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
          >
            Accept Offer
          </button>

          <button
            onClick={declineOffer}
            className="flex-1 bg-red-600 hover:bg-red-700 p-3 rounded-lg font-bold"
          >
            Decline Offer
          </button>
        </div>
      )}
    </div>
  );
}
