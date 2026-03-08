/**
 * Card Selection Page
 * US-002: Intelligent Spread Selection with Enhanced Carousel
 */

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";
import { EnhancedCardSelection } from "@/components/EnhancedCardSelection";
import { SelectedCard } from "@/lib/types";
import { drawCards, storeReading, SpreadType } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

function SelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const question = decodeURIComponent(searchParams.get("q") || "");
  const spreadType = (searchParams.get("spread") || "single") as SpreadType;
  const questionType = searchParams.get("type") || "general";
  
  const handleComplete = useCallback(async (selectedCards: SelectedCard[]) => {
    if (!question) return;
    
    try {
      // Draw cards via API
      const reading = await drawCards(question, spreadType, "th");
      
      // Store reading in localStorage for result page
      storeReading(reading);
      
      // Navigate to result page
      router.push(`/result?reading_id=${reading.reading_id}`);
    } catch (error) {
      console.error("Failed to draw cards:", error);
      alert("เกิดข้อผิดพลาดในการเปิดไพ่ กรุณาลองใหม่อีกครั้ง");
    }
  }, [question, spreadType, router]);
  
  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);
  
  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-200/60 mb-4">ไม่พบคำถาม</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-amber-500 text-indigo-950 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-amber-200/70 hover:text-amber-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>กลับ</span>
        </button>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-amber-100">
            เลือกไพ่ของคุณ
          </h1>
          <p className="text-sm text-amber-200/60 truncate max-w-md mx-auto">
            {question}
          </p>
        </div>
        
        <div className="w-20" /> {/* Spacer for centering */}
      </header>
      
      {/* Card Selection Component */}
      <EnhancedCardSelection
        question={question}
        initialSpreadType={spreadType}
      />
    </div>
  );
}

// Loading fallback
function SelectionLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-amber-200/60">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>กำลังโหลด...</span>
      </div>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={<SelectionLoading />}>
      <SelectionContent />
    </Suspense>
  );
}
