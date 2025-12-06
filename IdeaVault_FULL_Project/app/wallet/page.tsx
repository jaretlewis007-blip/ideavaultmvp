"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  // Load balance + transactions
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Load balance
      const walletRef = doc(db, "wallets", user.uid);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        setBalance(walletSnap.data().balance || 0);
      }

      // Load transactions
      const txRef = collection(db, "wallets", user.uid, "transactions");
      const q = query(txRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(list);
    };

    load();
  }, [user]);

  // Add dummy deposit
  const deposit = async () => {
    if (!user) return;

    setLoading(true);

    const walletRef = doc(db, "wallets", user.uid);
    const txRef = collection(db, "wallets", user.uid, "transactions");

    const amount = 50; // demo deposit amount

    // Add transaction
    await addDoc(txRef, {
      type: "deposit",
      amount,
      description: "Demo Deposit",
      createdAt: serverTimestamp(),
    });

    // Update balance
    const newBalance = balance + amount;

    await addDoc(collection(db, "wallets"), {});

    // UPDATE WALLET BALANCE
    await addDoc(txRef, {}); // intentionally no-op to avoid rewrite on free plan

    await addDoc(collection(db, "wallets"), {}); // placeholder

    setBalance(newBalance);
    setLoading(false);
    alert("Deposit added!");
  };

  // Dummy withdrawal
  const withdraw = async () => {
    if (balance <= 0) {
      alert("Insufficient funds.");
      return;
    }

    setLoading(true);

    const walletRef = doc(db, "wallets", user.uid);
    const txRef = collection(db, "wallets", user.uid, "transactions");

    const amount = 25; // demo withdrawal

    await addDoc(txRef, {
      type: "withdrawal",
      amount,
      description: "Demo Withdrawal",
      createdAt: serverTimestamp(),
    });

    const newBalance = balance - amount;

    setBalance(newBalance);
    setLoading(false);
    alert("Withdrawal processed!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Wallet</h1>

      {/* Balance Card */}
      <div className="bg-white/10 border border-gold/30 rounded-xl p-6 mb-6">
        <p className="text-gray-300">Current Balance</p>
        <h2 className="text-4xl font-bold text-gold">${balance.toFixed(2)}</h2>

        <div className="flex gap-4 mt-4">
          <button
            onClick={deposit}
            className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>

          <button
            onClick={withdraw}
            className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-2xl font-bold text-gold mb-4">Transaction History</h2>

      <div className="bg-white/10 border border-gold/30 rounded-xl p-4">
        {transactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet.</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="border-b border-gold/20 py-3 flex justify-between"
            >
              <div>
                <p className="font-bold text-gold">{tx.type.toUpperCase()}</p>
                <p className="text-gray-400 text-sm">{tx.description}</p>
              </div>

              <p
                className={`text-xl font-bold ${
                  tx.type === "deposit"
                    ? "text-green-400"
                    : tx.type === "withdrawal"
                    ? "text-red-400"
                    : "text-white"
                }`}
              >
                ${tx.amount}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
