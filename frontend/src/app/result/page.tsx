/**
 * Reading Result Page
 * US-002: Reading Display
 * US-003: Follow-up Questions Integration
 */

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ReadingResult } from "@/components/ReadingResult";
import { getStoredReading, getReading, DrawCardsResponse, DrawnCard } from "@/lib/api";
import { SelectedCard } from "@/lib/types";
import { Loader2, AlertCircle } from "lucide-react";
import { CardGrid } from "@/components/CardDisplay";

// Extract card number from card_id (e.g., "the_fool" -> 0, "the_magician" -> 1)
const cardNumberMap: Record<string, number> = {
  "the_fool": 0, "the_magician": 1, "the_high_priestess": 2, "the_empress": 3,
  "the_emperor": 4, "the_hierophant": 5, "the_lovers": 6, "the_chariot": 7,
  "strength": 8, "the_hermit": 9, "wheel_of_fortune": 10, "justice": 11,
  "the_hanged_man": 12, "death": 13, "temperance": 14, "the_devil": 15,
  "the_tower": 16, "the_star": 17, "the_moon": 18, "the_sun": 19,
  "judgement": 20, "the_world": 21
};

// Convert API cards to SelectedCard format
function convertCards(reading: DrawCardsResponse): SelectedCard[] {
  return reading.cards.map((card, index) => ({
    id: card.card_id,
    name: card.card_name,
    nameTh: card.card_name_th,
    number: cardNumberMap[card.card_id] ?? index,
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
        console.log('=== LOADING READING ===');
        console.log('Reading ID from URL:', readingId);
        
        // ALWAYS fetch from API if we have a reading_id to ensure correct data
        if (readingId) {
          console.log('Fetching from API (reading_id provided)...');
          const fetched = await getReading(readingId);
          if (fetched) {
            console.log('Fetched from API:', {
              id: fetched.reading_id,
              cards: fetched.cards?.map((c: DrawnCard) => c.card_name_th)
            });
            setReading(fetched);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage only if no reading_id or API failed
        const stored = getStoredReading();
        console.log('Fallback to localStorage:', stored ? {
          id: stored.reading_id,
          cards: stored.cards?.map((c: DrawnCard) => c.card_name_th)
        } : 'null');
        
        if (stored) {
          setReading(stored);
        } else {
          setError("ไม่พบผลการอ่านไพ่");
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
  
  // DEBUG: Show exactly what cards we're displaying
  console.log('=== CARDS BEING DISPLAYED ===');
  console.log('Raw API cards:', reading.cards.map(c => ({id: c.card_id, name: c.card_name_th, orientation: c.orientation})));
  console.log('Converted cards:', cards.map(c => ({id: c.id, name: c.nameTh, isReversed: c.isReversed})));
  
  // Use AI interpretation from API response
  console.log('AI Interpretation:', {
    th: reading.interpretation_th?.substring(0, 100),
    en: reading.interpretation?.substring(0, 100)
  });
  
  // Prioritize Thai interpretation, fallback to English, then to individual card meanings
  const interpretation = reading.interpretation_th || reading.interpretation || reading.cards
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
