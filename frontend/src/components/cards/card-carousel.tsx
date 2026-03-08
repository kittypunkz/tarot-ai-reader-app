'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TarotCard, SelectedCard } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CardCarouselProps {
  cards: TarotCard[];
  selectedCards: SelectedCard[];
  maxSelection: number;
  onCardSelect: (card: TarotCard) => void;
  onCardDeselect?: (cardId: string) => void;
  className?: string;
}

export function CardCarousel({
  cards,
  selectedCards,
  maxSelection,
  onCardSelect,
  onCardDeselect,
  className,
}: CardCarouselProps) {
  const [windowWidth, setWindowWidth] = useState(0);
  
  // CONTINUOUS DRAG STATE - Not locked to positions
  const [offset, setOffset] = useState(0); // Current pixel offset
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track window size
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive sizing
  const getCardDimensions = () => {
    if (windowWidth < 640) {
      return { width: 85, height: 140, gap: 10 };
    } else if (windowWidth < 1024) {
      return { width: 110, height: 180, gap: 14 };
    } else {
      return { width: 130, height: 215, gap: 18 };
    }
  };

  const { width: CARD_WIDTH, height: CARD_HEIGHT, gap: CARD_GAP } = getCardDimensions();
  const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;
  const TOTAL_WIDTH = cards.length * ITEM_WIDTH;

  // Normalize offset to create infinite loop
  const normalizeOffset = (value: number) => {
    // Wrap around for infinite effect
    let normalized = value % TOTAL_WIDTH;
    if (normalized > 0) normalized -= TOTAL_WIDTH;
    return normalized;
  };

  // Get current "virtual" index based on offset
  const getCurrentIndex = () => {
    const index = Math.round(Math.abs(offset) / ITEM_WIDTH) % cards.length;
    return index;
  };

  // Check if card is selected
  const isCardSelected = useCallback((cardId: string) => {
    return selectedCards.some(sc => sc.id === cardId);
  }, [selectedCards]);

  const canSelectMore = selectedCards.length < maxSelection;

  // Handle card click - SELECT or DESELECT
  const handleCardClick = useCallback((card: TarotCard) => {
    if (hasDragged) return;
    
    // If already selected, deselect it
    if (isCardSelected(card.id)) {
      onCardDeselect?.(card.id);
      return;
    }
    
    // If not selected and can select more, select it
    if (!canSelectMore) return;
    onCardSelect(card);
  }, [hasDragged, isCardSelected, canSelectMore, onCardSelect, onCardDeselect]);

  // Momentum animation
  useEffect(() => {
    if (isDragging || Math.abs(velocity) < 0.5) return;

    const animate = () => {
      setOffset(prev => {
        const newOffset = prev + velocity;
        setVelocity(v => v * 0.95); // Friction
        return normalizeOffset(newOffset);
      });
      
      if (Math.abs(velocity) > 0.5) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDragging, velocity, TOTAL_WIDTH]);

  // ========== DRAG HANDLERS ==========
  
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setHasDragged(false);
    setDragStartX(clientX);
    setDragStartOffset(offset);
    setVelocity(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - dragStartX;
    
    if (Math.abs(diff) > 5) {
      setHasDragged(true);
    }
    
    // Direct 1:1 tracking - move carousel with finger/mouse
    setOffset(normalizeOffset(dragStartOffset + diff));
    
    // Calculate velocity for momentum
    const newVelocity = (clientX - dragStartX) * 0.1;
    setVelocity(newVelocity);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Velocity will trigger momentum animation in useEffect
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => isDragging && handleDragEnd();

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  // Navigate buttons
  const goNext = () => {
    setOffset(prev => normalizeOffset(prev - ITEM_WIDTH));
  };

  const goPrev = () => {
    setOffset(prev => normalizeOffset(prev + ITEM_WIDTH));
  };

  // Get cards to render (duplicate for infinite effect)
  const getRenderCards = () => {
    // Render cards multiple times for seamless infinite scroll
    const result = [];
    const repetitions = 3; // Render 3 sets for seamless loop
    
    for (let r = 0; r < repetitions; r++) {
      cards.forEach((card, index) => {
        result.push({
          card,
          globalIndex: r * cards.length + index,
          actualIndex: index,
        });
      });
    }
    return result;
  };

  const renderCards = getRenderCards();

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="text-center mb-4 px-4">
        <p className="text-amber-200/70 text-sm">
          {isDragging ? 'กำลังเลือน...' : 'ลากเพื่อหมุนไพ่ • คลิกไพ่เพื่อเลือก'}
        </p>
        <p className="text-amber-400 text-base sm:text-lg font-medium mt-1">
          {selectedCards.length} / {maxSelection} ใบที่เลือก
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-indigo-900/80 border border-amber-600/50 text-amber-400 hover:bg-amber-500 hover:text-indigo-950 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={goNext}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-indigo-900/80 border border-amber-600/50 text-amber-400 hover:bg-amber-500 hover:text-indigo-950 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Cards Container - INFINITE WHEEL */}
        <div 
          ref={containerRef}
          className="overflow-hidden py-6 select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Cards Track - Moves continuously */}
          <div 
            className="flex"
            style={{
              transform: `translateX(${offset}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s linear'
            }}
          >
            {renderCards.map(({ card, globalIndex, actualIndex }) => {
              const isSelected = isCardSelected(card.id);
              const isDisabled = !canSelectMore && !isSelected;

              return (
                <div
                  key={`${card.id}-${globalIndex}`}
                  onClick={() => !hasDragged && handleCardClick(card)}
                  className={cn(
                    "relative shrink-0",
                    isSelected && "z-10"
                  )}
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    marginRight: CARD_GAP,
                  }}
                >
                  {/* Card */}
                  <div className={cn(
                    "w-full h-full rounded-lg overflow-hidden",
                    "bg-gradient-to-br from-indigo-900 to-purple-900",
                    "border-2 flex items-center justify-center relative transition-all",
                    isSelected 
                      ? "border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] cursor-pointer hover:shadow-[0_0_35px_rgba(251,191,36,0.8)]" 
                      : "border-amber-600/50 hover:border-amber-500/70"
                  )}>
                    {/* Pattern */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `radial-gradient(circle at center, rgba(251,191,36,0.3) 1px, transparent 1px)`,
                        backgroundSize: '10px 10px'
                      }}
                    />
                    
                    {/* Center Circle */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-500/50 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-amber-400/30" />
                    </div>

                    {/* Selected Badge - Shows it's selected and clickable to deselect */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-indigo-950 rounded-full p-1 shadow-lg animate-pulse">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      </div>
                    )}

                    {/* Card Number */}
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-xs text-amber-500/70 font-medium">{actualIndex + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 px-4 flex-wrap max-w-md mx-auto">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const currentIdx = getCurrentIndex();
                const diff = i - currentIdx;
                setOffset(prev => normalizeOffset(prev - (diff * ITEM_WIDTH)));
              }}
              className={cn(
                "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                i === getCurrentIndex() 
                  ? "bg-amber-400 w-4 sm:w-5" 
                  : "bg-indigo-700 w-1.5 sm:w-2 hover:bg-indigo-600"
              )}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-amber-200/50 text-xs mt-2">
        คลิกไพ่เพื่อเลือก • คลิกอีกครั้งเพื่อยกเลิก • ไพ่ที่เลือกจะมีดาว ⭐
      </p>
    </div>
  );
}
