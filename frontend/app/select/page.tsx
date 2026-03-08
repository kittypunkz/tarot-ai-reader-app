/**
 * Card Selection Page
 * US-002: Intelligent Spread Selection
 * Route: /select
 */

import { Suspense } from "react";
import CardSelectionWrapper from "./CardSelectionWrapper";

export default function SelectPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CardSelectionWrapper />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/5 animate-pulse">
          <span className="text-3xl">✦</span>
        </div>
        <p className="text-purple-300">กำลังโหลด...</p>
      </div>
    </div>
  );
}
