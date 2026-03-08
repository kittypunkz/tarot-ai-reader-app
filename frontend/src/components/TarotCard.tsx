/**
 * Tarot Card Component
 * US-002: Intelligent Spread Selection
 * 3D flip animation with card details
 */

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { DrawnCard } from "@/lib/api";

interface TarotCardProps {
  card: DrawnCard;
  index: number;
  delay?: number;
  onFlip?: () => void;
  isRevealed?: boolean;
  size?: "sm" | "md" | "lg";
}

// Card back (face down)
const CardBack = () => (
  <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 border-2 border-amber-500/50 shadow-2xl overflow-hidden relative">
    {/* Star pattern */}
    <div className="absolute inset-0 opacity-30">
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <defs>
          <pattern id="cardStars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="#fbbf24" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cardStars)" />
      </svg>
    </div>
    
    {/* Center ornament */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-20 h-28 rounded-lg border border-amber-500/40 flex items-center justify-center">
        <div className="w-12 h-20 rounded border border-amber-500/60 flex items-center justify-center">
          <span className="text-3xl text-amber-400">✦</span>
        </div>
      </div>
    </div>
    
    {/* Corner decorations */}
    <div className="absolute top-2 left-2 text-amber-500/60 text-xs">✦</div>
    <div className="absolute top-2 right-2 text-amber-500/60 text-xs">✦</div>
    <div className="absolute bottom-2 left-2 text-amber-500/60 text-xs">✦</div>
    <div className="absolute bottom-2 right-2 text-amber-500/60 text-xs">✦</div>
  </div>
);

// Card front (face up)
const CardFront = ({ card, size }: { card: DrawnCard; size: "sm" | "md" | "lg" }) => {
  const isReversed = card.orientation === "reversed";
  
  const sizeClasses = {
    sm: "w-32 h-44",
    md: "w-44 h-60",
    lg: "w-56 h-80",
  };

  const fontSizes = {
    sm: { title: "text-xs", subtitle: "text-[10px]", icon: "text-3xl" },
    md: { title: "text-sm", subtitle: "text-xs", icon: "text-5xl" },
    lg: { title: "text-base", subtitle: "text-sm", icon: "text-6xl" },
  };

  const fonts = fontSizes[size];

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-amber-50 via-white to-amber-100 border-2 border-amber-400 shadow-xl overflow-hidden relative`}
      style={{
        transform: isReversed ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.6s ease-out",
      }}
    >
      {/* Card border pattern */}
      <div className="absolute inset-2 border border-amber-300/50 rounded-lg" />
      
      {/* Card content */}
      <div className="relative h-full flex flex-col p-3">
        {/* Top: Card number/symbol */}
        <div className="flex justify-between items-start">
          <span className={`${fonts.subtitle} text-amber-700 font-serif`}>
            {card.position + 1}
          </span>
          {isReversed && (
            <span className={`${fonts.subtitle} text-red-500 font-bold`}>↻</span>
          )}
        </div>

        {/* Center: Card illustration placeholder */}
        <div className="flex-1 flex items-center justify-center my-2">
          <div className="relative">
            {/* Decorative circle */}
            <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-purple-200/50 to-amber-200/50 blur-sm" />
            
            {/* Card symbol (placeholder - would be actual image) */}
            <span className={`relative ${fonts.icon} block`}>
              {getCardEmoji(card.card_id)}
            </span>
          </div>
        </div>

        {/* Bottom: Card name */}
        <div className="text-center">
          <h3 className={`${fonts.title} font-bold text-purple-900 leading-tight`}>
            {card.card_name_th}
          </h3>
          <p className={`${fonts.subtitle} text-purple-600/70 mt-0.5`}>
            {card.card_name}
          </p>
        </div>

        {/* Position label */}
        <div className={`mt-2 text-center ${fonts.subtitle} text-amber-700 font-medium`}>
          {card.position_name_th}
        </div>
      </div>

      {/* Reversed indicator overlay */}
      {isReversed && (
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
      )}
    </div>
  );
};

// Get emoji representation for each card (placeholder for actual images)
function getCardEmoji(cardId: string): string {
  const emojiMap: Record<string, string> = {
    the_fool: "🃏",
    the_magician: "🎩",
    the_high_priestess: "🌙",
    the_empress: "👑",
    the_emperor: "⚜️",
    the_hierophant: "📿",
    the_lovers: "💕",
    the_chariot: "🛡️",
    strength: "🦁",
    the_hermit: "🕯️",
    wheel_of_fortune: "☸️",
    justice: "⚖️",
    the_hanged_man: "🙃",
    death: "💀",
    temperance: "🏺",
    the_devil: "😈",
    the_tower: "⚡",
    the_star: "⭐",
    the_moon: "🌙",
    the_sun: "☀️",
    judgement: "🎺",
    the_world: "🌍",
  };
  
  return emojiMap[cardId] || "🎴";
}

export default function TarotCard({
  card,
  index,
  delay = 0,
  onFlip,
  isRevealed = false,
  size = "md",
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(isRevealed);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      onFlip?.();
    }
  };

  const sizeClasses = {
    sm: "w-32 h-44",
    md: "w-44 h-60",
    lg: "w-56 h-80",
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} cursor-pointer`}
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15 + delay,
        ease: "easeOut",
      }}
      onClick={handleFlip}
      whileHover={!isFlipped ? { scale: 1.05 } : {}}
      whileTap={!isFlipped ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {/* Card back (face down) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <CardBack />
        </div>

        {/* Card front (face up) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardFront card={card} size={size} />
        </div>
      </motion.div>

      {/* Flip hint */}
      {!isFlipped && (
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <span className="text-sm text-purple-300">คลิกเพื่อเปิดไพ่</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Card Detail Panel Component
interface CardDetailPanelProps {
  card: DrawnCard;
  isVisible: boolean;
}

export function CardDetailPanel({ card, isVisible }: CardDetailPanelProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="mt-6 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-purple-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">
            {card.card_name_th}
          </h3>
          <p className="text-purple-300 text-sm mb-2">
            {card.card_name} • {card.position_name_th}
            {card.orientation === "reversed" && (
              <span className="ml-2 text-red-400">(กลับหัว)</span>
            )}
          </p>
          
          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mb-4">
            {card.keywords_th.map((keyword, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>

          {/* Meaning */}
          <p className="text-purple-100 leading-relaxed">
            {card.meaning_th}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
