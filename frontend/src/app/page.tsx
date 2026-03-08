/**
 * Main Page - Ask The Tarot
 * US-001: Question Input with AI Gatekeeper
 */

import QuestionInput from "@/components/QuestionInput";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <QuestionInput />
      </div>
    </main>
  );
}
