"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../../../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  // 🔥 Redirect logged-in users away from login page
  if (user) {
    router.push("/creatorhub");
  }

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="text-white max-w-md mx-auto mt-20 p-6 glass">
      <h1 className="text-3xl font-bold gold-text mb-6">Login</h1>

      <input
        className="w-full p-3 mb-3 bg-black border border-white/20 rounded"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-3 mb-3 bg-black border border-white/20 rounded"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleLogin}
        className="w-full bg-gold text-black font-semibold py-3 rounded-lg hover:opacity-80 transition"
      >
        Login
      </button>

      <p className="text-sm mt-4">
        Don’t have an account?{" "}
        <Link href="/auth/signup" className="text-gold underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
