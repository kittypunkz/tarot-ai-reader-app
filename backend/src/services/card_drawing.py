"""
Card Drawing Service
US-002: Intelligent Spread Selection
Handles drawing tarot cards with cryptographically secure randomization
"""

import os
import uuid
import secrets
from datetime import datetime
from typing import List, Optional, Dict

from src.data.tarot_cards import get_all_cards, get_random_cards, TarotCard, Suit
from src.models.schemas import (
    DrawCardsRequest, 
    DrawCardsResponse, 
    DrawnCard,
    SpreadInfo,
    SpreadType,
    CardOrientation
)
from src.database.database import get_db
from src.database.models import Reading, CardDraw, Spread
from src.services.ai_interpreter import get_interpreter


# Spread definitions
SPREAD_DEFINITIONS = {
    SpreadType.SINGLE: {
        "name": "Single Card",
        "name_th": "ไพ่ 1 ใบ",
        "card_count": 1,
        "description": "Quick answer for yes/no questions",
        "description_th": "คำตอบรวดเร็วสำหรับคำถามใช่/ไม่",
        "positions": ["Answer"],
        "positions_th": ["คำตอบ"],
    },
    SpreadType.THREE_PPF: {
        "name": "Three Cards - Past, Present, Future",
        "name_th": "ไพ่ 3 ใบ - อดีต ปัจจุบัน อนาคต",
        "card_count": 3,
        "description": "Insight into how past influences present and future",
        "description_th": "เข้าใจว่าอดีตส่งผลต่อปัจจุบันและอนาคตอย่างไร",
        "positions": ["Past", "Present", "Future"],
        "positions_th": ["อดีต", "ปัจจุบัน", "อนาคต"],
    },
    SpreadType.THREE_MPC: {
        "name": "Three Cards - Mind, Body, Spirit",
        "name_th": "ไพ่ 3 ใบ - จิต กาย วิญญาณ",
        "card_count": 3,
        "description": "Holistic view of your situation",
        "description_th": "มุมมองแบบองค์รวมของสถานการณ์",
        "positions": ["Mind", "Body", "Spirit"],
        "positions_th": ["จิตใจ", "ร่างกาย", "วิญญาณ"],
    },
    SpreadType.CELTIC_CROSS: {
        "name": "Celtic Cross",
        "name_th": "แผ่นกางเขนเคลติก",
        "card_count": 10,
        "description": "Comprehensive 10-card spread for deep insight (Premium)",
        "description_th": "การกางไพ่ 10 ใบเชิงลึก (พรีเมียม)",
        "positions": [
            "Present Situation",
            "Challenge/Obstacle",
            "Foundation",
            "Recent Past",
            "Best Outcome",
            "Immediate Future",
            "Your Influence",
            "External Influences",
            "Hopes/Fears",
            "Final Outcome"
        ],
        "positions_th": [
            "สถานการณ์ปัจจุบัน",
            "ความท้าทาย/อุปสรรค",
            "รากฐาน",
            "อดีตล่าสุด",
            "ผลลัพธ์ที่ดีที่สุด",
            "อนาคตอันใกล้",
            "อิทธิพลของคุณ",
            "อิทธิพลภายนอก",
            "ความหวัง/ความกลัว",
            "ผลลัพธ์สุดท้าย"
        ],
    },
}


