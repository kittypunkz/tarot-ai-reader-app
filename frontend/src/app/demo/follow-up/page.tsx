'use client';

import { useState } from 'react';
import { ReadingActions, ActionType } from '@/components/ReadingActions';
import { FollowUpInput } from '@/components/FollowUpInput';
import { SessionTimer } from '@/components/SessionTimer';
import { MiniCardPreview } from '@/components/MiniCardPreview';
import { useFollowUpStatus } from '@/hooks/useFollowUp';
import { SelectedCard } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

// Demo data - in real app, this comes from the reading result
const demoCards: SelectedCard[] = [
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

const demoPositions = ["สถานการณ์ปัจจุบัน", "อุปสรรค/โอกาส", "ผลลัพธ์ที่เป็นไปได้"];
const demoSessionId = "demo_session_001";
const demoCreatedAt = new Date().toISOString();

export default function FollowUpDemoPage() {
  const [mode, setMode] = useState<'actions' | 'follow-up'>('actions');
  const [followUpCount, setFollowUpCount] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check follow-up status
  const { canFollowUp, remainingFollowUps } = useFollowUpStatus(
    demoSessionId,
    followUpCount,
    3, // max 3 follow-ups
    demoCreatedAt
  );

  // Handle action button clicks
  const handleAction = (action: ActionType) => {
    switch (action) {
      case 'follow-up':
        setMode('follow-up');
        break;
      case 'new-reading':
        // Navigate to new reading - reload or router.push
        window.location.href = '/question';
        break;
      case 'end-session':
        // Navigate home
        window.location.href = '/';
        break;
    }
  };

  // Handle follow-up submission
  const handleFollowUpSubmit = async (question: string) => {
    // In real app: call API
    console.log('Follow-up question:', question);
    
    // Simulate success
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFollowUpCount(prev => prev + 1);
    setMode('actions');
    
    // Show success message (in real app)
    alert('ได้รับคำตอบสำหรับ: ' + question);
  };

  const handleSessionExpired = () => {
    setSessionExpired(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 transition-colors"
          >
            ← กลับหน้าแรก
          </Link>
          <h1 className="text-xl font-bold text-amber-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            US-003 Demo
          </h1>
        </div>

        {/* Session Timer */}
        <div className="flex justify-center mb-6">
          <SessionTimer
            sessionId={demoSessionId}
            createdAt={demoCreatedAt}
            expirationMinutes={30}
            onExpired={handleSessionExpired}
          />
        </div>

        {/* Main Content */}
        {mode === 'actions' ? (
          <div className="space-y-8">
            {/* Reading Result Preview */}
            <div className="p-6 bg-indigo-900/30 rounded-2xl border border-amber-600/20">
              <h2 className="text-lg font-semibold text-amber-100 mb-4 text-center">
                ผลการอ่านไพ่
              </h2>
              <MiniCardPreview
                cards={demoCards}
                positions={demoPositions}
              />
              <div className="mt-4 p-4 bg-indigo-950/50 rounded-xl">
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  จากไพ่ทั้งสามใบ แสดงให้เห็นว่าคุณกำลังอยู่ในช่วงเวลาที่มีความสัมพันธ์ที่ดี (The Lovers) 
                  แต่จะมีการเปลี่ยนแปลงเกิดขึ้นในเร็ววัน (Wheel of Fortune) 
                  ซึ่งแม้ว่าจะมีความท้าทาย แต่สุดท้ายแล้วความหวังจะนำพาคุณไปสู่จุดหมาย (The Star)
                </p>
              </div>
            </div>

            {/* Reading Actions */}
            <div className="text-center">
              <p className="text-amber-200/60 text-sm mb-4">
                ต้องการถามต่อหรือไม่?
              </p>
              <ReadingActions
                remainingFollowUps={remainingFollowUps}
                maxFollowUps={3}
                onAction={handleAction}
                isExpired={sessionExpired}
              />
            </div>
          </div>
        ) : (
          /* Follow-up Input Mode */
          <FollowUpInput
            previousCards={demoCards}
            positions={demoPositions}
            followUpCount={followUpCount}
            maxFollowUps={3}
            onSubmit={handleFollowUpSubmit}
            onBack={() => setMode('actions')}
          />
        )}

        {/* Debug Info */}
        <div className="mt-12 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 font-mono mb-2">Debug Info:</p>
          <pre className="text-xs text-slate-600 font-mono overflow-x-auto">
            {JSON.stringify({
              mode,
              followUpCount,
              remainingFollowUps,
              canFollowUp,
              sessionExpired,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
