@echo off
chcp 65001 >nul
echo ========================================
echo TAROT API TEST
echo ========================================
echo.
echo Testing with selected cards:
echo   - The Emperor (upright)
echo   - Justice (reversed) 
echo   - The Fool (upright)
echo.
echo This will take 30-60 seconds for AI response...
echo ========================================
echo.

cd /d "%~dp0"
.\venv\Scripts\python -c "
import asyncio
import httpx
import json

async def test():
    async with httpx.AsyncClient(timeout=120.0) as client:
        print('Step 1: Sending cards to API...')
        print()
        
        resp = await client.post(
            'http://localhost:8000/api/v1/draw-cards',
            json={
                'session_id': 'test_session_001',
                'spread_type': 'three_ppf',
                'question': 'ควรเปลี่ยนงานดีไหม',
                'language': 'th',
                'selected_cards': [
                    {'card_id': 'the_emperor', 'is_reversed': False, 'position': 0},
                    {'card_id': 'justice', 'is_reversed': True, 'position': 1},
                    {'card_id': 'the_fool', 'is_reversed': False, 'position': 2}
                ]
            }
        )
        
        if resp.status_code == 200:
            result = resp.json()
            print('✅ SUCCESS!')
            print(f'Reading ID: {result[\"reading_id\"]}')
            print()
            print('CARDS RETURNED:')
            print('-' * 50)
            for i, card in enumerate(result['cards']):
                orientation = 'กลับหัว' if card['orientation'] == 'reversed' else 'หงายหน้า'
                print(f'{i+1}. {card[\"card_name_th\"]} ({card[\"card_name\"]}) - {orientation}')
            print('-' * 50)
            print()
            print('AI INTERPRETATION:')
            print('=' * 50)
            interp = result.get('interpretation_th', 'No interpretation returned!')
            print(interp)
            print('=' * 50)
            print()
            
            # Check if interpretation mentions wrong cards
            wrong_cards = []
            actual_cards = ['the_emperor', 'justice', 'the_fool']
            actual_names = ['ดิเอ็มเพอร์เรอร์', 'จัสติส', 'เดอะฟูล']
            
            if 'the_lovers' in interp.lower() or 'the_lover' in interp.lower():
                wrong_cards.append('The Lovers')
            if 'wheel_of_fortune' in interp.lower() or 'wheel of fortune' in interp.lower():
                wrong_cards.append('Wheel of Fortune')
            if 'the_star' in interp.lower():
                wrong_cards.append('The Star')
                
            if wrong_cards:
                print('❌ ERROR: AI mentioned wrong cards!')
                print(f'   Cards that should NOT be here: {', '.join(wrong_cards)}')
                print('   Expected: The Emperor, Justice, The Fool only!')
            else:
                print('✅ Interpretation mentions correct cards only!')
        else:
            print(f'❌ FAILED: Status {resp.status_code}')
            print(f'Error: {resp.text}')

asyncio.run(test())
"

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
pause
