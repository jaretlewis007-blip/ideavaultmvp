"use client"
import { db, auth } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useRole() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) setRole(snap.data().role);
    };

    checkRole();
  }, []);

  return role;
}
