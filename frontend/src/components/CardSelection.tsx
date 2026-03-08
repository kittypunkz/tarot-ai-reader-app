/**
 * Card Selection Component
 * US-002: Intelligent Spread Selection
 * Main page for drawing and revealing tarot cards
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import InfinityCarousel from "./InfinityCarousel";
import TarotCard, { CardDetailPanel } from "./TarotCard";
import {
  drawCards,
  getStoredReading,
  storeReading,
  clearStoredReading,
  type DrawCardsResponse,
  type DrawnCard,
  type SpreadType,
} from "@/lib/api";

interface CardSelectionProps {
  initialSpreadType?: SpreadType;
  question: string;
}

type SelectionPhase = "intro" | "shuffling" | "drawing" | "revealing" | "complete";

export default function CardSelection({
  initialSpreadType = "single",
  question,
}: CardSelectionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<SelectionPhase>("intro");
  const [reading, setReading] = useState<DrawCardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);

  // Check for stored reading on mount
  useEffect(() => {
    const stored = getStoredReading();
    if (stored && stored.question === question) {
      setReading(stored);
      setPhase("complete");
      setRevealedCards(new Set(stored.cards.map((_, i) => i)));
    }
  }, [question]);

  // Start the card drawing process
  const startDrawing = useCallback(async () => {
    setPhase("shuffling");
    setError(null);

    try {
      const response = await drawCards(question, initialSpreadType);
      setReading(response);
      storeReading(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPhase("intro");
    }
  }, [question, initialSpreadType]);

  // Handle shuffle complete
  const handleShuffleComplete = useCallback(() => {
    setPhase("revealing");
  }, []);

  // Handle card flip
  const handleCardFlip = useCallback(
    (index: number) => {
      setRevealedCards((prev) => new Set([...prev, index]));
      if (reading) {
        setSelectedCard(reading.cards[index]);
      }

      // Check if all cards revealed
      if (reading && revealedCards.size + 1 >= reading.cards.length) {
        setTimeout(() => setPhase("complete"), 1000);
      }
    },
    [reading, revealedCards.size]
  );

  // Handle redraw
  const handleRedraw = useCallback(() => {
    clearStoredReading();
    setReading(null);
    setRevealedCards(new Set());
    setSelectedCard(null);
    setPhase("intro");
  }, []);

  // Handle back
  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  // Render based on phase
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.4&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-white">ถามแม่หมอ</h1>
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Phase: Intro - Show question and start button */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                className="text-center max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Question display */}
                <div className="mb-8">
                  <p className="text-purple-300 text-sm mb-2">คำถามของคุณ</p>
                  <p className="text-white text-xl md:text-2xl font-medium leading-relaxed">
                    &ldquo;{question}&rdquo;
                  </p>
                </div>

                {/* Spread info */}
                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-purple-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-purple-200 text-sm">
                    {initialSpreadType === "single"
                      ? "ไพ่ 1 ใบ - คำตอบตรงๆ"
                      : initialSpreadType === "three_ppf"
                      ? "ไพ่ 3 ใบ - อดีต ปัจจุบัน อนาคต"
                      : "ไพ่ 3 ใบ - จิต กาย วิญญาณ"}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={startDrawing}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-semibold text-lg rounded-xl shadow-lg shadow-orange-500/25 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  <span>เปิดไพ่</span>
                </button>

                <p className="mt-6 text-purple-300/60 text-sm">
                  กดปุ่มเพื่อเริ่มสับไพ่และเปิดไพ่ทำนาย
                </p>
              </motion.div>
            )}

            {/* Phase: Shuffling - Show infinity carousel */}
            {(phase === "shuffling" || phase === "drawing") && (
              <motion.div
                key="shuffling"
                className="w-full max-w-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <InfinityCarousel
                  cardCount={initialSpreadType === "single" ? 1 : 3}
                  onComplete={handleShuffleComplete}
                  isShuffling={phase === "shuffling"}
                  duration={4}
                />
              </motion.div>
            )}

            {/* Phase: Revealing - Show cards to flip */}
            {(phase === "revealing" || phase === "complete") && reading && (
              <motion.div
                key="revealing"
                className="w-full max-w-5xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Question */}
                <div className="text-center mb-8">
                  <p className="text-purple-300 text-sm mb-2">คำถาม</p>
                  <p className="text-white text-lg md:text-xl font-medium">
                    &ldquo;{question}&rdquo;
                  </p>
                </div>

                {/* Cards */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8">
                  {reading.cards.map((card, index) => (
                    <TarotCard
                      key={`${card.card_id}-${index}`}
                      card={card}
                      index={index}
                      isRevealed={revealedCards.has(index)}
                      onFlip={() => handleCardFlip(index)}
                      size="md"
                    />
                  ))}
                </div>

                {/* Card Detail Panel */}
                {selectedCard && (
                  <CardDetailPanel
                    card={selectedCard}
                    isVisible={true}
                  />
                )}

                {/* Completion actions */}
                {phase === "complete" && (
                  <motion.div
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={handleRedraw}
                      className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-purple-500/30 rounded-xl text-purple-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>เปิดใหม่</span>
                    </button>

                    <button
                      onClick={() => {
                        // TODO: Navigate to interpretation or summary
                        console.log("Continue to interpretation...");
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl text-white font-medium transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ดูคำทำนาย</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error display */}
          {error && (
            <motion.div
              className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm underline"
              >
                ลองอีกครั้ง
              </button>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-purple-400/40 text-xs">
            ไพ่ทาโรต์เป็นเครื่องมือช่วยนำทาง การตัดสินใจขึ้นอยู่กับคุณ
          </p>
        </footer>
      </div>
    </div>
  );
}
