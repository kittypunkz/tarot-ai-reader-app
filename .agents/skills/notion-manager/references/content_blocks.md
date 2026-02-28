# Notion Content Blocks Reference

Reference for content blocks that can be appended to pages.

## Text Blocks

### Paragraph
```json
{
  "object": "block",
  "type": "paragraph",
  "paragraph": {
    "rich_text": [{"type": "text", "text": {"content": "Regular paragraph text"}}]
  }
}
```

### Heading 1
```json
{
  "object": "block",
  "type": "heading_1",
  "heading_1": {
    "rich_text": [{"type": "text", "text": {"content": "Main Heading"}}]
  }
}
```

### Heading 2
```json
{
  "object": "block",
  "type": "heading_2",
  "heading_2": {
    "rich_text": [{"type": "text", "text": {"content": "Sub Heading"}}]
  }
}
```

### Heading 3
```json
{
  "object": "block",
  "type": "heading_3",
  "heading_3": {
    "rich_text": [{"type": "text", "text": {"content": "Sub-sub Heading"}}]
  }
}
```

### Bulleted List Item
```json
{
  "object": "block",
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": [{"type": "text", "text": {"content": "Bullet point"}}]
  }
}
```

### Numbered List Item
```json
{
  "object": "block",
  "type": "numbered_list_item",
  "numbered_list_item": {
    "rich_text": [{"type": "text", "text": {"content": "Numbered item"}}]
  }
}
```

### To-do
```json
{
  "object": "block",
  "type": "to_do",
  "to_do": {
    "rich_text": [{"type": "text", "text": {"content": "Task to complete"}}],
    "checked": false
  }
}
```

### Quote
```json
{
  "object": "block",
  "type": "quote",
  "quote": {
    "rich_text": [{"type": "text", "text": {"content": "Quoted text"}}]
  }
}
```

### Callout
```json
{
  "object": "block",
  "type": "callout",
  "callout": {
    "rich_text": [{"type": "text", "text": {"content": "Important note"}}],
    "icon": {"emoji": "💡"}
  }
}
```

## Code Block
```json
{
  "object": "block",
  "type": "code",
  "code": {
    "rich_text": [{"type": "text", "text": {"content": "console.log('Hello');"}}],
    "language": "javascript"
  }
}
```

Common languages: `javascript`, `python`, `json`, `bash`, `html`, `css`, `sql`

## Divider
```json
{
  "object": "block",
  "type": "divider",
  "divider": {}
}
```

## Example: Appending Work Summary

When agent work is done, append summary to a task:

```bash
python scripts/update_page.py TASK_PAGE_ID --content '[
  {
    "object": "block",
    "type": "divider",
    "divider": {}
  },
  {
    "object": "block",
    "type": "heading_2",
    "heading_2": {
      "rich_text": [{"type": "text", "text": {"content": "Work Completed"}}]
    }
  },
  {
    "object": "block",
    "type": "paragraph",
    "paragraph": {
      "rich_text": [{"type": "text", "text": {"content": "Summary of work done..."}}]
    }
  },
  {
    "object": "block",
    "type": "callout",
    "callout": {
      "rich_text": [{"type": "text", "text": {"content": "Status updated to: Completed"}}],
      "icon": {"emoji": "✅"}
    }
  }
]'
```
