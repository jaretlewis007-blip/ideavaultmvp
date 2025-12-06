"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../../firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import Link from "next/link";

export default function PostComments({ params }: any) {
  const { postId } = params;

  const user = auth.currentUser;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // LOAD POST HEADER INFO
  // -----------------------------
  useEffect(() => {
    const postRef = doc(db, "posts", postId);

    getDoc(postRef).then((snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
  }, [postId]);

  // -----------------------------
  // LOAD COMMENTS LIVE
  // -----------------------------
  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(list);

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsub();
  }, [postId]);

  // -----------------------------
  // SUBMIT COMMENT
  // -----------------------------
  const addComment = async () => {
    if (!text.trim() || !user) return;

    const commentRef = collection(db, "posts", postId, "comments");

    await addDoc(commentRef, {
      text,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });

    // Update comment count on the post
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentCount: comments.length + 1,
    });

    setText("");
  };

  // -----------------------------
  // DELETE COMMENT (your own only)
  // -----------------------------
  const deleteComment = async (commentId: string, authorId: string) => {
    if (!user || user.uid !== authorId) return;

    await deleteDoc(doc(db, "posts", postId, "comments", commentId));

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentCount: Math.max(comments.length - 1, 0),
    });
  };

  return (
    <div className="p-6 text-white max-w-3xl mx-auto h-screen flex flex-col">

      {/* HEADER */}
      <Link
        href="/dashboard"
        className="text-gray-400 hover:text-yellow-400 text-sm mb-4"
      >
        ← Back to Feed
      </Link>

      {post && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-6">
          <p className="text-yellow-400 font-bold text-lg">{post.authorName}</p>
          <p className="text-gray-300 whitespace-pre-line mt-2">
            {post.text}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {post.createdAt?.toDate().toLocaleString()}
          </p>
        </div>
      )}

      {/* COMMENTS */}
      <div className="flex-1 overflow-y-auto bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        {comments.map((c) => (
          <div
            key={c.id}
            className="mb-4 bg-zinc-800 p-3 rounded-xl border border-zinc-700"
          >
            <p className="text-yellow-400 text-sm font-bold">
              {c.authorName}
            </p>

            <p className="text-gray-200 mt-1 whitespace-pre-line">{c.text}</p>

            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{c.createdAt?.toDate().toLocaleString()}</span>

              {user?.uid === c.authorId && (
                <button
                  onClick={() => deleteComment(c.id, c.authorId)}
                  className="text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* COMMENT INPUT */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Write a comment…"
          className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={addComment}
          className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
