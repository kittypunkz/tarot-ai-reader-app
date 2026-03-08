'use client';

import { SelectedCard } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MiniCardPreviewProps {
  cards: SelectedCard[];
  positions?: string[];
  className?: string;
}

export function MiniCardPreview({
  cards,
  positions,
  className,
}: MiniCardPreviewProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <p className="text-amber-200/70 text-sm mb-3 text-center">
        ไพ่ที่เปิดไปแล้ว
      </p>
      
      <div className="flex justify-center gap-3">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="relative flex flex-col items-center"
          >
            {/* Mini Card */}
            <div
              className={cn(
                "w-16 h-24 sm:w-20 sm:h-32 rounded-lg overflow-hidden",
                "bg-gradient-to-br from-indigo-900 to-purple-900",
                "border-2 border-amber-500/50",
                "flex items-center justify-center"
              )}
            >
              {/* Card Number */}
              <span className="text-xl sm:text-2xl font-bold text-amber-500/40">
                {card.number}
              </span>
              
              {/* Orientation Indicator */}
              {card.isReversed && (
                <div className="absolute bottom-1 right-1">
                  <span className="text-[8px] text-amber-400/70">↻</span>
                </div>
              )}
            </div>
            
            {/* Position Label */}
            {positions && positions[index] && (
              <span className="text-[10px] text-amber-300/60 mt-1 text-center leading-tight">
                {positions[index]}
              </span>
            )}
            
            {/* Card Name (truncated) */}
            <span className="text-[9px] text-amber-200/50 mt-0.5 text-center max-w-[60px] truncate">
              {card.nameTh}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
