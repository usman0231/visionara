// components/Loader.tsx
"use client";
import { useEffect, useState } from "react";

export default function Loader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleComplete = () => {
      // Delay for smooth fade-out
      setTimeout(() => setIsLoading(false), 500);
    };

    // Wait for the window to finish loading
    if (document.readyState === "complete") {
      handleComplete();
    } else {
      window.addEventListener("load", handleComplete);
    }

    return () => window.removeEventListener("load", handleComplete);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loader">
      <img
        src="/images/medium_res_logo.png"
        alt="Visionara Logo"
        className="loader-logo"
      />
    </div>
  );
}
