// src/testFirebase.ts
import { db } from "./firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function testFirestore() {
  try {
    const testRef = doc(db, "testCollection", "testDoc");

    // Write
    await setDoc(testRef, { connected: true, timestamp: Date.now() });

    // Read
    const snapshot = await getDoc(testRef);

    if (snapshot.exists()) {
      console.log("🔥 Firestore connected! Document data:", snapshot.data());
    } else {
      console.log("❌ Firestore write failed");
    }
  } catch (error) {
    console.error("⚠️ Firestore error:", error);
  }
}
