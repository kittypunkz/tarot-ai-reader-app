"""
AI Interpretation Service
Generates tarot reading interpretations using OpenRouter API
"""

import os
import httpx
import re
from typing import List
from src.data.tarot_cards import TarotCard, get_card_by_id
from src.models.schemas import DrawnCard, SpreadType


class AIInterpreter:
    """Service for generating AI tarot interpretations"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = os.getenv("OPENROUTER_MODEL", "google/gemma-2-9b-it:free")
        self.app_url = os.getenv("APP_URL", "http://localhost:3000")
    
    async def generate_interpretation(
        self,
        question: str,
        cards: List[DrawnCard],
        spread_type: SpreadType,
        language: str = "th"
    ) -> dict:
        """
        Generate AI interpretation for a tarot reading
        
        Returns:
            dict with 'interpretation' (English) and 'interpretation_th' (Thai)
        """
        if not self.api_key:
            # Fallback if no API key
            return self._generate_fallback_interpretation(cards, language)
        
        try:
            # Build the prompt with explicit card list
            prompt = self._build_prompt(question, cards, spread_type, language)
            
            # Call OpenRouter API
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": self.app_url,
                        "X-Title": "Ask The Tarot"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": self._get_system_prompt(language, cards)
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,  # Lower temperature for more strictness
                        "max_tokens": 1000
                    }
                )
                
                if response.status_code != 200:
                    print(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._generate_fallback_interpretation(cards, language)
                
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]
                
                print(f"=== RAW AI RESPONSE ===")
                print(ai_response[:500])
                
                # Validate AI response - check if it mentions cards not in the list
                validated_response = self._validate_ai_response(ai_response, cards, language)
                
                return validated_response
                
        except Exception as e:
            print(f"Error generating interpretation: {e}")
            return self._generate_fallback_interpretation(cards, language)
    
    def _build_prompt(
        self,
        question: str,
        cards: List[DrawnCard],
        spread_type: SpreadType,
        language: str
    ) -> str:
        """Build the prompt for the AI"""
        
        # Build EXACT card list - AI must use ONLY these
        cards_list = []
        for i, card in enumerate(cards):
            pos = card.position_name_th if language == "th" else card.position_name
            name = card.card_name_th if language == "th" else card.card_name
            orientation = "กลับหัว" if card.orientation.value == "reversed" and language == "th" else \
                         "reversed" if card.orientation.value == "reversed" else \
                         "หงายหน้า" if language == "th" else "upright"
            meaning = card.meaning_th if language == "th" else card.meaning
            
            cards_list.append(f"{i+1}. {pos}: {name} ({orientation}) - {meaning[:100]}...")
        
        cards_text = "\n".join(cards_list)
        card_count = len(cards)
        
        if language == "th":
            return f"""คำถาม: "{question}"

ไพ่ที่เปิดได้ ({card_count} ใบ) - ใช้เฉพาะไพ่เหล่านี้เท่านั้น:
{cards_text}

คำสั่งสำคัญ:
1. ทำนายจากไพ่ {card_count} ใบข้างต้นเท่านั้น
2. ห้ามเพิ่มไพ่หรือตำแหน่งอื่นเด็ดขาด
3. อธิบายความหมายของแต่ละใบตามตำแหน่ง
4. เชื่อมโยงเป็นคำทำนายที่สมบูรณ์
5. ตอบคำถาม: "{question}"

รูปแบบคำตอบ:
**ตำแหน่งที่ 1: ชื่อไพ่ (ทิศทาง)**
อธิบายความหมายของไพ่ใบนี้ในตำแหน่งนี้

[ทำนายต่อไปสำหรับไพ่ใบอื่นๆ ถ้ามี]

**คำทำนายโดยรวม:**
[เชื่อมโยงทั้งหมดและตอบคำถาม]

**คำแนะนำ:**
[ข้อแนะนำเฉพาะเจาะจง]"""
        else:
            return f"""Question: "{question}"

Drawn Cards ({card_count} cards) - Use ONLY these cards:
{cards_text}

Important Instructions:
1. Interpret ONLY the {card_count} cards listed above
2. Do NOT add any other cards or positions
3. Explain each card's meaning in its position
4. Weave into a complete reading
5. Answer the question: "{question}"

Response Format:
**Position 1: Card Name (orientation)**
Explain this card's meaning in this position

[Continue for other cards if any]

**Overall Reading:**
[Connect all cards and answer the question]

