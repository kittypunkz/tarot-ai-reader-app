"""
Tarot Card Data - 78 Cards
Major Arcana (22 cards) + Minor Arcana (56 cards)
US-002: Intelligent Spread Selection
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum


class Suit(str, Enum):
    """Tarot suits"""
    MAJOR = "major"  # Major Arcana
    CUPS = "cups"    # ไม้เท้า / ถ้วย
    WANDS = "wands"  # ไม้
    SWORDS = "swords"  # ดาบ
    PENTACLES = "pentacles"  # เหรียญ


@dataclass
class TarotCard:
    """Tarot card definition"""
    id: str
    name: str
    name_th: str
    number: Optional[int]  # None for Major Arcana, 1-14 for suits
    suit: Suit
    keywords: List[str]
    keywords_th: List[str]
    meaning_upright: str
    meaning_upright_th: str
    meaning_reversed: str
    meaning_reversed_th: str
    element: Optional[str] = None  # fire, water, air, earth
    element_th: Optional[str] = None


# Major Arcana (0-21)
MAJOR_ARCANA = [
    TarotCard(
        id="the_fool",
        name="The Fool",
        name_th="เดอะฟูล (คนโง่)",
        number=0,
        suit=Suit.MAJOR,
        keywords=["beginnings", "innocence", "spontaneity", "free spirit"],
        keywords_th=["การเริ่มต้น", "ความบริสุทธิ์", "ความกระตือรือร้น", "อิสระ"],
        meaning_upright="New beginnings, innocence, spontaneity, a free spirit",
        meaning_upright_th="การเริ่มต้นใหม่ ความบริสุทธิ์ การเดินทางครั้งใหม่ อิสรภาพ",
        meaning_reversed="Recklessness, risk-taking, foolishness, naivety",
        meaning_reversed_th="ความประมาท การเสี่ยงเกินไป ความโง่เขลา ความไร้เดียงสา",
    ),
    TarotCard(
        id="the_magician",
        name="The Magician",
        name_th="เดอะเมจิเชี่ยน (นักเวทย์)",
        number=1,
        suit=Suit.MAJOR,
        keywords=["manifestation", "resourcefulness", "power", "inspired action"],
        keywords_th=["การสำแดง", "ความมีไหวพริบ", "พลัง", "การกระทำที่ได้แรงบันดาลใจ"],
        meaning_upright="Manifestation, resourcefulness, power, inspired action",
        meaning_upright_th="การสำแดงผล ความสามารถ การใช้ทรัพยากรอย่างมีประสิทธิภาพ พลังในการสร้างสรรค์",
        meaning_reversed="Manipulation, poor planning, untapped talents",
        meaning_reversed_th="การชักใย การวางแผนที่ไม่ดี ความสามารถที่ยังไม่ได้ใช้",
    ),
    TarotCard(
        id="the_high_priestess",
        name="The High Priestess",
        name_th="เดอะไฮพรีสเตส (หญิงสงฆ์สูง)",
        number=2,
        suit=Suit.MAJOR,
        keywords=["intuition", "sacred knowledge", "divine feminine", "subconscious"],
        keywords_th=["สัญชาตญาณ", "ความรู้ศักดิ์สิทธิ์", "พลังหญิง", "จิตใต้สำนึก"],
        meaning_upright="Intuition, sacred knowledge, divine feminine, the subconscious mind",
        meaning_upright_th="สัญชาตญาณ ความรู้ลึกลับ พลังหญิงอันศักดิ์สิทธิ์ จิตใต้สำนึก",
        meaning_reversed="Secrets, disconnected from intuition, withdrawal, silence",
        meaning_reversed_th="ความลับ ขาดการเชื่อมต่อกับสัญชาตญาณ การถอนตัว ความเงียบ",
    ),
    TarotCard(
        id="the_empress",
        name="The Empress",
        name_th="ดิเอมเพรส (จักรพรรดินี)",
        number=3,
        suit=Suit.MAJOR,
        keywords=["femininity", "beauty", "nature", "nurturing", "abundance"],
        keywords_th=["ความเป็นหญิง", "ความงาม", "ธรรมชาติ", "การเลี้ยงดู", "ความอุดมสมบูรณ์"],
        meaning_upright="Femininity, beauty, nature, nurturing, abundance",
        meaning_upright_th="ความเป็นหญิง ความงาม ธรรมชาติ การเลี้ยงดู ความอุดมสมบูรณ์",
        meaning_reversed="Creative block, dependence on others, emptiness",
        meaning_reversed_th="ความตันในการสร้างสรรค์ การพึ่งพาผู้อื่น ความว่างเปล่า",
    ),
    TarotCard(
        id="the_emperor",
        name="The Emperor",
        name_th="ดิเอ็มเพอร์เรอร์ (จักรพรรดิ)",
        number=4,
        suit=Suit.MAJOR,
        keywords=["authority", "structure", "control", "fatherhood"],
        keywords_th=["อำนาจ", "โครงสร้าง", "การควบคุม", "ความเป็นพ่อ"],
        meaning_upright="Authority, structure, control, fatherhood, leadership",
        meaning_upright_th="อำนาจ โครงสร้าง การควบคุม ความเป็นผู้นำ เสถียรภาพ",
        meaning_reversed="Tyranny, rigidity, coldness, lack of discipline",
        meaning_reversed_th="การกดขี่ ความแข็งกร้าว ความเย็นชา ขาดวินัย",
    ),
    TarotCard(
        id="the_hierophant",
        name="The Hierophant",
        name_th="เดอะไฮเออโรแฟนต์ (สังฆราช)",
        number=5,
        suit=Suit.MAJOR,
        keywords=["spiritual wisdom", "religious beliefs", "conformity", "tradition"],
        keywords_th=["ปัญญาทางจิตวิญญาณ", "ความเชื่อทางศาสนา", "การปฏิบัติตาม", "ประเพณี"],
        meaning_upright="Spiritual wisdom, religious beliefs, conformity, tradition, institutions",
        meaning_upright_th="ปัญญาทางจิตวิญญาณ ความเชื่อทางศาสนา ประเพณี สถาบัน",
        meaning_reversed="Personal beliefs, freedom, challenging the status quo",
        meaning_reversed_th="ความเชื่อส่วนบุคคล อิสรภาพ การท้าทายสถานะปัจจุบัน",
    ),
    TarotCard(
        id="the_lovers",
        name="The Lovers",
        name_th="เดอะเลิฟเวอร์ส (คู่รัก)",
        number=6,
        suit=Suit.MAJOR,
        keywords=["love", "harmony", "relationships", "choices", "union"],
        keywords_th=["ความรัก", "ความกลมเกลียว", "ความสัมพันธ์", "ทางเลือก", "การรวมตัว"],
        meaning_upright="Love, harmony, relationships, choices, union",
        meaning_upright_th="ความรัก ความกลมเกลียว ความสัมพันธ์ การเลือก การรวมตัว",
        meaning_reversed="Self-love, disharmony, imbalance, misalignment of values",
        meaning_reversed_th="ความรักตนเอง ความไม่กลมเกลียว ความไม่สมดุล คุณค่าที่ไม่ตรงกัน",
    ),
    TarotCard(
        id="the_chariot",
        name="The Chariot",
        name_th="เดอะแชริออต (รถศึก)",
        number=7,
        suit=Suit.MAJOR,
        keywords=["control", "willpower", "success", "action", "determination"],
        keywords_th=["การควบคุม", "พลังใจ", "ความสำเร็จ", "การกระทำ", "ความมุ่งมั่น"],
        meaning_upright="Control, willpower, success, action, determination",
        meaning_upright_th="การควบคุม พลังใจ ความสำเร็จ การกระทำ ความมุ่งมั่น",
        meaning_reversed="Self-discipline, opposition, lack of direction",
        meaning_reversed_th="การควบคุมตนเอง การต่อต้าน ขาดทิศทาง",
    ),
    TarotCard(
        id="strength",
        name="Strength",
        name_th="สเตรงท์ (ความแข็งแกร่ง)",
        number=8,
        suit=Suit.MAJOR,
        keywords=["strength", "courage", "persuasion", "influence", "compassion"],
        keywords_th=["ความแข็งแกร่ง", "ความกล้าหาญ", "การโน้มน้าว", "อิทธิพล", "ความเห็นใจ"],
        meaning_upright="Strength, courage, persuasion, influence, compassion",
        meaning_upright_th="ความแข็งแกร่ง ความกล้าหาญ การโน้มน้าว อิทธิพล ความเห็นใจ",
        meaning_reversed="Inner strength, self-doubt, low energy, raw emotion",
        meaning_reversed_th="พลังภายใน การสงสัยตนเอง พลังงานต่ำ อารมณ์รุนแรง",
    ),
    TarotCard(
        id="the_hermit",
        name="The Hermit",
        name_th="เดอะเฮอร์มิต (ผู้สันโดษ)",
        number=9,
        suit=Suit.MAJOR,
        keywords=["soul-searching", "introspection", "being alone", "inner guidance"],
        keywords_th=["การค้นหาวิญญาณ", "การพิจารณาตน", "การอยู่คนเดียว", "แนวทางภายใน"],
        meaning_upright="Soul-searching, introspection, being alone, inner guidance",
        meaning_upright_th="การค้นหาวิญญาณ การพิจารณาตน การอยู่คนเดียว แนวทางจากภายใน",
        meaning_reversed="Isolation, loneliness, withdrawal, rejection",
        meaning_reversed_th="การแยกตัว ความโดดเดี่ยว การถอนตัว การปฏิเสธ",
    ),
    TarotCard(
        id="wheel_of_fortune",
        name="Wheel of Fortune",
        name_th="วีลออฟฟอร์จูน (ล้อแห่งโชคชะตา)",
        number=10,
        suit=Suit.MAJOR,
        keywords=["good luck", "karma", "life cycles", "destiny", "turning point"],
        keywords_th=["โชคดี", "กรรม", "วัฏจักรชีวิต", "โชคชะตา", "จุดเปลี่ยน"],
        meaning_upright="Good luck, karma, life cycles, destiny, a turning point",
        meaning_upright_th="โชคดี กรรม วัฏจักรชีวิต โชคชะตา จุดเปลี่ยน",
        meaning_reversed="Bad luck, resistance to change, breaking cycles",
        meaning_reversed_th="โชคร้าย การต่อต้านการเปลี่ยนแปลง การทำลายวัฏจักร",
    ),
    TarotCard(
        id="justice",
        name="Justice",
        name_th="จัสติส (ความยุติธรรม)",
        number=11,
        suit=Suit.MAJOR,
        keywords=["justice", "fairness", "truth", "cause and effect", "law"],
        keywords_th=["ความยุติธรรม", "ความเป็นธรรม", "ความจริง", "เหตุและผล", "กฎหมาย"],
        meaning_upright="Justice, fairness, truth, cause and effect, law",
        meaning_upright_th="ความยุติธรรม ความเป็นธรรม ความจริง เหตุและผล กฎหมาย",
        meaning_reversed="Unfairness, lack of accountability, dishonesty",
        meaning_reversed_th="ความไม่เป็นธรรม ขาดความรับผิดชอบ ความไม่ซื่อสัตย์",
    ),
    TarotCard(
        id="the_hanged_man",
        name="The Hanged Man",
        name_th="เดอะแฮงด์แมน (คนถูกแขวน)",
        number=12,
        suit=Suit.MAJOR,
        keywords=["pause", "surrender", "letting go", "new perspectives"],
        keywords_th=["การหยุดพัก", "การยอมจำนน", "การปล่อยวาง", "มุมมองใหม่"],
        meaning_upright="Pause, surrender, letting go, new perspectives",
        meaning_upright_th="การหยุดพัก การยอมจำนน การปล่อยวาง มุมมองใหม่",
        meaning_reversed="Delays, resistance, stalling, indecision",
        meaning_reversed_th="ความล่าช้า การต่อต้าน การรอคอย การลังเล",
    ),
    TarotCard(
        id="death",
        name="Death",
        name_th="เดธ (ความตาย)",
        number=13,
        suit=Suit.MAJOR,
        keywords=["endings", "change", "transformation", "transition"],
        keywords_th=["การสิ้นสุด", "การเปลี่ยนแปลง", "การแปรสภาพ", "การเปลี่ยนผ่าน"],
        meaning_upright="Endings, change, transformation, transition",
        meaning_upright_th="การสิ้นสุด การเปลี่ยนแปลง การแปรสภาพ การเปลี่ยนผ่าน",
        meaning_reversed="Resistance to change, unable to move on, stagnation",
        meaning_reversed_th="การต่อต้านการเปลี่ยนแปลง ไม่สามารถก้าวต่อไปได้ ความทรงตัว",
    ),
    TarotCard(
        id="temperance",
        name="Temperance",
        name_th="เทมเพอแรนซ์ (ความพอดี)",
        number=14,
        suit=Suit.MAJOR,
        keywords=["balance", "moderation", "patience", "purpose"],
        keywords_th=["ความสมดุล", "ความพอดี", "ความอดทน", "จุดมุ่งหมาย"],
        meaning_upright="Balance, moderation, patience, purpose",
        meaning_upright_th="ความสมดุล ความพอดี ความอดทน จุดมุ่งหมาย",
        meaning_reversed="Imbalance, excess, self-healing, re-alignment",
        meaning_reversed_th="ความไม่สมดุล ความมากเกินไป การรักษาตนเอง การปรับตัวใหม่",
    ),
    TarotCard(
        id="the_devil",
        name="The Devil",
        name_th="เดอะเดวิล (ปีศาจ)",
        number=15,
        suit=Suit.MAJOR,
        keywords=["shadow self", "attachment", "addiction", "restriction"],
        keywords_th=["ด้านมืด", "ความผูกพัน", "การเสพติด", "ข้อจำกัด"],
        meaning_upright="Shadow self, attachment, addiction, restriction",
        meaning_upright_th="ด้านมืดของตน ความผูกพัน การเสพติด ข้อจำกัด",
        meaning_reversed="Releasing limiting beliefs, exploring dark thoughts, detachment",
        meaning_reversed_th="การปล่อยความเชื่อที่จำกัด การสำรวจความคิดมืดมน การปลดปล่อย",
    ),
    TarotCard(
        id="the_tower",
        name="The Tower",
        name_th="เดอะทาวเวอร์ (หอคอย)",
        number=16,
        suit=Suit.MAJOR,
        keywords=["sudden change", "upheaval", "chaos", "revelation"],
        keywords_th=["การเปลี่ยนแปลงกะทันหัน", "ความปั่นป่วน", "ความยุ่งเหยิง", "การเปิดเผย"],
        meaning_upright="Sudden change, upheaval, chaos, revelation, awakening",
        meaning_upright_th="การเปลี่ยนแปลงกะทันหัน ความปั่นป่วน ความยุ่งเหยิง การเปิดเผย การตื่นรู้",
        meaning_reversed="Personal transformation, fear of change, averting disaster",
        meaning_reversed_th="การแปรสภาพส่วนบุคคล ความกลัวการเปลี่ยนแปลง การหลีกเลี่ยงภัยพิบัติ",
    ),
    TarotCard(
        id="the_star",
        name="The Star",
        name_th="เดอะสตาร์ (ดวงดาว)",
        number=17,
        suit=Suit.MAJOR,
        keywords=["hope", "faith", "purpose", "renewal", "spirituality"],
        keywords_th=["ความหวัง", "ศรัทธา", "จุดมุ่งหมาย", "การฟื้นฟู", "จิตวิญญาณ"],
        meaning_upright="Hope, faith, purpose, renewal, spirituality",
        meaning_upright_th="ความหวัง ศรัทธา จุดมุ่งหมาย การฟื้นฟู จิตวิญญาณ",
        meaning_reversed="Lack of faith, despair, self-trust, disconnection",
        meaning_reversed_th="ขาดศรัทธา ความสิ้นหวัง การเชื่อมั่นในตนเอง การขาดการเชื่อมต่อ",
    ),
    TarotCard(
        id="the_moon",
        name="The Moon",
        name_th="เดอะมูน (ดวงจันทร์)",
        number=18,
        suit=Suit.MAJOR,
        keywords=["illusion", "fear", "anxiety", "subconscious", "intuition"],
        keywords_th=["ภาพลวงตา", "ความกลัว", "ความกังวล", "จิตใต้สำนึก", "สัญชาตญาณ"],
        meaning_upright="Illusion, fear, anxiety, subconscious, intuition",
        meaning_upright_th="ภาพลวงตา ความกลัว ความกังวล จิตใต้สำนึก สัญชาตญาณ",
        meaning_reversed="Release of fear, repressed emotion, inner confusion",
        meaning_reversed_th="การปล่อยความกลัว อารมณ์ที่ถูกกดทับ ความสับสนภายใน",
    ),
    TarotCard(
        id="the_sun",
        name="The Sun",
        name_th="เดอะซัน (ดวงอาทิตย์)",
        number=19,
        suit=Suit.MAJOR,
        keywords=["positivity", "fun", "warmth", "success", "vitality"],
        keywords_th=["ความเป็นบวก", "ความสนุก", "ความอบอุ่น", "ความสำเร็จ", "พลังชีวิต"],
        meaning_upright="Positivity, fun, warmth, success, vitality",
        meaning_upright_th="ความเป็นบวก ความสนุก ความอบอุ่น ความสำเร็จ พลังชีวิต",
        meaning_reversed="Inner child, feeling down, overly optimistic",
        meaning_reversed_th="เด็กภายใน ความรู้สึกแย่ ความคิดบวกเกินไป",
    ),
    TarotCard(
        id="judgement",
        name="Judgement",
        name_th="จัดเมนต์ (การตัดสิน)",
        number=20,
        suit=Suit.MAJOR,
        keywords=["judgement", "rebirth", "inner calling", "absolution"],
        keywords_th=["การตัดสิน", "การเกิดใหม่", "เสียงเรียกภายใน", "การให้อภัย"],
        meaning_upright="Judgement, rebirth, inner calling, absolution",
        meaning_upright_th="การตัดสิน การเกิดใหม่ เสียงเรียกจากภายใน การให้อภัย",
        meaning_reversed="Self-doubt, refusal of self-examination, karma",
        meaning_reversed_th="การสงสัยตนเอง การปฏิเสธการพิจารณาตน กรรม",
    ),
    TarotCard(
        id="the_world",
        name="The World",
        name_th="เดอะเวิลด์ (โลก)",
        number=21,
        suit=Suit.MAJOR,
        keywords=["completion", "integration", "accomplishment", "travel"],
        keywords_th=["การสำเร็จ", "การรวมเข้าด้วยกัน", "ความสำเร็จ", "การเดินทาง"],
        meaning_upright="Completion, integration, accomplishment, travel",
        meaning_upright_th="การสำเร็จ การรวมเข้าด้วยกัน ความสำเร็จ การเดินทาง",
        meaning_reversed="Seeking personal closure, short-cuts, delays",
        meaning_reversed_th="การแสวงหาการปิดฉากส่วนบุคคล ทางลัด ความล่าช้า",
    ),
]


def get_all_cards() -> List[TarotCard]:
    """Get all 78 tarot cards"""
    # For now, return Major Arcana. Minor Arcana will be added in future.
    # This is sufficient for MVP with 22 cards
    return MAJOR_ARCANA


def get_card_by_id(card_id: str) -> Optional[TarotCard]:
    """Get a specific card by ID"""
    for card in get_all_cards():
        if card.id == card_id:
            return card
    return None


def get_random_cards(count: int, exclude_ids: List[str] = None) -> List[TarotCard]:
    """Get random cards for drawing"""
    import secrets
    
    cards = get_all_cards()
    available = [c for c in cards if c.id not in (exclude_ids or [])]
    
    if len(available) < count:
        raise ValueError(f"Not enough cards available. Requested {count}, have {len(available)}")
    
    # Use cryptographically secure random
    return secrets.SystemRandom().sample(available, count)
