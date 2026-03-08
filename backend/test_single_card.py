import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(timeout=120.0) as client:
        print("Sending 1 card to API...")
        print()
        
        resp = await client.post(
            "http://localhost:8000/api/v1/draw-cards",
            json={
                "session_id": "test_single_001",
                "spread_type": "single",
                "question": "ควรลงทุนในอสังหาริมทรัพย์ไหม",
                "language": "th",
                "selected_cards": [
                    {"card_id": "the_star", "is_reversed": False, "position": 0}
                ]
            }
        )
        
        if resp.status_code == 200:
            result = resp.json()
            print("✅ SUCCESS!")
            print(f"Reading ID: {result['reading_id']}")
            print()
            print("CARD RETURNED:")
            print("-" * 50)
            card = result["cards"][0]
            print(f"Name: {card['card_name_th']}")
            print(f"English: {card['card_name']}")
            print(f"Orientation: {'กลับหัว' if card['orientation'] == 'reversed' else 'หงายหน้า'}")
            print("-" * 50)
            print()
            print("AI INTERPRETATION:")
            print("=" * 50)
            interp = result.get("interpretation_th", "No interpretation!")
            print(interp)
            print("=" * 50)
            print()
            
            # Count how many cards AI mentions
            cards_in_interp = []
            if "the_star" in interp.lower() or "เดอะสตาร์" in interp or "สตาร์" in interp:
                cards_in_interp.append("The Star ✓")
            if "the_lovers" in interp.lower() or "the_lover" in interp.lower():
                cards_in_interp.append("The Lovers ✗ WRONG!")
            if "wheel_of_fortune" in interp.lower():
                cards_in_interp.append("Wheel of Fortune ✗ WRONG!")
            if "death" in interp.lower():
                cards_in_interp.append("Death ✗ WRONG!")
                
            print("Cards mentioned in interpretation:")
            for c in cards_in_interp:
                print(f"  - {c}")
                
            if len(cards_in_interp) == 1 and "The Star" in cards_in_interp[0]:
                print()
                print("✅ PERFECT: AI only mentioned the correct card!")
            else:
                print()
                print("❌ ERROR: AI mentioned wrong cards or not the selected card!")
        else:
            print(f"❌ FAILED: Status {resp.status_code}")
            print(f"Error: {resp.text}")

if __name__ == "__main__":
    asyncio.run(test())
