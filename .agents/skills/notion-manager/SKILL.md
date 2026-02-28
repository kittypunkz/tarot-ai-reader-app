---
name: notion-manager
description: Manage Notion pages and databases using the Notion API. Use when Kimi needs to (1) Create pages in databases, (2) Update page properties especially status fields, (3) Query databases to find items, (4) Append content to pages, (5) Get database schemas. Ideal for tracking tasks, updating work status when agent tasks complete, and managing database entries programmatically.
---

# Notion Manager

Manage Notion pages and databases via the Notion API. Query databases, create entries, update properties, and append content blocks.

## Quick Reference: Which Method to Use?

| Task | Use This | When to Use |
|------|----------|-------------|
| Query database | `python scripts/notion_api.py query --id DB_ID` | Scripts fail or need simple query |
| Get page content | `python scripts/notion_api.py blocks --id PAGE_ID` | Checking what's in a page |
| Append content | Direct API Python code | Adding complex content with formatting |
| Update properties | `python scripts/notion_api.py update --id PAGE_ID --properties '{...}'` | Quick status updates |
| Search | `python scripts/notion_api.py search --query "keyword"` | Finding IDs |
| **Complex operations** | Direct API Python (see section below) | Full control, no limitations |

> 💡 **Rule of thumb:** If the helper scripts don't work or you get `'query' attribute` errors, use the **Direct API Access** method.

## Prerequisites

### 1. Notion Integration Token

You need a Notion integration token. To get one:

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Agent Manager")
4. Select the workspace
5. Copy the "Internal Integration Token"

Set it as an environment variable:
```bash
export NOTION_TOKEN="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 2. Share Database with Integration

For each database you want to manage:

1. Open the database in Notion
2. Click the "..." menu (top-right)
3. Click "Add connections"
4. Select your integration
5. Confirm

### 3. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

## Core Workflows

### Query a Database

Find pages matching criteria:

```bash
python scripts/query_database.py DATABASE_ID
```

With filter (find tasks with status "In Progress"):
```bash
python scripts/query_database.py DATABASE_ID \
  --filter '{"property": "Status", "status": {"equals": "In Progress"}}'
```

With multiple filters (AND):
```bash
python scripts/query_database.py DATABASE_ID \
  --filter '{
    "and": [
      {"property": "Status", "status": {"equals": "Not Started"}},
      {"property": "Priority", "select": {"equals": "High"}}
    ]
  }'
```

Sort results:
```bash
python scripts/query_database.py DATABASE_ID \
  --sorts '[{"property": "Due Date", "direction": "ascending"}]'
```

### Create a Page in Database

Create new entry:

```bash
python scripts/create_page.py \
  --database-id DATABASE_ID \
  --properties '{
    "Name": {"title": [{"text": {"content": "New Task"}}]},
    "Status": {"status": {"name": "Not Started"}},
    "Priority": {"select": {"name": "Medium"}}
  }'
```

With content blocks:
```bash
python scripts/create_page.py \
  --database-id DATABASE_ID \
  --properties '{"Name": {"title": [{"text": {"content": "Task with Notes"}}]}}' \
  --content '[
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Initial notes..."}}]}}
  ]'
```

**For non-English text (UTF-8)**, use the file-based helper:
```bash
# Create props.json file with UTF-8 encoding
python scripts/create_page_from_file.py \
  --database-id DATABASE_ID \
  --properties-file props.json
```

### Update Page Properties

Update status (common for marking work complete):

```bash
python scripts/update_page.py PAGE_ID \
  --properties '{"Status": {"status": {"name": "Completed"}}}'
```

Update multiple properties:
```bash
python scripts/update_page.py PAGE_ID \
  --properties '{
    "Status": {"status": {"name": "In Progress"}},
    "Assignee": {"people": [{"id": "user-id"}]},
    "Due Date": {"date": {"start": "2024-03-20"}}
  }'
