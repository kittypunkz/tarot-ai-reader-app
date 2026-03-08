/**
 * Question Input Component (US-001)
 * Main input screen for tarot questions with AI Gatekeeper integration
 * Updated for US-002: Navigate to card selection on approval
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle, HelpCircle, X } from "lucide-react";
import { validateQuestion, ValidationResult, type SpreadType } from "@/lib/api";

export default function QuestionInput() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await validateQuestion(question);
      setResult(response);
      
      if (response.status === "approved") {
        // Navigate to card selection after a brief delay
        setTimeout(() => {
          // Determine spread type based on question type
          let spreadType: SpreadType = "single";
          if (response.question_type === "open_ended" || response.question_type === "advice") {
            // Randomly choose between three_ppf and three_mpc
            spreadType = Math.random() > 0.5 ? "three_ppf" : "three_mpc";
          }
          
          const params = new URLSearchParams({
            q: encodeURIComponent(question.trim()),
            spread: spreadType,
            type: response.question_type || "general",
          });
          
          router.push(`/select?${params.toString()}`);
        }, 1500); // Show success message for 1.5 seconds before navigating
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [question, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleClear = useCallback(() => {
    setQuestion("");
    setResult(null);
    setError(null);
  }, []);

  const getStatusIcon = () => {
    if (!result) return null;
    
    switch (result.status) {
      case "approved":
        return <Sparkles className="w-5 h-5 text-green-400" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "clarification_needed":
        return <HelpCircle className="w-5 h-5 text-amber-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    if (!result) return "border-purple-500/30";
    
    switch (result.status) {
      case "approved":
        return "border-green-500/50 focus:border-green-400";
      case "rejected":
        return "border-red-500/50 focus:border-red-400";
      case "clarification_needed":
        return "border-amber-500/50 focus:border-amber-400";
      default:
        return "border-purple-500/30";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          ถามแม่หมอ
        </h1>
        <p className="text-lg text-purple-200/80 max-w-md mx-auto">
          ให้ไพ่ทาโรต์ช่วยแนะนำทางเลือกและคำตอบสำหรับคำถามของคุณ
        </p>
      </div>

      {/* Input Container */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="relative">
          {/* Text Area */}
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ถามคำถามที่คุณสงสัย... เช่น &quot;ควรเปลี่ยนงานดีไหม?&quot;"
              disabled={isLoading}
              maxLength={500}
              className={`
                w-full min-h-[160px] p-6 pr-14
                bg-white/5 backdrop-blur-sm
                border-2 rounded-2xl
                text-white text-lg placeholder-purple-300/50
                focus:outline-none focus:ring-4 focus:ring-purple-500/20
                transition-all duration-300 resize-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${getStatusColor()}
              `}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-4 right-4 text-sm text-purple-300/60">
              {question.length}/500
            </div>
            
            {/* Clear Button */}
            {question && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-purple-300/60" />
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`
              w-full mt-4 py-4 px-8
              bg-gradient-to-r from-amber-400 to-orange-500
              hover:from-amber-300 hover:to-orange-400
              disabled:from-gray-600 disabled:to-gray-700
              disabled:cursor-not-allowed
              text-white font-semibold text-lg
              rounded-xl shadow-lg shadow-orange-500/25
              transform transition-all duration-200
              hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-3
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังตรวจสอบคำถาม...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>ถามแม่หมอ</span>
              </>
            )}
          </button>
        </form>

        {/* Result Messages */}
        {result && (
          <div className={`
            mt-6 p-5 rounded-xl border backdrop-blur-sm
            animate-in fade-in slide-in-from-top-2 duration-300
            ${result.status === "approved" 
              ? "bg-green-500/10 border-green-500/30" 
              : result.status === "rejected"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-amber-500/10 border-amber-500/30"
            }
          `}>
            <div className="flex items-start gap-3">
              {getStatusIcon()}
              <div className="flex-1">
                <h3 className={`
                  font-semibold mb-1
                  ${result.status === "approved" 
                    ? "text-green-300" 
                    : result.status === "rejected"
                    ? "text-red-300"
                    : "text-amber-300"
                  }
                `}>
                  {result.status === "approved" 
                    ? "คำถามผ่านการตรวจสอบ" 
                    : result.status === "rejected"
                    ? "คำถามไม่เหมาะสม"
                    : "กรุณาแก้ไขคำถาม"
                  }
                </h3>
                <p className="text-white/80">{result.message}</p>
                {result.suggestion && (
                  <p className="text-white/60 text-sm mt-2">{result.suggestion}</p>
                )}
                {result.examples && result.examples.length > 0 && (
                  <div className="mt-3">
                    <p className="text-white/60 text-sm mb-2">ตัวอย่างคำถาม:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.examples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuestion(example)}
                          className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white/80 rounded-lg transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Navigation hint for approved */}
                {result.status === "approved" && (
                  <p className="text-green-400/80 text-sm mt-3 animate-pulse">
                    กำลังพาไปหน้าเปิดไพ่...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-5 rounded-xl bg-red-500/10 border border-red-500/30 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-purple-300/60 text-sm">
            💡 คำถามที่ดีควรเฉพาะเจาะจง เช่น &quot;ควรเปลี่ยนงานดีไหม?&quot; หรือ &quot;ความสัมพันธ์นี้จะเป็นอย่างไร?&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
