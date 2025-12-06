"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const user = auth.currentUser;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  // Load notifications
  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("toUser", "==", user.uid)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setNotifications(list);
      setUnread(list.filter((n) => !n.read).length);
    };

    load();
  }, [user]);

  // Logout
  const logOut = async () => {
    await signOut(auth);
    router.push("/auth/signin");
  };

  return (
    <div
      className="
      fixed top-0 left-0 right-0
      pl-72
      bg-white/10 backdrop-blur-xl 
      border-b border-gold/20 shadow-xl 
      h-16 flex items-center justify-between px-6
      z-50
    "
    >
      {/* Left Side — Logo */}
      <h1 className="text-2xl font-extrabold text-gold tracking-wide drop-shadow">
        IdeaVault
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-8">

        {/* NOTIFICATION BELL */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl cursor-pointer"
          >
            🔔
          </button>

          {/* Unread bubble */}
          {unread > 0 && (
            <span
              className="
                absolute -top-1 -right-2
                bg-red-600 text-white
                w-5 h-5 rounded-full 
                flex items-center justify-center text-xs
              "
            >
              {unread}
            </span>
          )}

          {/* Dropdown */}
          {open && (
            <div
              className="
                absolute right-0 mt-3
                w-72 max-h-80 overflow-y-auto
                bg-black/70 backdrop-blur-xl
                border border-gold/30 rounded-xl shadow-xl p-4
                fade-in
              "
            >
              <h3 className="text-gold font-bold mb-3">Notifications</h3>

              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm">No notifications yet.</p>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="
                      p-3 mb-2 rounded-lg 
                      bg-white/10 border border-gold/20
                    "
                  >
                    <p className="text-white text-sm">{item.message}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.createdAt?.seconds
                        ? new Date(
                            item.createdAt.seconds * 1000
                          ).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))
              )}

              <Link
                href="/notifications"
                className="block text-center text-gold font-bold mt-2"
              >
                View All →
              </Link>
            </div>
          )}
        </div>

        {/* Profile Link */}
        <Link href="/profile" className="text-gray-200 hover:text-gold">
          Profile
        </Link>

        {/* Logout */}
        <button onClick={logOut} className="btn-gold">
          Logout
        </button>
      </div>
    </div>
  );
}
