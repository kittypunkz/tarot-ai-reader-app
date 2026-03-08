"""
AI Interpretation Service
Generates tarot reading interpretations using OpenRouter API
"""

import os
import httpx
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
            # Build the prompt
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
                                "content": self._get_system_prompt(language)
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 800
                    }
                )
                
                if response.status_code != 200:
                    print(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._generate_fallback_interpretation(cards, language)
                
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]
                
                # Parse the response (expecting both Thai and English)
                return self._parse_ai_response(ai_response, language)
                
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
        
        # Build cards description - ONLY the actual cards drawn
        cards_desc = []
        for i, card in enumerate(cards):
            position = card.position_name_th if language == "th" else card.position_name
            card_name = card.card_name_th if language == "th" else card.card_name
            orientation = "กลับหัว" if card.orientation.value == "reversed" and language == "th" else \
                         "reversed" if card.orientation.value == "reversed" else \
                         "หงายหน้า" if language == "th" else "upright"
            meaning = card.meaning_th if language == "th" else card.meaning
            
            cards_desc.append(f"""{position}: {card_name} ({orientation})
ความหมาย: {meaning}""")
        
        cards_text = "\n\n".join(cards_desc)
        
        if language == "th":
            return f"""คุณเป็นหมอดูไพ่ทาโรต์ ผู้ใช้ถามคำถามและเปิดไพ่ได้ {len(cards)} ใบตามที่ระบุด้านล่างนี้เท่านั้น

คำถาม: "{question}"

ไพ่ที่เปิดได้ ({len(cards)} ใบ):
{cards_text}

สิ่งสำคัญ:
- ทำนายจากไพ่ {len(cards)} ใบนี้เท่านั้น ห้ามเพิ่มไพ่หรือตำแหน่งที่ไม่มีในรายการ
- อธิบายความหมายของไพ่แต่ละใบ
- เชื่อมโยงไพ่เข้าด้วยกันเป็นคำทำนายที่สมบูรณ์
- ตอบคำถามของผู้ถามอย่างตรงประเด็น

กรุณาตอบเป็นภาษาไทยก่อน แล้วตามด้วยภาษาอังกฤษ คั่นด้วย ---

รูปแบบ:
[คำทำนายภาษาไทย]

---

[English interpretation]"""
        else:
            return f"""You are a tarot reader. The user asked a question and drew exactly {len(cards)} cards as listed below ONLY.

Question: "{question}"

Drawn Cards ({len(cards)} cards):
{cards_text}

Important:
- Interpret ONLY these {len(cards)} cards
- Do NOT add cards or positions not in the list
- Explain each card's meaning
- Weave cards into a coherent reading
- Directly address the question

Respond in English first, then Thai, separated by ---

Format:
[English interpretation]

---

[คำทำนายภาษาไทย]"""
    
    def _get_system_prompt(self, language: str) -> str:
        """Get the system prompt for the AI"""
        if language == "th":
            return """คุณเป็นหมอดูไพ่ทาโรต์ผู้เชี่ยวชาญที่มีประสบการณ์มากกว่า 20 ปี 
คุณให้คำทำนายที่ลึกซึ้ง แต่เข้าใจง่าย และให้คำแนะนำที่เป็นประโยชน์และปฏิบัติได้จริง
คุณเคารพความเป็นส่วนตัวและให้คำทำนายที่สร้างสรรค์ ไม่ทำให้ผู้ถามกลัวหรือกังวลเกินไป"""
        else:
            return """You are an expert tarot reader with over 20 years of experience.
You provide deep yet understandable readings with practical, actionable advice.
You respect privacy and give constructive readings without causing unnecessary fear or worry."""
    
    def _parse_ai_response(self, response: str, language: str) -> dict:
        """Parse the AI response into Thai and English parts"""
        parts = response.split("---")
        
        if len(parts) >= 2:
            if language == "th":
                thai_part = parts[0].strip()
                english_part = parts[1].strip()
            else:
                english_part = parts[0].strip()
                thai_part = parts[1].strip()
        else:
            # If no separator, use the same text for both
            text = response.strip()
            thai_part = text
            english_part = text
        
        return {
            "interpretation": english_part,
            "interpretation_th": thai_part
        }
    
    def _generate_fallback_interpretation(
        self,
        cards: List[DrawnCard],
        language: str
    ) -> dict:
        """Generate a fallback interpretation when AI is not available"""
        
        if language == "th":
            interpretation_th = "คำทำนายจากไพ่\n\n"
            interpretation_en = "Tarot Reading\n\n"
            
            for card in cards:
                position = card.position_name_th
                name = card.card_name_th
                meaning = card.meaning_th
                
                interpretation_th += f"{position}: {name}\n{meaning}\n\n"
                interpretation_en += f"{card.position_name}: {card.card_name}\n{card.meaning}\n\n"
            
            interpretation_th += "\nไพ่เหล่านี้แสดงถึงเส้นทางที่คุณกำลังเดินอยู่ และแนะนำให้คุณฟังเสียงสัญชาตญาณของตนเอง"
            interpretation_en += "\nThese cards represent your current path and advise you to listen to your intuition."
            
        else:
            interpretation_en = "Tarot Reading\n\n"
            interpretation_th = "คำทำนาย\n\n"
            
            for card in cards:
                interpretation_en += f"{card.position_name}: {card.card_name}\n{card.meaning}\n\n"
                interpretation_th += f"{card.position_name_th}: {card.card_name_th}\n{card.meaning_th}\n\n"
            
            interpretation_en += "\nThese cards represent your current path and advise you to listen to your intuition."
            interpretation_th += "\nไพ่เหล่านี้แสดงถึงเส้นทางที่คุณกำลังเดินอยู่"
        
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
