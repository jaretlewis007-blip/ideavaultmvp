"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CEOHub() {
  const user = auth.currentUser;
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [ndas, setNDAs] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------
  // 🔐 CEO ACCESS PROTECTION
  // --------------------------------
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return router.push("/login");

      const snap = await getDocs(collection(db, "users"));

      const current = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .find((u) => u.uid === user.uid);

      if (!current || current.role !== "ceo") {
        alert("Access Denied. CEO Only.");
        return router.push("/dashboard");
      }
    };

    checkAccess();
  }, [user, router]);

  // --------------------------------
  // 📊 SAFE TIMESTAMP FORMATTER
  // --------------------------------
  const formatDate = (d: any) => {
    if (!d) return "";
    if (d.toDate) return d.toDate().toLocaleString();
    return d.toString();
  };

  // --------------------------------
  // 📊 LOAD ALL DATA
  // --------------------------------
  useEffect(() => {
    const loadData = async () => {
      const userSnap = await getDocs(collection(db, "users"));
      const ideaSnap = await getDocs(collection(db, "ideas"));
      const ndaSnap = await getDocs(collection(db, "nda"));
      const postSnap = await getDocs(
        query(collection(db, "posts"), orderBy("createdAt", "desc"))
      );

      setUsers(userSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIdeas(ideaSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setNDAs(ndaSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setPosts(postSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-white text-center text-xl">
        Loading CEO Dashboard…
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">
        CEO Control Center
      </h1>

      <p className="text-gray-400 text-lg mb-10">
        Platform analytics, user growth, ideas, posts, and NDA activity.
      </p>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Total Ideas" value={ideas.length} />
        <StatCard title="Total NDAs" value={ndas.length} />
        <StatCard title="Total Posts" value={posts.length} />
      </div>

      {/* USERS TABLE */}
      <SectionTitle title="Users Overview" />
      <Table
        headers={["Name", "Email", "Role", "Created"]}
        rows={users.map((u) => [
          u.fullName,
          u.email,
          u.role,
          formatDate(u.createdAt),
        ])}
      />

      {/* IDEAS TABLE */}
      <SectionTitle title="Ideas Overview" />
      <Table
        headers={["Title", "Creator Email", "NDA Count", "Created"]}
        rows={ideas.map((i) => [
          i.title,
          i.creatorEmail,
          i.ndaCount ?? 0,
          formatDate(i.createdAt),
        ])}
      />

      {/* NDA TABLE */}
      <SectionTitle title="NDA Activity" />
      <Table
        headers={["Idea", "Viewer", "Creator", "Created"]}
        rows={ndas.map((n) => [
          n.ideaTitle,
          n.viewerName,
          n.creatorEmail,
          formatDate(n.createdAt),
        ])}
      />

      {/* POSTS TABLE */}
      <SectionTitle title="Recent Posts" />
      <Table
        headers={["Author", "Text", "Likes", "Comments", "Created"]}
        rows={posts.map((p) => [
          p.authorName,
          p.text.substring(0, 50) + "...",
          p.likeCount ?? 0,
          p.commentCount ?? 0,
          formatDate(p.createdAt),
        ])}
      />
    </div>
  );
}

//////////////////////////////////////////
// 🔥 COMPONENT: STAT CARD
//////////////////////////////////////////
function StatCard({ title, value }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold text-yellow-400 mt-2">{value}</p>
    </div>
  );
}

//////////////////////////////////////////
// 🔥 COMPONENT: SECTION TITLE
//////////////////////////////////////////
function SectionTitle({ title }: any) {
  return (
    <h2 className="text-2xl font-bold text-yellow-400 mt-12 mb-4">{title}</h2>
  );
}

//////////////////////////////////////////
// 🔥 COMPONENT: TABLE
//////////////////////////////////////////
function Table({ headers, rows }: any) {
  return (
    <div className="overflow-x-auto mb-10">
      <table className="min-w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <thead className="bg-zinc-800 text-gray-400 text-left text-sm">
          <tr>
            {headers.map((h: string, index: number) => (
              <th key={index} className="px-4 py-3 border-b border-zinc-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-gray-200 text-sm">
          {rows.map((row: any[], rowIndex: number) => (
            <tr
              key={rowIndex}
              className="hover:bg-zinc-800 transition border-b border-zinc-800"
            >
              {row.map((cell: any, cellIndex: number) => (
                <td key={cellIndex} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
