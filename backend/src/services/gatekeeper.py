"""
AI Gatekeeper Service
Validates user questions for appropriateness and quality
US-001: Content Filtering - AI-First with Smart Rules
Uses FREE Google models via OpenRouter
"""

import os
import re
import json
from typing import Optional
from datetime import datetime
import httpx

from src.models.schemas import (
    ValidateQuestionResponse,
    ValidationStatus,
    RejectionReason,
    QuestionCategory,
    QuestionType
)
from src.database.database import get_db
from src.database.models import QuestionValidation


class GatekeeperService:
    """AI Gatekeeper using FREE Google models via OpenRouter"""
    
    # ULTRA-fast path: Only extreme cases (saves API costs)
    # These are rejected immediately without AI call
    ULTRA_REJECT_PATTERNS = [
        # Only extreme violence/illegal content
        r'^(ฆ่า|kill|murder)\s+(ตัว|คน|someone|people)',
        r'^(วิธี|how)\s+(ทำ|make)\s*(ระเบิด|bomb)',
    ]
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        # Use FREE Google model
        self.model = os.getenv("OPENROUTER_MODEL", "google/gemma-2-9b-it:free")
        
    async def validate_question(
        self,
        question: str,
        language: str = "th",
        session_id: Optional[str] = None
    ) -> ValidateQuestionResponse:
        """
        Validate a question through AI Gatekeeper
        Strategy: Ultra-fast filter → AI validation for everything else
        """
        # Step 1: Ultra-fast path - only extreme cases
        for pattern in self.ULTRA_REJECT_PATTERNS:
            if re.search(pattern, question, re.IGNORECASE):
                result = self._create_rejected_response(
                    language,
                    "คำถามนี้ไม่เหมาะสมสำหรับการดูดวง",
                    "ลองถามคำถามเกี่ยวกับชีวิต ความรัก การงาน หรือความสัมพันธ์"
                )
                await self._log_validation(session_id, question, result)
                return result
        
        # Step 2: AI-based validation (FOR ALL QUESTIONS)
        # This ensures smart detection of context
        try:
            ai_result = await self._ai_validate(question, language)
            await self._log_validation(session_id, question, ai_result)
            return ai_result
        except Exception as e:
            # AI failed - be conservative
            fallback_result = ValidateQuestionResponse(
                status=ValidationStatus.CLARIFICATION_NEEDED,
                confidence=0.5,
                reason=RejectionReason.UNCLEAR,
                message="ไม่สามารถตรวจสอบคำถามได้ กรุณาลองใหม่อีกครั้ง" if language == "th" else "Unable to validate question. Please try again.",
                suggestion="ลองถามใหม่ด้วยคำถามเกี่ยวกับชีวิต ความรัก การงาน หรือความสัมพันธ์" if language == "th" else "Try asking about life, love, career, or relationships",
            )
            await self._log_validation(session_id, question, fallback_result)
            return fallback_result
    
    async def _ai_validate(
        self,
        question: str,
        language: str
    ) -> ValidateQuestionResponse:
        """
        AI-based validation using FREE Google model
        """
        system_prompt = self._build_system_prompt(language)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": os.getenv("APP_URL", "http://localhost:3000"),
                        "X-Title": "Ask The Tarot"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Question: \"{question}\""}
                        ],
                        "temperature": 0.1,  # Low temp for consistency
                        "max_tokens": 200,
                    },
                    timeout=15.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                if "choices" not in data or not data["choices"]:
                    raise ValueError("Invalid AI response format")
                
                choice = data["choices"][0]
                if "message" not in choice or "content" not in choice["message"]:
                    raise ValueError("Invalid AI message format")
                
                result_text = choice["message"]["content"]
                
                # Parse AI response
                return self._parse_ai_response(result_text, language)
            
        except Exception as e:
            raise e
    
    def _build_system_prompt(self, language: str) -> str:
        """Build smart system prompt - allows outcome questions"""
        
        if language == "th":
            return """คุณเป็น AI Gatekeeper สำหรับแอปดูดวง "ถามแม่หมอ"

หน้าที่: ตรวจสอบว่าคำถามเหมาะสมกับการดูดวงไพ่ทาโรต์หรือไม่

=== กฎสำคัญ ===

✅ **อนุญาต (APPROVE)** - เหมาะกับดูดวง:
- เรื่องงาน อาชีพ การเงิน (career)
- ความรัก ความสัมพันธ์ (love, relationship)
- การตัดสินใจในชีวิต (general)
- คำถามแบบ Yes/No เกี่ยวกับอนาคต
- **คำถามเกี่ยวกับผลลัพธ์เหตุการณ์**:
  - "พรรคประชาชนจะชนะการเลือกตั้งมั้ย" → APPROVED (ถามผลการเลือกตั้ง)
  - "แมนยูจะชนะมั้ย" → APPROVED (ถามผลการแข่งขัน)
  - "ฉันจะสอบติดมั้ย" → APPROVED (ถามผลสอบ)
  - "เขาจะตอบรับความรักมั้ย" → APPROVED (ถามผลตอบรับ)

❌ **ไม่อนุญาต (REJECT)** - ไม่เหมาะกับดูดวง:
- โปรแกรมมิ่ง เขียนโค้ด แก้บั๊ก (โค้ด, debug, error)
- คณิตศาสตร์ การคำนวณ (คำนวณ, เลข, สูตร)
- การบ้าน งานเขียน สรุปบทความ (สรุป, การบ้าน, รายงาน)
- คำถามหาข้อเท็จจริงที่ตรวจสอบได้ (วันนี้อากาศเป็นยังไง, ใครเป็นนายก)
- คำถามเชิงวิเคราะห์ที่ต้องใช้ข้อมูลจริง

⚠️ **ความแตกต่างสำคัญ**:
- "พรรคAดีกว่าพรรคBยังไง" → REJECT (ถามความเห็นเชิงการเมือง)
- "พรรคAจะชนะเลือกตั้งมั้ย" → APPROVE (ถามผลลัพธ์อนาคต - เหมาะกับไพ่)

=== รูปแบบคำตอบ ===
ตอบเป็น JSON เท่านั้น:
{
    "is_appropriate": true/false,
    "category": "career|love|health|general|finance|relationship",
    "question_type": "yes_no|open_ended|advice",
    "confidence": 0.0-1.0
}

ถ้าไม่เหมาะสม ให้ "is_appropriate": false
ถ้าเหมาะสม ให้ "is_appropriate": true และระบุ category"""
        else:
            return """You are an AI Gatekeeper for a tarot reading app.

Job: Determine if a question is appropriate for tarot card reading.

=== Rules ===

✅ **APPROVE** - Good for tarot:
- Career, work, finance questions
- Love and relationship questions
- Life decisions and guidance
- Future outcome questions (elections, sports, exams)
- Yes/No questions about personal future

❌ **REJECT** - Not for tarot:
- Programming/coding/debugging
- Math problems or calculations
- Homework or assignments
- Factual questions (weather, current news)

**Key distinction**:
- "Who is better Party A or B?" → REJECT (political opinion)
- "Will Party A win the election?" → APPROVE (future outcome)

=== Response Format ===
Return ONLY JSON:
{
    "is_appropriate": true/false,
    "category": "career|love|health|general|finance|relationship",
    "question_type": "yes_no|open_ended|advice",
    "confidence": 0.0-1.0
}"""

    def _parse_ai_response(self, result_text: str, language: str) -> ValidateQuestionResponse:
        """Parse AI response with flexible handling"""
        try:
            # Clean up response
            result_text = result_text.strip()
            
            # Extract JSON from markdown
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            # Find JSON object
            start_idx = result_text.find('{')
            end_idx = result_text.rfind('}')
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                result_text = result_text[start_idx:end_idx+1]
            
            result = json.loads(result_text)
            
            is_appropriate = result.get("is_appropriate", False)
            confidence = result.get("confidence", 0.5)
            
            if not is_appropriate:
                return self._create_rejected_response(
                    language,
                    "คำถามนี้ไม่เหมาะสมสำหรับการดูดวง" if language == "th" else "This question is not appropriate for tarot reading",
                    "ลองถามคำถามเกี่ยวกับชีวิต ความรัก การงาน หรือความสัมพันธ์" if language == "th" else "Try asking about life, love, career, or relationships"
                )
            
            return ValidateQuestionResponse(
                status=ValidationStatus.APPROVED,
                confidence=confidence,
                category=QuestionCategory(result.get("category", "general")),
                question_type=QuestionType(result.get("question_type", "yes_no")),
                suggested_spread=1 if result.get("question_type") == "yes_no" else 3,
            )
            
        except json.JSONDecodeError:
            # AI returned invalid JSON - fallback
            return ValidateQuestionResponse(
                status=ValidationStatus.CLARIFICATION_NEEDED,
                confidence=0.5,
                reason=RejectionReason.UNCLEAR,
                message="ไม่สามารถตรวจสอบคำถามได้ กรุณาลองใหม่อีกครั้ง" if language == "th" else "Unable to validate. Please try again.",
                suggestion="ลองถามใหม่ด้วยคำถามที่ชัดเจนกว่า" if language == "th" else "Try asking a clearer question",
            )
    
    def _create_rejected_response(
        self, 
        language: str, 
        message: str,
        suggestion: str
    ) -> ValidateQuestionResponse:
        """Create rejected response"""
        return ValidateQuestionResponse(
            status=ValidationStatus.REJECTED,
            confidence=0.9,
            reason=RejectionReason.INAPPROPRIATE_CONTENT,
            message=message,
            suggestion=suggestion
        )
    
    async def _log_validation(
        self,
        session_id: Optional[str],
        question: str,
        result: ValidateQuestionResponse
    ):
        """Log validation result to database"""
        try:
            db = next(get_db())
            validation = QuestionValidation(
                session_id=session_id or "anonymous",
                question_text=question,
                status=result.status,
                rejection_reason=result.reason,
                confidence_score=result.confidence,
                detected_category=result.category
            )
            db.add(validation)
            db.commit()
        except Exception:
            pass
