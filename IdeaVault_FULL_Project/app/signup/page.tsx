"use client";
import { useState } from "react";
import { auth, db } from "../../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      // DEFAULT ROLE
      let role = "creator";
      let fullAccess = false;

      // IF CEO EMAIL → GIVE CEO ROLE
      if (email === "ceoideavault@gmail.com") {
        role = "ceo";
        fullAccess = true;
      }

      // SAVE USER IN FIRESTORE
      await setDoc(doc(db, "users", uid), {
        email,
        role,
        fullAccess,
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");

    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-white text-2xl font-bold">Create Account</h1>

      <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-6">
        <input
          type="email"
          className="p-3 rounded bg-white/10 text-white"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="p-3 rounded bg-white/10 text-white"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-gold text-black p-3 rounded-lg font-bold">
          Sign Up
        </button>
      </form>
    </div>
  );
}