```

**For non-English text (UTF-8)**, use the file-based helper:
```bash
# Create props.json with UTF-8 content
python scripts/update_page_from_file.py PAGE_ID --properties-file props.json
```

### Append Content to Page

Add work summary when done:

```bash
python scripts/update_page.py PAGE_ID \
  --content '[
    {"object": "block", "type": "divider", "divider": {}},
    {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Work Log"}}]}},
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Completed implementation..."}}]}}
  ]'
```

### Get Database Schema

Inspect database structure and available properties:

```bash
python scripts/get_database.py DATABASE_ID
```

## Common Agent Workflows

### Pattern 1: Create Task → Do Work → Mark Complete

```bash
# 1. Create task
python scripts/create_page.py \
  --database-id TASKS_DB_ID \
  --properties '{
    "Name": {"title": [{"text": {"content": "Refactor auth module"}}]},
    "Status": {"status": {"name": "In Progress"}}
  }'

# Returns: {"id": "task-page-id", ...}

# 2. Do the work...

# 3. Mark complete with summary
python scripts/update_page.py TASK_PAGE_ID \
  --properties '{"Status": {"status": {"name": "Completed"}}}' \
  --content '[
    {"object": "block", "type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Refactored auth module. All tests passing."}}], "icon": {"emoji": "✅"}}}
  ]'
```

### Pattern 2: Query Pending Tasks → Process → Update

```bash
# 1. Find pending tasks
python scripts/query_database.py TASKS_DB_ID \
  --filter '{"property": "Status", "status": {"equals": "Not Started"}}'

# 2. Process each task...

# 3. Update each task status
python scripts/update_page.py TASK_ID \
  --properties '{"Status": {"status": {"name": "In Progress"}}}'
```

## Finding IDs

### Database ID
From URL: `https://www.notion.so/workspace/DATABASE_ID?v=...`

### Page ID
From URL: `https://www.notion.so/workspace/PAGE_ID`

Or get from query results - the `id` field of each result.

## Property Types Reference

See [references/property_types.md](references/property_types.md) for:
- All property type formats
- Common property update patterns
- Filter syntax examples

## Content Blocks Reference

See [references/content_blocks.md](references/content_blocks.md) for:
- All block types (paragraphs, headings, lists, code, etc.)
- Formatting options
- Examples for appending work summaries

## Filter Operators

Common filter operators by property type:

**status/select:**
- `"equals"`: Exact match
- `"does_not_equal"`: Exclude value
- `"is_empty"`: true/false

**title/rich_text:**
- `"contains"`: Substring match
- `"does_not_contain"`: Exclude substring
- `"starts_with"`: Prefix match
- `"ends_with"`: Suffix match

**number:**
- `"equals"`, `"does_not_equal"`
- `"greater_than"`, `"less_than"`
- `"greater_than_or_equal_to"`, `"less_than_or_equal_to"`

**checkbox:**
- `"equals"`: true/false

**date:**
- `"equals"`, `"before"`, `"after"`
- `"on_or_before"`, `"on_or_after"`
- `"past_week"`, `"past_month"`, `"past_year"`: true (relative dates)

**Combine filters:**
```json
{"and": [FILTER1, FILTER2]}
{"or": [FILTER1, FILTER2]}
```

## Working with Non-English Text (UTF-8)

When working with non-English characters (e.g., Thai, Chinese, Japanese), **PowerShell may corrupt the text** when passed as command line arguments.

### Solution: Use JSON Files

Instead of inline JSON, save your properties to a file:

```bash
# Save to file
echo '{"Name": {"title": [{"text": {"content": "ภาษาไทย"}}]}}' > props.json

# Use file
python scripts/create_page.py --database-id DATABASE_ID --properties (Get-Content props.json -Raw)
```

### Alternative: Use Python Directly

For complex text, create a Python script:

```python
from notion_client import Client
import os

notion = Client(auth=os.environ.get("NOTION_TOKEN"))

notion.pages.update(
    page_id="PAGE_ID",
    properties={
        "Description": {
            "rich_text": [{"text": {"content": "ภาษาไทย"}}]
        }
    }
)
```

