/**
 * Infinity Carousel Component
 * US-002: Intelligent Spread Selection
 * Displays an infinite scrolling carousel of tarot cards with 3D effect
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimationControls } from "framer-motion";

interface InfinityCarouselProps {
  cardCount: number; // Number of cards that will be drawn
  onComplete: () => void; // Called when animation completes
  duration?: number; // Animation duration in seconds
  isShuffling: boolean; // Whether currently shuffling
}

// Card back pattern for the carousel
const CardBack = () => (
  <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 border-2 border-amber-500/50 shadow-2xl overflow-hidden relative">
    {/* Pattern */}
    <div className="absolute inset-0 opacity-30">
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <defs>
          <pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="currentColor" className="text-amber-400" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)" />
      </svg>
    </div>
    
    {/* Center decoration */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-24 h-36 rounded-lg border border-amber-500/30 flex items-center justify-center">
        <div className="w-16 h-24 rounded border border-amber-500/50 flex items-center justify-center">
          <span className="text-4xl">✦</span>
        </div>
      </div>
    </div>
    
    {/* Corner decorations */}
    <div className="absolute top-3 left-3 text-amber-500/60 text-xs">✦</div>
    <div className="absolute top-3 right-3 text-amber-500/60 text-xs">✦</div>
    <div className="absolute bottom-3 left-3 text-amber-500/60 text-xs">✦</div>
    <div className="absolute bottom-3 right-3 text-amber-500/60 text-xs">✦</div>
  </div>
);

export default function InfinityCarousel({
  cardCount,
  onComplete,
  duration = 4,
  isShuffling,
}: InfinityCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const controls = useAnimationControls();
  const [hasCompleted, setHasCompleted] = useState(false);

  // Calculate card dimensions
  const cardWidth = 140;
  const cardHeight = 200;
  const cardGap = 20;
  const totalCardWidth = cardWidth + cardGap;

  // Create array of cards for the carousel (need enough for seamless loop)
  const displayCards = Array(20).fill(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (isShuffling && !hasCompleted) {
      // Start the infinite scroll animation
      const animate = async () => {
        // Initial acceleration
        await controls.start({
          x: -totalCardWidth * 10,
          transition: {
            duration: duration * 0.7,
            ease: [0.25, 0.46, 0.45, 0.94], // Ease out
          },
        });

        // Slow down and stop
        await controls.start({
          x: -totalCardWidth * 12,
          transition: {
            duration: duration * 0.3,
            ease: "easeOut",
          },
        });

        setHasCompleted(true);
        onComplete();
      };

      animate();
    }
  }, [isShuffling, hasCompleted, controls, duration, totalCardWidth, onComplete]);

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Gradient overlays for depth effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-purple-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-950 to-transparent z-10 pointer-events-none" />

      {/* Carousel container */}
      <div
        ref={containerRef}
        className="relative h-[240px] flex items-center justify-center overflow-hidden"
      >
        <motion.div
          className="flex gap-5 absolute"
          animate={controls}
          initial={{ x: 0 }}
          style={{
            perspective: "1000px",
          }}
        >
          {displayCards.map((_, index) => (
            <motion.div
              key={index}
              className="relative flex-shrink-0"
              style={{
                width: cardWidth,
                height: cardHeight,
              }}
              initial={false}
              animate={{
                rotateY: hasCompleted ? 180 : 0,
                scale: hasCompleted && index === 12 ? 1.1 : 1,
              }}
              transition={{
                rotateY: {
                  duration: 0.6,
                  delay: hasCompleted ? index * 0.1 : 0,
                },
                scale: {
                  duration: 0.3,
                  delay: hasCompleted ? 0.5 : 0,
                },
              }}
            >
              {/* Card front (back of tarot card) */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                <CardBack />
              </div>

              {/* Card back (will be revealed) */}
              <div
                className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-400 shadow-xl flex items-center justify-center"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span className="text-amber-800 text-6xl">🌟</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Status text */}
      <div className="text-center mt-6">
        <motion.p
          className="text-purple-200 text-lg"
          animate={{
            opacity: isShuffling ? [0.5, 1, 0.5] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isShuffling ? Infinity : 0,
          }}
        >
          {isShuffling && !hasCompleted
            ? "แม่หมอกำลังสับไพ่..."
            : hasCompleted
            ? "ไพ่ถูกเลือกแล้ว!"
            : "พร้อมเปิดไพ่"}
        </motion.p>
      </div>
    </div>
  );
}
