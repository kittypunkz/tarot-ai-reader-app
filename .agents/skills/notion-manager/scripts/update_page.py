#!/usr/bin/env python3
"""
Update a Notion page's properties and/or append content blocks.
"""
import os
import sys
import json
import argparse
from notion_client import Client

def update_page_properties(page_id, properties):
    """Update page properties."""
    notion = Client(auth=os.environ.get("NOTION_TOKEN"))
    
    try:
        page = notion.pages.update(page_id=page_id, properties=properties)
        return {
            "id": page["id"],
            "url": page["url"],
            "last_edited_time": page["last_edited_time"],
            "properties": page.get("properties", {})
        }
    except Exception as e:
        print(f"Error updating page: {e}", file=sys.stderr)
        sys.exit(1)

def append_page_content(page_id, blocks):
    """Append content blocks to a page."""
    notion = Client(auth=os.environ.get("NOTION_TOKEN"))
    
    try:
        response = notion.blocks.children.append(block_id=page_id, children=blocks)
        return {
            "appended_blocks": len(response.get("results", [])),
            "blocks": response.get("results", [])
        }
    except Exception as e:
        print(f"Error appending content: {e}", file=sys.stderr)
        sys.exit(1)

def build_property_update(prop_type, value):
    """Build a property update for Notion API."""
    if prop_type == "title":
        return {"title": [{"text": {"content": str(value)}}]}
    elif prop_type == "rich_text":
        return {"rich_text": [{"text": {"content": str(value)}}]}
    elif prop_type == "select":
        return {"select": {"name": str(value)}}
    elif prop_type == "multi_select":
        if isinstance(value, str):
            value = [v.strip() for v in value.split(",")]
        return {"multi_select": [{"name": v} for v in value]}
    elif prop_type == "status":
        return {"status": {"name": str(value)}}
    elif prop_type == "checkbox":
        return {"checkbox": bool(value)}
    elif prop_type == "number":
        return {"number": float(value) if "." in str(value) else int(value)}
    elif prop_type == "url":
        return {"url": str(value) if value else None}
    elif prop_type == "email":
        return {"email": str(value) if value else None}
    elif prop_type == "phone_number":
        return {"phone_number": str(value) if value else None}
    elif prop_type == "date":
        if isinstance(value, dict):
            return {"date": value}
        elif value:
            return {"date": {"start": str(value)}}
        else:
            return {"date": None}
    else:
        return {prop_type: value}

def main():
    parser = argparse.ArgumentParser(description="Update a Notion page")
    parser.add_argument("page_id", help="Notion page ID")
    parser.add_argument("--properties", "-p", help="JSON object of properties to update")
    parser.add_argument("--content", "-c", help="JSON array of content blocks to append")
    
    args = parser.parse_args()
    
    if not args.properties and not args.content:
        print("Error: Must specify either --properties or --content", file=sys.stderr)
        sys.exit(1)
    
    results = {}
    
    if args.properties:
        props = json.loads(args.properties)
        results["properties"] = update_page_properties(args.page_id, props)
    
    if args.content:
        blocks = json.loads(args.content)
        results["content"] = append_page_content(args.page_id, blocks)
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
