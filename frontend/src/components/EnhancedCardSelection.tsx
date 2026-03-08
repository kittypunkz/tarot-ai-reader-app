/**
 * Enhanced Card Selection Component
 * TASK-005: Interactive Carousel with Manual Selection
 * Replaces auto-shuffle with user-controlled selection
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { CardCarousel } from "@/components/cards/card-carousel";
import {
  TarotCard,
  SelectedCard,
  SpreadType as SpreadTypeType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// Mock spread types - in real app, fetch from API
const SPREAD_TYPES: Record<string, SpreadTypeType> = {
  single: {
    id: "single",
    name: "Single Card",
    nameTh: "ไพ่ 1 ใบ",
    cardCount: 1,
    description: "คำตอบตรงๆ สำหรับคำถามใช่/ไม่",
    positions: ["Answer"],
    positionsTh: ["คำตอบ"],
  },
  three_ppf: {
    id: "three_ppf",
    name: "Past Present Future",
    nameTh: "ไพ่ 3 ใบ",
    cardCount: 3,
    description: "อดีต ปัจจุบัน อนาคต",
    positions: ["Past", "Present", "Future"],
    positionsTh: ["อดีต", "ปัจจุบัน", "อนาคต"],
  },
  three_mbs: {
    id: "three_mbs",
    name: "Mind Body Spirit",
    nameTh: "ไพ่ 3 ใบ (จิต กาย วิญญาณ)",
    cardCount: 3,
    description: "สถานการณ์ คำแนะนำ ผลลัพธ์",
    positions: ["Situation", "Advice", "Outcome"],
    positionsTh: ["สถานการณ์", "คำแนะนำ", "ผลลัพธ์"],
  },
};

// Mock 78 tarot cards - in real app, fetch from API
const generateTarotCards = (): TarotCard[] => {
  const majorArcana = [
    { id: "0", name: "The Fool", nameTh: "เดอะฟูล", number: 0 },
    { id: "1", name: "The Magician", nameTh: "เดอะเมจิกเชี่ยน", number: 1 },
    { id: "2", name: "The High Priestess", nameTh: "เดอะไฮพรีสเตส", number: 2 },
    { id: "3", name: "The Empress", nameTh: "เดอะเอมเพรส", number: 3 },
    { id: "4", name: "The Emperor", nameTh: "เดอะเอ็มเพอเรอร์", number: 4 },
    { id: "5", name: "The Hierophant", nameTh: "เดอะไฮเออโรแฟนท์", number: 5 },
    { id: "6", name: "The Lovers", nameTh: "เดอะเลิฟเวอร์ส", number: 6 },
    { id: "7", name: "The Chariot", nameTh: "เดอะแชริออท", number: 7 },
    { id: "8", name: "Strength", nameTh: "สเตร็งท์", number: 8 },
    { id: "9", name: "The Hermit", nameTh: "เดอะเฮอร์มิต", number: 9 },
    { id: "10", name: "Wheel of Fortune", nameTh: "วีลออฟฟอร์จูน", number: 10 },
    { id: "11", name: "Justice", nameTh: "จัสติซ", number: 11 },
    { id: "12", name: "The Hanged Man", nameTh: "เดอะแฮงแมน", number: 12 },
    { id: "13", name: "Death", nameTh: "เดธ", number: 13 },
    { id: "14", name: "Temperance", nameTh: "เทมเพอแรนซ์", number: 14 },
    { id: "15", name: "The Devil", nameTh: "เดอะเดวิล", number: 15 },
    { id: "16", name: "The Tower", nameTh: "เดอะทาวเวอร์", number: 16 },
    { id: "17", name: "The Star", nameTh: "เดอะสตาร์", number: 17 },
    { id: "18", name: "The Moon", nameTh: "เดอะมูน", number: 18 },
    { id: "19", name: "The Sun", nameTh: "เดอะซัน", number: 19 },
    { id: "20", name: "Judgement", nameTh: "จัดจ์เมนท์", number: 20 },
    { id: "21", name: "The World", nameTh: "เดอะเวิลด์", number: 21 },
  ];

  return majorArcana.map((card) => ({
    ...card,
    arcana: "major" as const,
    imageUrl: `/cards/${card.id}.jpg`,
    meaningUpright: "",
    meaningReversed: "",
    keywords: [],
  }));
};

interface EnhancedCardSelectionProps {
  initialSpreadType?: string;
  question: string;
}

type SelectionPhase = "browsing" | "confirming";

export default function EnhancedCardSelection({
  initialSpreadType = "single",
  question,
}: EnhancedCardSelectionProps) {
  const router = useRouter();
  const [phase] = useState<SelectionPhase>("browsing");
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get spread type config
  const spreadType = SPREAD_TYPES[initialSpreadType] || SPREAD_TYPES["single"];
  const maxSelection = spreadType.cardCount;

  // Generate cards
  const cards = useMemo(() => generateTarotCards(), []);

  // Handle card selection
  const handleCardSelect = useCallback((card: TarotCard) => {
    if (selectedCards.length >= maxSelection) return;

    setSelectedCards((prev) => [
      ...prev,
      {
        ...card,
        position: prev.length,
        isReversed: Math.random() < 0.5, // 50% chance
        selectedAt: Date.now(),
      },
    ]);
  }, [selectedCards.length, maxSelection]);

  // Handle card deselect by ID (from carousel)
  const handleCardDeselect = useCallback((cardId: string) => {
    setSelectedCards((prev) => {
      const newCards = prev.filter((card) => card.id !== cardId);
      // Re-index positions
      return newCards.map((card, i) => ({ ...card, position: i }));
    });
  }, []);

  // Handle complete selection
  const handleComplete = useCallback(async () => {
    if (selectedCards.length !== maxSelection) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Call real API to create reading
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const sessionId = localStorage.getItem('tarot_session_id') || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tarot_session_id', sessionId);
      
      const response = await fetch(`${apiUrl}/api/v1/draw-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          spread_type: initialSpreadType,
          question,
          language: 'th',
        }),
      });

      if (!response.ok) {
        let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail?.message || errorData.message || `ข้อผิดพลาด ${response.status}`;
        } catch {
          errorMessage = `ข้อผิดพลาด ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Debug: Log the real card data from API
      console.log('=== REAL CARD DATA FROM API ===');
      console.log('Reading ID:', result.reading_id);
      console.log('Cards drawn:', result.cards.map((c: DrawnCard) => ({
        id: c.card_id,
        name: c.card_name_th,
        orientation: c.orientation,
        meaning: c.meaning_th?.substring(0, 50) + '...'
      })));
      
      // Store reading data for the result page
      localStorage.setItem('tarot_current_reading', JSON.stringify(result));
      
      // Navigate to result page with reading_id
      router.push(`/result?reading_id=${result.reading_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setIsSubmitting(false);
    }
  }, [selectedCards, maxSelection, question, router, spreadType, initialSpreadType]);

  // Handle back
  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-amber-200/70 hover:text-amber-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-amber-100">เลือกไพ่</h1>
          </div>

          <div className="w-16" />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Phase: Browsing - Show carousel and selection */}
            {phase === "browsing" && (
              <motion.div
                key="browsing"
                className="flex-1 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Question Display */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
                >
                  <p className="text-amber-200/60 text-sm mb-2">คำถามของคุณ</p>
                  <p className="text-amber-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    &ldquo;{question}&rdquo;
                  </p>
                </motion.div>

                {/* Spread Info */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-4"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 border border-amber-600/30">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-200 text-sm">
                      {spreadType.nameTh} • {spreadType.description}
                    </span>
                  </div>
                </motion.div>

                {/* Carousel */}
                <div className="flex-1 min-h-0 flex items-center">
                  <CardCarousel
                    cards={cards}
                    selectedCards={selectedCards}
                    maxSelection={maxSelection}
                    onCardSelect={handleCardSelect}
                    onCardDeselect={handleCardDeselect}
                  />
                </div>

                {/* Complete Button - Shows only when selection complete */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 mb-8"
                >
                  <button
                    onClick={handleComplete}
                    disabled={selectedCards.length !== maxSelection || isSubmitting}
                    className={cn(
                      "w-full max-w-md mx-auto py-4 rounded-xl font-semibold text-lg transition-all duration-300",
                      "flex items-center justify-center gap-2",
                      selectedCards.length === maxSelection
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-indigo-950 hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/25 cursor-pointer"
                        : "bg-indigo-950/60 text-indigo-400 border-2 border-indigo-800 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-indigo-950/30 border-t-indigo-950 rounded-full animate-spin" />
                        <span>กำลังดำเนินการ...</span>
                      </>
                    ) : selectedCards.length === maxSelection ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>🔮 ดูผลลัพธ์การอ่านไพ่ ({selectedCards.length}/{maxSelection})</span>
                      </>
                    ) : (
                      <>
                        <span>เลือกไพ่ให้ครบ {maxSelection} ใบ (เลือกแล้ว {selectedCards.length})</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}


          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-center"
            >
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm underline hover:text-red-200"
              >
                ลองอีกครั้ง
              </button>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-amber-400/30 text-xs">
            TASK-005: Enhanced Interactive Carousel • Drag to browse, tap to select
          </p>
        </footer>
      </div>
    </div>
  );
}
