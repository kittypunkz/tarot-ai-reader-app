#!/usr/bin/env python3
"""
Seed database with initial data
Run: python scripts/seed_data.py
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from src.database.database import SessionLocal, init_db
from src.database.models import Spread
import json

def seed_spreads(db: Session):
    """Seed tarot spreads"""
    spreads = [
        {
            "name": "single",
            "name_th": "ไพ่ใบเดียว",
            "card_count": 1,
            "description": "One card reading for quick insights",
            "description_th": "การอ่านไพ่ใบเดียวสำหรับคำตอบรวดเร็ว",
            "positions": ["Answer"],
            "positions_th": ["คำตอบ"],
            "is_premium": False
        },
        {
            "name": "three_ppf",
            "name_th": "สามใบ (อดีต-ปัจจุบัน-อนาคต)",
            "card_count": 3,
            "description": "Three card spread showing Past, Present, and Future",
            "description_th": "การอ่านไพ่สามใบแสดงอดีต ปัจจุบัน และอนาคต",
            "positions": ["Past", "Present", "Future"],
            "positions_th": ["อดีต", "ปัจจุบัน", "อนาคต"],
            "is_premium": False
        },
        {
            "name": "three_mbs",
            "name_th": "สามใบ (สถานการณ์-คำแนะนำ-ผลลัพธ์)",
            "card_count": 3,
            "description": "Three card spread for Situation, Advice, and Outcome",
            "description_th": "การอ่านไพ่สามใบสำหรับสถานการณ์ คำแนะนำ และผลลัพธ์",
            "positions": ["Situation", "Advice", "Outcome"],
            "positions_th": ["สถานการณ์", "คำแนะนำ", "ผลลัพธ์"],
            "is_premium": False
        },
        {
            "name": "celtic_cross",
            "name_th": "กากบาทเซลติก",
            "card_count": 10,
            "description": "Celtic Cross spread for deep insights",
            "description_th": "การอ่านไพ่กากบาทเซลติกสำหรับข้อมูลเชิงลึก",
            "positions": [
                "Present Situation",
                "Challenge",
                "Foundation",
                "Recent Past",
                "Best Outcome",
                "Future",
                "Your Influence",
                "External Influence",
                "Hopes/Fears",
                "Final Outcome"
            ],
            "positions_th": [
                "สถานการณ์ปัจจุบัน",
                "อุปสรรค",
                "รากฐาน",
                "อดีตล่าสุด",
                "ผลลัพธ์ที่ดีที่สุด",
                "อนาคต",
                "อิทธิพลของคุณ",
                "อิทธิพลภายนอก",
                "ความหวัง/ความกลัว",
                "ผลลัพธ์สุดท้าย"
            ],
            "is_premium": True
        }
    ]
    
    for spread_data in spreads:
        existing = db.query(Spread).filter(Spread.name == spread_data["name"]).first()
        if not existing:
            spread = Spread(**spread_data)
            db.add(spread)
            print(f"  ✓ Added spread: {spread_data['name_th']}")
        else:
            print(f"  ⏭️  Spread already exists: {spread_data['name_th']}")
    
    db.commit()

def main():
    print("🌱 Seeding database...")
    
    # Initialize database (create tables if not exist)
    init_db()
    
    db = SessionLocal()
    try:
        print("\n📋 Seeding spreads...")
        seed_spreads(db)
        
        print("\n✅ Database seeded successfully!")
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
