"use client";
import { useState } from "react";
import { auth } from "../../../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.log(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-white text-2xl font-semibold">Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-white/10 text-white"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-white/10 text-white"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-gold text-black font-bold p-3 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}
