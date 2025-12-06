// utils/notifications.ts

import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Send a notification to a specific user.
 *
 * This will create a document at:
 * notifications/{userId}/list/{notificationId}
 */
export const sendNotification = async (
  userId: string,
  message: string,
  link: string
) => {
  if (!userId) return;

  await addDoc(collection(db, "notifications", userId, "list"), {
    message,
    link,
    read: false,
    createdAt: serverTimestamp(),
  });
};
