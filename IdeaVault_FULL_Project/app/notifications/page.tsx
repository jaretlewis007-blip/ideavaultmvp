"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function NotificationsPage() {
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState([]);

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
    };

    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">All Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications yet.</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="mb-4 p-4 bg-white/10 border border-gold/30 rounded-xl"
          >
            <p className="text-white">{n.message}</p>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(n.createdAt?.seconds * 1000).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
