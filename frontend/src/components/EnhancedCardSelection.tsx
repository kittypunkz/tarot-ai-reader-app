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

// Real 22 Major Arcana cards - IDs must match backend
const generateTarotCards = (): TarotCard[] => {
  const majorArcana = [
    { id: "the_fool", name: "The Fool", nameTh: "เดอะฟูล (คนโง่)", number: 0 },
    { id: "the_magician", name: "The Magician", nameTh: "เดอะเมจิเชี่ยน (นักเวทย์)", number: 1 },
    { id: "the_high_priestess", name: "The High Priestess", nameTh: "เดอะไฮพรีสเตส (หญิงสงฆ์สูง)", number: 2 },
    { id: "the_empress", name: "The Empress", nameTh: "ดิเอมเพรส (จักรพรรดินี)", number: 3 },
    { id: "the_emperor", name: "The Emperor", nameTh: "ดิเอ็มเพอร์เรอร์ (จักรพรรดิ)", number: 4 },
    { id: "the_hierophant", name: "The Hierophant", nameTh: "เดอะไฮเออโรแฟนต์ (สังฆราช)", number: 5 },
    { id: "the_lovers", name: "The Lovers", nameTh: "เดอะเลิฟเวอร์ส (คู่รัก)", number: 6 },
    { id: "the_chariot", name: "The Chariot", nameTh: "เดอะแชริออต (รถศึก)", number: 7 },
    { id: "strength", name: "Strength", nameTh: "สเตรงท์ (ความแข็งแกร่ง)", number: 8 },
    { id: "the_hermit", name: "The Hermit", nameTh: "เดอะเฮอร์มิต (ผู้สันโดษ)", number: 9 },
    { id: "wheel_of_fortune", name: "Wheel of Fortune", nameTh: "วีลออฟฟอร์จูน (ล้อแห่งโชคชะตา)", number: 10 },
    { id: "justice", name: "Justice", nameTh: "จัสติส (ความยุติธรรม)", number: 11 },
    { id: "the_hanged_man", name: "The Hanged Man", nameTh: "เดอะแฮงด์แมน (คนถูกแขวน)", number: 12 },
    { id: "death", name: "Death", nameTh: "เดธ (ความตาย)", number: 13 },
    { id: "temperance", name: "Temperance", nameTh: "เทมเพอแรนซ์ (ความพอดี)", number: 14 },
    { id: "the_devil", name: "The Devil", nameTh: "เดอะเดวิล (ปีศาจ)", number: 15 },
    { id: "the_tower", name: "The Tower", nameTh: "เดอะทาวเวอร์ (หอคอย)", number: 16 },
    { id: "the_star", name: "The Star", nameTh: "เดอะสตาร์ (ดวงดาว)", number: 17 },
    { id: "the_moon", name: "The Moon", nameTh: "เดอะมูน (ดวงจันทร์)", number: 18 },
    { id: "the_sun", name: "The Sun", nameTh: "เดอะซัน (ดวงอาทิตย์)", number: 19 },
    { id: "judgement", name: "Judgement", nameTh: "จัดเมนต์ (การตัดสิน)", number: 20 },
    { id: "the_world", name: "The World", nameTh: "เดอะเวิลด์ (โลก)", number: 21 },
  ];

  return majorArcana.map((card) => ({
    ...card,
    arcana: "major" as const,
    imageUrl: `/cards/${card.id}.png`,
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
      
      // Prepare selected cards for API - USE THE CARDS USER ACTUALLY SELECTED!
      const selectedCardsForApi = selectedCards.map((card, index) => ({
        card_id: card.id,  // e.g., "the_fool", "the_star"
        is_reversed: card.isReversed,
        position: index
      }));
      
      console.log('=== SENDING SELECTED CARDS TO API ===');
      console.log('Selected cards:', selectedCardsForApi);
      
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
          selected_cards: selectedCardsForApi,  // SEND ACTUAL USER SELECTIONS!
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
