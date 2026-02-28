# Notion Property Types Reference

Quick reference for Notion database property types and how to use them.

## Basic Property Types

### title
Page title. Each database has exactly one title property.
```json
{"Name": {"title": [{"text": {"content": "My Page"}}]}}
```

### rich_text
Plain text content.
```json
{"Description": {"rich_text": [{"text": {"content": "Some description"}}]}}
```

### number
Numeric value (integer or decimal).
```json
{"Price": {"number": 99.99}}
```

### select
Single selection from predefined options.
```json
{"Status": {"select": {"name": "In Progress"}}}
```

### multi_select
Multiple selections from predefined options.
```json
{"Tags": {"multi_select": [{"name": "Important"}, {"name": "Urgent"}]}}
```

### status
Special property for tracking state (Notion's newer status property).
```json
{"Status": {"status": {"name": "Done"}}}
```

### checkbox
Boolean true/false.
```json
{"Completed": {"checkbox": true}}
```

### date
Date or date range.
```json
{"Due Date": {"date": {"start": "2024-03-15"}}}
```
Date range:
```json
{"Duration": {"date": {"start": "2024-03-15", "end": "2024-03-20"}}}
```

### url
Web URL.
```json
{"Link": {"url": "https://example.com"}}
```

### email
Email address.
```json
{"Email": {"email": "user@example.com"}}
```

### phone_number
Phone number.
```json
{"Phone": {"phone_number": "+1 555-1234"}}
```

## Advanced Property Types

### relation
Link to pages in another database.
```json
{"Project": {"relation": [{"id": "page-id-here"}]}}
```

### rollup
Aggregate data from related pages (read-only, computed from relation).

### formula
Computed value based on formula (read-only).

### created_time
Timestamp when page was created (read-only).

### created_by
User who created page (read-only).

### last_edited_time
Timestamp of last edit (read-only).

### last_edited_by
User who last edited (read-only).

### people
Notion users.
```json
{"Assignee": {"people": [{"id": "user-id-here"}]}}
```

### files
Files and media.

## Common Patterns

### Updating Status (for agent work tracking)
```python
properties = {
    "Status": {"status": {"name": "Completed"}}
}
```

Or using scripts/update_page.py:
```bash
python update_page.py PAGE_ID --properties '{"Status": {"status": {"name": "In Progress"}}}'
```

### Creating Task with Multiple Properties
```json
{
  "Name": {"title": [{"text": {"content": "Fix bug #123"}}]},
  "Status": {"status": {"name": "Not Started"}},
  "Priority": {"select": {"name": "High"}},
  "Due Date": {"date": {"start": "2024-03-15"}},
  "Tags": {"multi_select": [{"name": "Bug"}, {"name": "Backend"}]}
}
```

### Querying by Status
```bash
python query_database.py DATABASE_ID --filter '{"property": "Status", "status": {"equals": "In Progress"}}'
```
