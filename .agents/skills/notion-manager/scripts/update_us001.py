import urllib.request
import json
import os

token = os.environ.get('NOTION_TOKEN')
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
}

with open('openrouter_content.json', 'r', encoding='utf-8') as f:
    blocks = json.load(f)

url = 'https://api.notion.com/v1/blocks/315735cd-ed99-8126-8132-cbc44f15720b/children'
data = {'children': blocks}
req_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
req = urllib.request.Request(url, data=req_data, headers=headers, method='PATCH')
with urllib.request.urlopen(req) as response:
    result = json.loads(response.read().decode('utf-8'))
    print('✅ Successfully updated US-001 with OpenRouter recommendations')
    results = result.get('results', [])
    print(f'Added {len(results)} blocks')
