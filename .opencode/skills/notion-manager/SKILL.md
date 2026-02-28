---
name: notion-manager
description: Manage Notion pages and databases using the Notion API. Use when the user needs to (1) Create pages in databases, (2) Update page properties especially status fields, (3) Query databases to find items, (4) Append content to pages, (5) Get database schemas. Ideal for tracking tasks, updating work status when tasks complete, and managing database entries programmatically.
---

# Notion Manager

Manage Notion pages and databases via the Notion API. Query databases, create entries, update properties, and append content blocks.

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
cd .opencode/skills/notion-manager/scripts
pip install -r requirements.txt
```

## Core Workflows

### Query a Database

Find pages matching criteria:

```bash
python .opencode/skills/notion-manager/scripts/query_database.py DATABASE_ID
```

With filter (find tasks with status "In Progress"):
```bash
python .opencode/skills/notion-manager/scripts/query_database.py DATABASE_ID \
  --filter '{"property": "Status", "status": {"equals": "In Progress"}}'
```

With multiple filters (AND):
```bash
python .opencode/skills/notion-manager/scripts/query_database.py DATABASE_ID \
  --filter '{
    "and": [
      {"property": "Status", "status": {"equals": "Not Started"}},
      {"property": "Priority", "select": {"equals": "High"}}
    ]
  }'
```

Sort results:
```bash
python .opencode/skills/notion-manager/scripts/query_database.py DATABASE_ID \
  --sorts '[{"property": "Due Date", "direction": "ascending"}]'
```

### Create a Page in Database

Create new entry:

```bash
python .opencode/skills/notion-manager/scripts/create_page.py \
  --database-id DATABASE_ID \
  --properties '{
    "Name": {"title": [{"text": {"content": "New Task"}}]},
    "Status": {"status": {"name": "Not Started"}},
    "Priority": {"select": {"name": "Medium"}}
  }'
```

With content blocks:
```bash
python .opencode/skills/notion-manager/scripts/create_page.py \
  --database-id DATABASE_ID \
  --properties '{"Name": {"title": [{"text": {"content": "Task with Notes"}}]}}' \
  --content '[
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Initial notes..."}}]}}
  ]'
```

**For non-English text (UTF-8)**, use the file-based helper:
```bash
# Create props.json file with UTF-8 encoding
python .opencode/skills/notion-manager/scripts/create_page_from_file.py \
  --database-id DATABASE_ID \
  --properties-file props.json
```

### Update Page Properties

Update status (common for marking work complete):

```bash
python .opencode/skills/notion-manager/scripts/update_page.py PAGE_ID \
  --properties '{"Status": {"status": {"name": "Completed"}}}'
```

Update multiple properties:
```bash
python .opencode/skills/notion-manager/scripts/update_page.py PAGE_ID \
  --properties '{
    "Status": {"status": {"name": "In Progress"}},
    "Assignee": {"people": [{"id": "user-id"}]},
    "Due Date": {"date": {"start": "2024-03-20"}}
  }'
```

**For non-English text (UTF-8)**, use the file-based helper:
```bash
# Create props.json with UTF-8 content
python .opencode/skills/notion-manager/scripts/update_page_from_file.py PAGE_ID --properties-file props.json
```

### Append Content to Page

Add work summary when done:

```bash
python .opencode/skills/notion-manager/scripts/update_page.py PAGE_ID \
  --content '[
    {"object": "block", "type": "divider", "divider": {}},
    {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Work Log"}}]}},
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Completed implementation..."}}]}}
  ]'
```

### Get Database Schema

Inspect database structure and available properties:

```bash
python .opencode/skills/notion-manager/scripts/get_database.py DATABASE_ID
```

## Common Workflows

### Pattern 1: Create Task → Do Work → Mark Complete

```bash
# 1. Create task
python .opencode/skills/notion-manager/scripts/create_page.py \
  --database-id TASKS_DB_ID \
  --properties '{
    "Name": {"title": [{"text": {"content": "Refactor auth module"}}]},
    "Status": {"status": {"name": "In Progress"}}
  }'

# Returns: {"id": "task-page-id", ...}

# 2. Do the work...

# 3. Mark complete with summary
python .opencode/skills/notion-manager/scripts/update_page.py TASK_PAGE_ID \
  --properties '{"Status": {"status": {"name": "Completed"}}}' \
  --content '[
    {"object": "block", "type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": "Refactored auth module. All tests passing."}}], "icon": {"emoji": "✅"}}}
  ]'
```

### Pattern 2: Query Pending Tasks → Process → Update

```bash
# 1. Find pending tasks
python .opencode/skills/notion-manager/scripts/query_database.py TASKS_DB_ID \
  --filter '{"property": "Status", "status": {"equals": "Not Started"}}'

# 2. Process each task...

# 3. Update each task status
python .opencode/skills/notion-manager/scripts/update_page.py TASK_ID \
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
python .opencode/skills/notion-manager/scripts/create_page.py --database-id DATABASE_ID --properties (Get-Content props.json -Raw)
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

## Error Handling

All scripts output JSON to stdout. Errors go to stderr with exit code 1.

Common errors:
- `401 Unauthorized`: Check NOTION_TOKEN
- `403 Forbidden`: Database not shared with integration
- `400 Bad Request`: Invalid property format - check property_types.md
- **Garbled text**: Use JSON files for non-ASCII characters (see above)
