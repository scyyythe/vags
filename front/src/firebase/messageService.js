// src/firebase/messageService.js
import { db } from "./firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

// Send a new message
export const sendMessage = async (chatId, senderId, text) => {
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      text,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Subscribe to real-time updates
export const subscribeToMessages = (chatId, callback) => {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
