'use client';

import { SelectedCard } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CardDisplayProps {
  card: SelectedCard;
  position?: string;
  showMeaning?: boolean;
  className?: string;
}

export function CardDisplay({ 
  card, 
  position, 
  showMeaning = true,
  className 
}: CardDisplayProps) {
  return (
    <div className={cn(
      "flex flex-col items-center",
      className
    )}>
      {/* Card */}
      <div className={cn(
        "relative w-32 h-48 sm:w-40 sm:h-60 rounded-xl overflow-hidden",
        "bg-gradient-to-br from-indigo-900 to-purple-900",
        "border-2 shadow-lg",
        card.isReversed ? "border-red-500/50" : "border-amber-500/50"
      )}>
        {/* Card Number Badge */}
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
          <span className="text-amber-400 text-sm font-bold">{card.number}</span>
        </div>
        
        {/* Orientation Badge */}
        {card.isReversed && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-red-500/20 border border-red-500/50">
            <span className="text-red-400 text-xs font-medium">กลับหัว ↻</span>
          </div>
        )}
        
        {/* Card Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {/* Card Icon/Symbol */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-3">
            <span className="text-3xl sm:text-4xl font-bold text-amber-400/60">
              {card.number}
            </span>
          </div>
          
          {/* Card Name */}
          <h3 className="text-amber-100 text-sm sm:text-base font-semibold text-center leading-tight">
            {card.nameTh}
          </h3>
          <p className="text-amber-200/50 text-xs text-center mt-1">
            {card.name}
          </p>
        </div>
        
        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-indigo-950/90 to-transparent">
          <p className="text-amber-400/70 text-[10px] text-center uppercase tracking-wider">
            Major Arcana
          </p>
        </div>
      </div>
      
      {/* Position Label */}
      {position && (
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            {position}
          </span>
        </div>
      )}
      
      {/* Meaning */}
      {showMeaning && (
        <div className="mt-3 max-w-[200px] text-center">
          <p className="text-amber-100/80 text-sm leading-relaxed">
            {card.isReversed ? card.meaningReversed : card.meaningUpright}
          </p>
        </div>
      )}
      
      {/* Keywords */}
      {card.keywords && card.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {card.keywords.slice(0, 3).map((keyword, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 rounded bg-indigo-800/50 text-indigo-300 text-[10px]"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Grid display for multiple cards
interface CardGridProps {
  cards: SelectedCard[];
  positions?: string[];
  className?: string;
}

export function CardGrid({ cards, positions, className }: CardGridProps) {
  if (!cards || cards.length === 0) return null;
  
  // Determine grid columns based on card count
  let gridCols = "grid-cols-1 justify-items-center";
  if (cards.length === 2) {
    gridCols = "grid-cols-2";
  } else if (cards.length === 3) {
    gridCols = "grid-cols-3";
  } else if (cards.length >= 4) {
    gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  }
  
  return (
    <div className={cn("grid gap-6", gridCols, className)}>
      {cards.map((card, index) => (
        <CardDisplay
          key={card.id}
          card={card}
          position={positions?.[index]}
        />
      ))}
    </div>
  );
}
