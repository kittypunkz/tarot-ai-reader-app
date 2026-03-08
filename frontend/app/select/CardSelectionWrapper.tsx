/**
 * Card Selection Wrapper
 * US-002: Intelligent Spread Selection
 * Handles query parameters and renders CardSelection
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// TASK-005: Using Enhanced Interactive Carousel
import EnhancedCardSelection from "@/components/EnhancedCardSelection";
// Import spread type from types
import type { SpreadType } from "@/lib/types";

export default function CardSelectionWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Get query parameters
  const question = searchParams.get("q") || "";
  const spreadType = (searchParams.get("spread") as string) || "single";
  const questionType = searchParams.get("type") || "";

  // Validate parameters
  useEffect(() => {
    if (!question) {
      // Redirect to home if no question
      router.push("/");
      return;
    }
    setIsReady(true);
  }, [question, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/5 animate-pulse">
            <span className="text-3xl">✦</span>
          </div>
          <p className="text-purple-300">กำลังเตรียมไพ่...</p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedCardSelection
      question={decodeURIComponent(question)}
      initialSpreadType={spreadType}
    />
  );
}