class CardDrawingService:
    """Service for drawing tarot cards"""
    
    def __init__(self):
        self._init_spreads()
    
    def _init_spreads(self):
        """Initialize spreads in database if not exists"""
        try:
            db = next(get_db())
            existing = db.query(Spread).count()
            if existing == 0:
                # Create default spreads
                for spread_type, definition in SPREAD_DEFINITIONS.items():
                    spread = Spread(
                        name=spread_type.value,
                        name_th=definition["name_th"],
                        card_count=definition["card_count"],
                        description=definition["description"],
                        description_th=definition["description_th"],
                        positions=definition["positions"],
                        positions_th=definition["positions_th"],
                        is_premium=(spread_type == SpreadType.CELTIC_CROSS)
                    )
                    db.add(spread)
                db.commit()
        except Exception:
            # If table doesn't exist yet, skip
            pass
    
    def get_spread_info(self, spread_type: SpreadType) -> SpreadInfo:
        """Get information about a spread type"""
        definition = SPREAD_DEFINITIONS[spread_type]
        return SpreadInfo(
            spread_type=spread_type,
            name=definition["name"],
            name_th=definition["name_th"],
            card_count=definition["card_count"],
            description=definition["description"],
            description_th=definition["description_th"],
            positions=definition["positions"],
            positions_th=definition["positions_th"],
        )
    
    def suggest_spread(self, question_type: str) -> SpreadType:
        """Suggest a spread based on question type"""
        if question_type == "yes_no":
            return SpreadType.SINGLE
        elif question_type == "open_ended":
            # Randomly choose between PPF and MPC for variety
            return secrets.choice([SpreadType.THREE_PPF, SpreadType.THREE_MPC])
        else:
            return SpreadType.THREE_PPF
    
    async def draw_cards(
        self, 
        request: DrawCardsRequest
    ) -> DrawCardsResponse:
        """
        Draw tarot cards for a reading
        
        If user selected cards, use those. Otherwise, draw random cards.
        """
        from src.data.tarot_cards import get_card_by_id
        
        # Get spread info
        spread_info = self.get_spread_info(request.spread_type)
        card_count = spread_info.card_count
        
        # Generate reading ID
        reading_id = f"read_{datetime.now().strftime('%Y%m%d')}_{secrets.token_hex(8)}"
        
        # Build response cards
        drawn_cards: List[DrawnCard] = []
        
        # Check if user provided selected cards
        if request.selected_cards and len(request.selected_cards) == card_count:
            # Use user-selected cards
            for selected in request.selected_cards:
                card = get_card_by_id(selected.card_id)
                if not card:
                    raise ValueError(f"Invalid card ID: {selected.card_id}")
                
                # Use user's orientation choice
                is_reversed = selected.is_reversed
                orientation = CardOrientation.REVERSED if is_reversed else CardOrientation.UPRIGHT
                
                # Get meaning based on orientation
                if orientation == CardOrientation.UPRIGHT:
                    meaning = card.meaning_upright
                    meaning_th = card.meaning_upright_th
                else:
                    meaning = card.meaning_reversed
                    meaning_th = card.meaning_reversed_th
                
                drawn_card = DrawnCard(
                    position=selected.position,
                    position_name=spread_info.positions[selected.position],
                    position_name_th=spread_info.positions_th[selected.position],
                    card_id=card.id,
                    card_name=card.name,
                    card_name_th=card.name_th,
                    orientation=orientation,
                    keywords=card.keywords,
                    keywords_th=card.keywords_th,
                    meaning=meaning,
                    meaning_th=meaning_th,
                    image_url=f"/cards/{card.id}.png"
                )
                drawn_cards.append(drawn_card)
        else:
            # Draw random cards (fallback)
            drawn_cards_data = get_random_cards(card_count)
            
            for i, card in enumerate(drawn_cards_data):
                # 50% chance of reversed
                orientation = secrets.choice([
                    CardOrientation.UPRIGHT, 
                    CardOrientation.REVERSED
                ])
                
                # Get meaning based on orientation
                if orientation == CardOrientation.UPRIGHT:
                    meaning = card.meaning_upright
                    meaning_th = card.meaning_upright_th
                else:
                    meaning = card.meaning_reversed
                    meaning_th = card.meaning_reversed_th
                
                drawn_card = DrawnCard(
                    position=i,
                    position_name=spread_info.positions[i],
                    position_name_th=spread_info.positions_th[i],
                    card_id=card.id,
                    card_name=card.name,
                    card_name_th=card.name_th,
                    orientation=orientation,
                    keywords=card.keywords,
                    keywords_th=card.keywords_th,
                    meaning=meaning,
                    meaning_th=meaning_th,
                    image_url=f"/cards/{card.id}.png"
                )
                drawn_cards.append(drawn_card)
        
        # DEBUG: Log what cards we're interpreting
        print(f"=== GENERATING INTERPRETATION ===")
        print(f"Question: {request.question}")
        print(f"Number of cards: {len(drawn_cards)}")
        print(f"Cards: {[c.card_name_th for c in drawn_cards]}")
        
        # Generate AI interpretation with validation
        interpreter = get_interpreter()
        interpretation_result = await interpreter.generate_interpretation(
            question=request.question,
            cards=drawn_cards,
            spread_type=request.spread_type,
            language=request.language
        )
        
        print(f"=== FINAL INTERPRETATION ===")
        print(f"TH: {interpretation_result['interpretation_th'][:200]}...")
        print(f"EN: {interpretation_result['interpretation'][:200]}...")
        
        # Save to database with interpretation
        await self._save_reading(
            reading_id=reading_id,
            request=request,
            spread_info=spread_info,
            drawn_cards=drawn_cards,
            interpretation=interpretation_result["interpretation"],
            interpretation_th=interpretation_result["interpretation_th"]
        )
        
        return DrawCardsResponse(
            reading_id=reading_id,
            session_id=request.session_id,
            spread=spread_info,
            cards=drawn_cards,
            question=request.question,
            interpretation=interpretation_result["interpretation"],
            interpretation_th=interpretation_result["interpretation_th"],
            created_at=datetime.utcnow().isoformat()
        )
    
    async def _save_reading(
        self,
        reading_id: str,
        request: DrawCardsRequest,
        spread_info: SpreadInfo,
        drawn_cards: List[DrawnCard],
        interpretation: str = None,
        interpretation_th: str = None
    ):
        """Save reading to database"""
        try:
            db = next(get_db())
            
            # Create reading record
            reading = Reading(
                id=reading_id,
                session_id=request.session_id,
                question=request.question,
                spread_id=None,  # Will be linked if needed
                spread_type=spread_info.spread_type.value,
                status="completed",
                interpretation=interpretation,
                interpretation_th=interpretation_th
            )
            db.add(reading)
            
            # Create card draw records
            for card in drawn_cards:
                card_draw = CardDraw(
                    reading_id=reading_id,
                    session_id=request.session_id,
                    card_id=card.card_id,
                    card_name=card.card_name,
                    card_name_th=card.card_name_th,
                    position=card.position,
                    position_name=card.position_name,
                    orientation=card.orientation.value,
                    meaning_context=card.meaning,
                    meaning_context_th=card.meaning_th
                )
                db.add(card_draw)
            
            db.commit()
        except Exception as e:
            # Log error but don't fail the request
            print(f"Error saving reading: {e}")
    
    async def get_reading(self, reading_id: str, session_id: str) -> Optional[Dict]:
        """Get a reading by ID"""
        try:
            db = next(get_db())
            
            reading = db.query(Reading).filter(
                Reading.id == reading_id,
                Reading.session_id == session_id
            ).first()
            
            if not reading:
                print(f"Reading not found: {reading_id}")
                return None
            
            # Get spread info
            spread_type = SpreadType(reading.spread_type)
            spread_info = self.get_spread_info(spread_type)
            
            # Get drawn cards
            card_draws = db.query(CardDraw).filter(
                CardDraw.reading_id == reading_id
            ).order_by(CardDraw.position).all()
            
            print(f"=== GET READING {reading_id} ===")
            print(f"Found {len(card_draws)} cards in database")
            
            cards = []
            for cd in card_draws:
                # Get full card data
                from src.data.tarot_cards import get_card_by_id
                card_data = get_card_by_id(cd.card_id)
                
                if card_data:
                    cards.append(DrawnCard(
                        position=cd.position,
                        position_name=cd.position_name,
                        position_name_th=cd.position_name_th or cd.position_name,
                        card_id=cd.card_id,
                        card_name=cd.card_name,
                        card_name_th=cd.card_name_th,
                        orientation=CardOrientation(cd.orientation),
                        keywords=card_data.keywords,
                        keywords_th=card_data.keywords_th,
                        meaning=cd.meaning_context or card_data.meaning_upright,
                        meaning_th=cd.meaning_context_th or card_data.meaning_upright_th,
                        image_url=f"/cards/{cd.card_id}.png"
                    ))
            
            return {
                "reading_id": reading.id,
                "session_id": reading.session_id,
                "question": reading.question,
                "spread": spread_info,
                "cards": cards,
                "interpretation": reading.interpretation,
                "interpretation_th": reading.interpretation_th,
                "status": reading.status,
                "created_at": reading.created_at.isoformat() if reading.created_at else None,
                "completed_at": reading.completed_at.isoformat() if reading.completed_at else None
            }
        except Exception as e:
            print(f"Error getting reading: {e}")
            return None
