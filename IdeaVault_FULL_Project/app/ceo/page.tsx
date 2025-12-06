"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

/* ----------------------------------------------------
   UTIL: Format Time
---------------------------------------------------- */
const timeAgo = (ts: any) => {
  if (!ts?.seconds) return "";
  const diff = (Date.now() - ts.seconds * 1000) / 1000;

  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function CEOPage() {
  const user = auth.currentUser;

  const [role, setRole] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);

  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [ndas, setNDAs] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [investorOffers, setInvestorOffers] = useState<any[]>([]);

  /* ----------------------------------------------------
     CHECK CEO ACCESS
  ---------------------------------------------------- */
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const r = await getDoc(doc(db, "users", user.uid));
      if (r.exists()) setRole(r.data().role);
    };
    checkRole();
  }, [user]);

  if (role !== "ceo") {
    return (
      <div className="p-10 text-center text-red-400 text-xl">
        Access Denied — CEO Only
      </div>
    );
  }

  /* ----------------------------------------------------
     LOAD DATA FOR ADMIN PANEL
  ---------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      // USERS
      const u = await getDocs(collection(db, "users"));
      setUsers(u.docs.map((d) => ({ id: d.id, ...d.data() })));

      // POSTS (from ideas)
      const p = await getDocs(collection(db, "ideas"));
      const allPosts = p.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(allPosts);

      // INVESTOR OFFERS
      setInvestorOffers(allPosts.filter((p) => p.type === "investor"));

      // NDAs
      const nd = await getDocs(collection(db, "nda"));
      setNDAs(nd.docs.map((d) => ({ id: d.id, ...d.data() })));

      // MARKETPLACE (auto-create if empty)
      const mk = await getDocs(collection(db, "marketplace"));
      setMarketplace(mk.docs.map((d) => ({ id: d.id, ...d.data() })));

      // ACTIVE USERS TODAY (posts + reactions + comments)
      const last24 = Date.now() - 24 * 60 * 60 * 1000;

      const activeSet = new Set();

      allPosts.forEach((p) => {
        if (p.createdAt?.seconds * 1000 > last24) activeSet.add(p.userId);

        p.reactions?.forEach((r: any) => {
          if (r.time > last24) activeSet.add(r.userId);
        });

        p.comments?.forEach((c: any) => {
          if (c.time > last24) activeSet.add(c.userId);
        });
      });

      setActiveUsers(activeSet.size);
    };

    loadData();
  }, []);

  /* ----------------------------------------------------
     CEO TOOLS
  ---------------------------------------------------- */
  const promoteToCeo = async (id: string) => {
    await updateDoc(doc(db, "users", id), { role: "ceo" });
    alert("User promoted to CEO.");
    window.location.reload();
  };

  const deletePost = async (id: string) => {
    await deleteDoc(doc(db, "ideas", id));
    alert("Post deleted.");
    window.location.reload();
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    alert("User deleted.");
    window.location.reload();
  };

  /* ----------------------------------------------------
     UI COMPONENTS — CLEAN + GOLD MIX
  ---------------------------------------------------- */
  const Card = ({ title, value }: any) => (
    <div className="bg-white/5 border border-gold/30 rounded-xl p-6 shadow-md text-center">
      <h2 className="text-gold text-lg font-bold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );

  const Table = ({ columns, data, actions }: any) => (
    <div className="bg-white/5 border border-gold/20 rounded-xl p-4 overflow-x-auto mt-6">
      <table className="w-full text-left">
        <thead>
          <tr className="text-gold border-b border-gold/20">
            {columns.map((col: any, i: number) => (
              <th key={i} className="p-2 font-bold">
                {col}
              </th>
            ))}
            {actions && <th className="p-2">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((row: any) => (
            <tr key={row.id} className="border-b border-white/10">
              {columns.map((col: any, i: number) => (
                <td key={i} className="p-2">
                  {row[col]}
                </td>
              ))}
              {actions && (
                <td className="p-2 flex gap-2">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ----------------------------------------------------
     RENDER ADMIN PANEL
  ---------------------------------------------------- */
  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold text-gold mb-6">
        👑 CEO Admin Panel
      </h1>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Active Users Today" value={activeUsers} />
      </div>

      {/* USERS TABLE */}
      <h2 className="text-2xl font-bold text-gold mt-12 mb-3">Users</h2>
      <Table
        columns={["email", "role"]}
        data={users}
        actions={(row: any) => (
          <>
            <button
              onClick={() => promoteToCeo(row.id)}
              className="px-3 py-1 bg-gold text-black rounded-lg"
            >
              Promote
            </button>
            <button
              onClick={() => deleteUser(row.id)}
              className="px-3 py-1 bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>
          </>
        )}
      />

      {/* POSTS TABLE */}
      <h2 className="text-2xl font-bold text-gold mt-12 mb-3">Posts</h2>
      <Table
        columns={["type", "userId"]}
        data={posts}
        actions={(row: any) => (
          <button
            onClick={() => deletePost(row.id)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        )}
      />

      {/* NDAs */}
      <h2 className="text-2xl font-bold text-gold mt-12 mb-3">NDAs</h2>
      <Table columns={["owner", "recipient"]} data={ndas} />

      {/* INVESTOR OFFERS */}
      <h2 className="text-2xl font-bold text-gold mt-12 mb-3">
        Investor Offers
      </h2>
      <Table
        columns={["userId", "amount", "equity"]}
        data={investorOffers}
      />

      {/* MARKETPLACE */}
      <h2 className="text-2xl font-bold text-gold mt-12 mb-3">
        Marketplace Work
      </h2>
      <Table
        columns={["vendor", "service", "price"]}
        data={marketplace}
      />

      <div className="h-20"></div>
    </div>
  );
}
