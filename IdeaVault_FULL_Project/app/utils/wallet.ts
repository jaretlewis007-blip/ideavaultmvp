import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Auto create wallet if missing
export const ensureWallet = async (userId: string) => {
  const walletRef = doc(db, "wallets", userId);
  const snap = await getDoc(walletRef);

  if (!snap.exists()) {
    await setDoc(walletRef, {
      balance: 0,
      updatedAt: serverTimestamp(),
    });
  }
};

// Add transaction + update balance
export const addTransaction = async (
  userId: string,
  amount: number,
  type: string,
  note: string,
  from: string = "",
  to: string = "",
  ideaId: string = ""
) => {
  await ensureWallet(userId);

  const walletRef = doc(db, "wallets", userId);
  const walletSnap = await getDoc(walletRef);
  const currentBalance = walletSnap.data()?.balance || 0;

  await updateDoc(walletRef, {
    balance: currentBalance + amount,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "transactions", userId, "list"), {
    type,
    amount,
    from,
    to,
    ideaId,
    note,
    createdAt: serverTimestamp(),
  });
};
