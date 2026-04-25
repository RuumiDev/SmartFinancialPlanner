"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function FirebaseTestButton() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Logged in as:", result.user.displayName);
      alert(`✅ Success! Logged in as: ${result.user.displayName}`);
    } catch (error) {
      console.error("❌ Firebase login error:", error);
      alert(`❌ Error: ${(error as Error).message}`);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        padding: "12px 24px",
        background: "#4285F4",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      Test Google Login
    </button>
  );
}