## Direct API Access (When Scripts Don't Work)

If the helper scripts fail or you need more control, use **direct Python API calls** with `urllib.request`:

### Quick Example

```python
import urllib.request
import json
import os

token = os.environ.get('NOTION_TOKEN')
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
}

def notion_api(endpoint, method='GET', data=None):
    url = f'https://api.notion.com/v1/{endpoint}'
    req_data = json.dumps(data, ensure_ascii=False).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

# Query a database
results = notion_api('databases/DATABASE_ID/query', 'POST', {})

# Get page content
blocks = notion_api('blocks/PAGE_ID/children')

# Append blocks to page
notion_api('blocks/PAGE_ID/children', 'PATCH', {
    'children': [
        {'object': 'block', 'type': 'heading_2', 'heading_2': {'rich_text': [{'type': 'text', 'text': {'content': 'New Section'}}]}},
        {'object': 'block', 'type': 'paragraph', 'paragraph': {'rich_text': [{'type': 'text', 'text': {'content': 'Content here...'}}]}}
    ]
})
```

### Common Operations

**Search all pages/databases:**
```python
# Search for anything
results = notion_api('search', 'POST', {'query': 'My Project'})

# List database entries
results = notion_api('databases/DB_ID/query', 'POST', {
    'filter': {'property': 'Status', 'status': {'equals': 'Not Started'}}
})
```

**Update page properties:**
```python
notion_api('pages/PAGE_ID', 'PATCH', {
    'properties': {
        'Status': {'status': {'name': 'Completed'}}
    }
})
```

### Why Use Direct API?

- ✅ **Always works** - No library dependencies
- ✅ **Full API coverage** - Access all Notion API endpoints
- ✅ **No PowerShell escaping issues** with complex JSON
- ✅ **Better error messages** from Notion API directly

### PowerShell Usage

```powershell
$env:NOTION_TOKEN = "your_token_here"
python -c "
import urllib.request
import json
import os

token = os.environ.get('NOTION_TOKEN')
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
}

url = 'https://api.notion.com/v1/databases/YOUR_DB_ID/query'
req = urllib.request.Request(url, data=b'{}', headers=headers, method='POST')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode('utf-8'))
    print(f'Found {len(data[\"results\"])} items')
"
```

---

## Troubleshooting

### Problem: `notion_client` library errors

**Error:** `'DatabasesEndpoint' object has no attribute 'query'`

**Solution:** Use Direct API Access (see section above). The helper scripts may have compatibility issues with newer Python versions.

```bash
# Instead of:
python scripts/query_database.py DB_ID

# Use direct API:
python scripts/notion_api.py query --id DB_ID
```

### Problem: PowerShell corrupts Thai/Chinese text

**Error:** Garbled text when passing JSON with non-ASCII characters

**Solution:** Use file-based approach or Python directly:

```python
# Save to file first
data = {"Name": {"title": [{"text": {"content": "ภาษาไทย"}}]}}
with open('props.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)

# Use in command
python scripts/notion_api.py update --id PAGE_ID --properties (Get-Content props.json)
```

### Problem: Can't find Database/Page ID

**Solution:** Use the search command:

```bash
python scripts/notion_api.py search --query "My Database"
```

### Problem: 403 Forbidden error

**Cause:** Database/page not shared with the integration

**Solution:** 
1. Open the database/page in Notion
2. Click "..." menu (top-right)
3. Click "Add connections"
4. Select your integration
5. Confirm

---

## Error Handling

All scripts output JSON to stdout. Errors go to stderr with exit code 1.

Common errors:
- `401 Unauthorized`: Check NOTION_TOKEN
- `403 Forbidden`: Database not shared with integration
- `400 Bad Request`: Invalid property format - check property_types.md
- **Garbled text**: Use JSON files for non-ASCII characters (see above)
- **'query' attribute error**: The notion_client library may have compatibility issues - use Direct API Access instead
