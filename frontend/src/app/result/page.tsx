/**
 * Reading Result Page
 * US-002: Reading Display
 * US-003: Follow-up Questions Integration
 */

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ReadingResult } from "@/components/ReadingResult";
import { getStoredReading, getReading, DrawCardsResponse } from "@/lib/api";
import { SelectedCard } from "@/lib/types";
import { Loader2, AlertCircle } from "lucide-react";

// Convert API cards to SelectedCard format
function convertCards(reading: DrawCardsResponse): SelectedCard[] {
  return reading.cards.map((card, index) => ({
    id: card.card_id,
    name: card.card_name,
    nameTh: card.card_name_th,
    number: parseInt(card.card_id) || index + 1,
    arcana: "major" as const,
    imageUrl: card.image_url || `/cards/${card.card_id}.jpg`,
    meaningUpright: card.meaning,
    meaningReversed: card.meaning,
    keywords: card.keywords,
    position: card.position,
    isReversed: card.orientation === "reversed",
    selectedAt: Date.now(),
  }));
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reading, setReading] = useState<DrawCardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const readingId = searchParams.get("reading_id");
  
  useEffect(() => {
    async function loadReading() {
      try {
        // First try to get from localStorage
        const stored = getStoredReading();
        
        if (stored && (!readingId || stored.reading_id === readingId)) {
          setReading(stored);
          setLoading(false);
          return;
        }
        
        // If not in localStorage or different reading_id, fetch from API
        if (readingId) {
          const fetched = await getReading(readingId);
          if (fetched) {
            setReading(fetched);
          } else {
            setError("ไม่พบผลการอ่านไพ่");
          }
        } else {
          setError("ไม่พบรหัสการอ่าน");
        }
      } catch (err) {
        console.error("Failed to load reading:", err);
        setError("เกิดข้อผิดพลาดในการโหลดผลการอ่าน");
      } finally {
        setLoading(false);
      }
    }
    
    loadReading();
  }, [readingId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
        <div className="flex items-center gap-3 text-amber-200/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>กำลังโหลดผลการอ่าน...</span>
        </div>
      </div>
    );
  }
  
  if (error || !reading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-amber-100 mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-amber-200/60 mb-6">
            {error || "ไม่พบผลการอ่านไพ่"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-amber-500 text-indigo-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }
  
  const cards = convertCards(reading);
  const positions = reading.spread.positions_th || reading.spread.positions;
  
  // Generate interpretation from cards
  const interpretation = reading.cards
    .map((card, index) => {
      const positionName = positions[index] || `ตำแหน่ง ${index + 1}`;
      const orientation = card.orientation === "reversed" ? " (กลับหัว)" : "";
      return `${positionName}: ${card.card_name_th}${orientation}\n${card.meaning_th}`;
    })
    .join("\n\n");
  
  return (
    <ReadingResult
      sessionId={reading.session_id}
      readingId={reading.reading_id}
      question={reading.question}
      cards={cards}
      positions={positions}
      interpretation={interpretation}
      followUpCount={0} // Will be updated by API
      maxFollowUps={3}
      createdAt={reading.created_at}
      onNewReading={() => router.push("/")}
    />
  );
}

// Loading fallback
function ResultLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      <div className="flex items-center gap-3 text-amber-200/60">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>กำลังโหลด...</span>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <ResultContent />
    </Suspense>
  );
}
