'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReadingResult } from '@/components/ReadingResult';
import { SelectedCard } from '@/lib/types';
import { motion } from 'framer-motion';

// Demo data for testing - in production, this comes from API/localStorage
const DEMO_CARDS: SelectedCard[] = [
  {
    id: "6",
    name: "The Lovers",
    nameTh: "เดอะเลิฟเวอร์ส",
    number: 6,
    arcana: "major",
    imageUrl: "/cards/6.jpg",
    meaningUpright: "ความรัก ความสัมพันธ์ การเลือก",
    meaningReversed: "การเลือกที่ผิด ความสับสน",
    keywords: ["ความรัก", "ความสัมพันธ์", "การเลือก"],
    position: 0,
    isReversed: false,
    selectedAt: Date.now(),
  },
  {
    id: "10",
    name: "Wheel of Fortune",
    nameTh: "วีลออฟฟอร์จูน",
    number: 10,
    arcana: "major",
    imageUrl: "/cards/10.jpg",
    meaningUpright: "การเปลี่ยนแปลง โชคชะตา วัฏจักร",
    meaningReversed: "การต่อต้านการเปลี่ยนแปลง โชคร้าย",
    keywords: ["โชคชะตา", "การเปลี่ยนแปลง", "วัฏจักร"],
    position: 1,
    isReversed: false,
    selectedAt: Date.now(),
  },
  {
    id: "17",
    name: "The Star",
    nameTh: "เดอะสตาร์",
    number: 17,
    arcana: "major",
    imageUrl: "/cards/17.jpg",
    meaningUpright: "ความหวัง แรงบันดาลใจ การฟื้นฟู",
    meaningReversed: "สิ้นหวัง ขาดความเชื่อมั่น",
    keywords: ["ความหวัง", "แรงบันดาลใจ", "ความสงบ"],
    position: 2,
    isReversed: true,
    selectedAt: Date.now(),
  },
];

const DEMO_POSITIONS = ["สถานการณ์ปัจจุบัน", "อุปสรรค/โอกาส", "ผลลัพธ์ที่เป็นไปได้"];

interface ReadingData {
  sessionId: string;
  readingId: string;
  question: string;
  cards: SelectedCard[];
  positions: string[];
  interpretation: string;
  followUpCount: number;
  maxFollowUps: number;
  createdAt: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for reading data in localStorage or URL params
    const loadReading = () => {
      try {
        // In a real app, this would fetch from API using the reading ID
        // For demo, we'll use demo data or stored data
        const stored = localStorage.getItem('tarot_current_reading');
        
        if (stored) {
          const parsed = JSON.parse(stored);
          setReading({
            sessionId: parsed.session_id || 'demo_session',
            readingId: parsed.reading_id || 'demo_reading',
            question: parsed.question || 'เรื่องความรักของฉันจะเป็นอย่างไร?',
            cards: parsed.cards?.map((c: { card_id?: string; card_name?: string; card_name_th?: string; image_url?: string }, i: number) => ({
              ...DEMO_CARDS[i],
              id: c.card_id || DEMO_CARDS[i].id,
              name: c.card_name || DEMO_CARDS[i].name,
              nameTh: c.card_name_th || DEMO_CARDS[i].nameTh,
              imageUrl: c.image_url || DEMO_CARDS[i].imageUrl,
              position: i,
              isReversed: Math.random() < 0.3,
              selectedAt: Date.now(),
            })) || DEMO_CARDS,
            positions: parsed.spread?.positions_th || DEMO_POSITIONS,
            interpretation: parsed.interpretation || generateDemoInterpretation(),
            followUpCount: parsed.follow_up_count || 0,
            maxFollowUps: 3,
            createdAt: parsed.created_at || new Date().toISOString(),
          });
        } else {
          // Use demo data if no stored reading
          setReading({
            sessionId: 'demo_session_001',
            readingId: 'demo_reading_001',
            question: 'เรื่องความรักของฉันจะเป็นอย่างไร?',
            cards: DEMO_CARDS,
            positions: DEMO_POSITIONS,
            interpretation: generateDemoInterpretation(),
            followUpCount: 0,
            maxFollowUps: 3,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error loading reading:', err);
        setError('ไม่พบข้อมูลการอ่านไพ่');
      } finally {
        setIsLoading(false);
      }
    };

    loadReading();
  }, []);

  const handleNewReading = () => {
    // Clear stored reading and navigate home
    localStorage.removeItem('tarot_current_reading');
    localStorage.removeItem('tarot_session_id');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-amber-500/20 animate-pulse">
            <span className="text-3xl">✦</span>
          </div>
          <p className="text-amber-300">กำลังโหลดผลการอ่านไพ่...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-500/20">
            <span className="text-3xl">✦</span>
          </div>
          <p className="text-red-300 mb-4">{error || 'ไม่พบข้อมูลการอ่านไพ่'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-500 text-indigo-950 rounded-lg font-medium hover:bg-amber-400 transition-colors"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReadingResult
      sessionId={reading.sessionId}
      readingId={reading.readingId}
      question={reading.question}
      cards={reading.cards}
      positions={reading.positions}
      interpretation={reading.interpretation}
      followUpCount={reading.followUpCount}
      maxFollowUps={reading.maxFollowUps}
      createdAt={reading.createdAt}
      onNewReading={handleNewReading}
    />
  );
}

// Generate a demo interpretation
function generateDemoInterpretation(): string {
  return `จากไพ่ทั้งสามใบที่เปิดขึ้นมา แสดงให้เห็นภาพรวมที่น่าสนใจเกี่ยวกับเรื่องความรักของคุณ

**สถานการณ์ปัจจุบัน (The Lovers):**
คุณกำลังอยู่ในช่วงเวลาที่มีความสัมพันธ์ที่ดี หรือกำลังเผชิญกับการตัดสินใจที่สำคัญเกี่ยวกับความรัก ไพ่ใบนี้บ่งบอกถึงความสัมพันธ์ที่มีความหมายลึกซึ้ง ความเข้ากันได้ และการเลือกที่ถูกต้อง

**อุปสรรค/โอกาส (Wheel of Fortune):**
จะมีการเปลี่ยนแปลงเกิดขึ้นในเร็ววันนี้ โชคชะตากำลังหมุนเวียนและนำพาโอกาสใหม่ๆ เข้ามา ไม่ว่าจะเป็นการพบรักครั้งใหม่ หรือการพัฒนาความสัมพันธ์ที่มีอยู่

**ผลลัพธ์ (The Star - กลับหัว):**
แม้ว่าจะมีความท้าทายและอาจรู้สึกสิ้นหวังในบางช่วง แต่สุดท้ายแล้วความหวังจะนำพาคุณไปสู่จุดหมาย อย่าลืมรักษาความเชื่อมั่นและความหวังไว้

**คำแนะนำ:**
ช่วงนี้เหมาะกับการเปิดใจรับโอกาสใหม่ๆ แต่ก็ต้องระวังการตัดสินใจที่เร่งรีบเกินไป`;
}