**Advice:**
[Specific actionable advice]"""
    
    def _get_system_prompt(self, language: str, cards: List[DrawnCard]) -> str:
        """Get the system prompt for the AI"""
        card_names = ", ".join([c.card_name_th for c in cards])
        
        if language == "th":
            return f"""คุณเป็นหมอดูไพ่ทาโรต์มืออาชีพ

กฎสำคัญ:
- ไพ่ที่มีให้ interprete คือ: {card_names} เท่านั้น
- ห้ามเพิ่มไพ่อื่นโดยเด็ดขาด
- ถ้ามี 1 ใบ ตอบแค่ 1 ใบ
- ถ้ามี 3 ใบ ตอบแค่ 3 ใบ
- ไม่มีข้อยกเว้น"""
        else:
            return f"""You are a professional tarot reader

Important Rules:
- Cards to interpret: {card_names} ONLY
- Do NOT add any other cards
- If 1 card, answer for 1 card only
- If 3 cards, answer for 3 cards only  
- No exceptions"""
    
    def _validate_ai_response(self, response: str, cards: List[DrawnCard], language: str) -> dict:
        """Validate AI response and fix if hallucinating"""
        
        # Get list of actual card names
        actual_card_names = set()
        for card in cards:
            actual_card_names.add(card.card_name.lower())
            actual_card_names.add(card.card_name_th.lower())
        
        # Check if AI mentioned cards not in the list
        lines = response.split('\n')
        valid_lines = []
        found_cards = []
        
        for line in lines:
            line_lower = line.lower()
            # Check if line mentions a card
            for card in cards:
                if card.card_name.lower() in line_lower or card.card_name_th.lower() in line_lower:
                    found_cards.append(card.card_name)
                    valid_lines.append(line)
                    break
            else:
                # Line doesn't mention any card - could be intro/outro
                # Keep it if it's general text
                if not any(name in line_lower for name in ['the lovers', 'wheel of fortune', 'death', 'the magician'] if name not in actual_card_names):
                    valid_lines.append(line)
        
        print(f"=== VALIDATION ===")
        print(f"Actual cards: {[c.card_name for c in cards]}")
        print(f"Cards found in AI response: {found_cards}")
        
        # If AI hallucinated different cards, use fallback
        if len(found_cards) != len(cards):
            print(f"AI HALLUCINATION DETECTED! Expected {len(cards)} cards, found {len(found_cards)}")
            return self._generate_fallback_interpretation(cards, language)
        
        # Split into Thai and English
        return self._parse_ai_response(response, language)
    
    def _parse_ai_response(self, response: str, language: str) -> dict:
        """Parse the AI response into Thai and English parts"""
        # Try to find separator
        if "---" in response:
            parts = response.split("---")
            if len(parts) >= 2:
                return {
                    "interpretation": parts[1].strip() if language == "th" else parts[0].strip(),
                    "interpretation_th": parts[0].strip() if language == "th" else parts[1].strip()
                }
        
        # No separator - use same text for both
        return {
            "interpretation": response.strip(),
            "interpretation_th": response.strip()
        }
    
    def _generate_fallback_interpretation(
        self,
        cards: List[DrawnCard],
        language: str
    ) -> dict:
        """Generate interpretation from actual card meanings when AI fails"""
        
        if language == "th":
            lines = []
            for card in cards:
                pos = card.position_name_th
                name = card.card_name_th
                orientation = "กลับหัว" if card.orientation.value == "reversed" else "หงายหน้า"
                meaning = card.meaning_th
                lines.append(f"**{pos}: {name} ({orientation})**\n{meaning}")
            
            interpretation_th = "\n\n".join(lines)
            interpretation_en = "Card reading:\n" + "\n".join([f"{c.position_name}: {c.card_name}" for c in cards])
        else:
            lines = []
            for card in cards:
                pos = card.position_name
                name = card.card_name
                orientation = card.orientation.value
                meaning = card.meaning
                lines.append(f"**{pos}: {name} ({orientation})**\n{meaning}")
            
            interpretation_en = "\n\n".join(lines)
            interpretation_th = "คำทำนาย:\n" + "\n".join([f"{c.position_name_th}: {c.card_name_th}" for c in cards])
        
        return {
            "interpretation": interpretation_en,
            "interpretation_th": interpretation_th
        }


# Singleton instance
_interpreter = None

def get_interpreter() -> AIInterpreter:
    """Get or create the AI interpreter singleton"""
    global _interpreter
    if _interpreter is None:
        _interpreter = AIInterpreter()
    return _interpreter
