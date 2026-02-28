#!/usr/bin/env python3
"""
Update a Notion page using properties from a JSON file.
Useful for working with non-English/UTF-8 text that gets corrupted in command line.

Usage:
    python update_page_from_file.py PAGE_ID --properties-file props.json
    python update_page_from_file.py PAGE_ID --content-file content.json
    python update_page_from_file.py PAGE_ID --properties-file props.json --content-file content.json

Example props.json:
    {
        "Status": {"select": {"name": "Done"}},
        "Description": {"rich_text": [{"text": {"content": "ภาษาไทย"}}]}
    }
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
            "last_edited_time": page["last_edited_time"]
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


def main():
    parser = argparse.ArgumentParser(
        description="Update a Notion page from JSON files (supports UTF-8)"
    )
    parser.add_argument("page_id", help="Notion page ID")
    parser.add_argument("--properties-file", "-p", 
                        help="Path to JSON file containing properties to update")
    parser.add_argument("--content-file", "-c", 
                        help="Path to JSON file containing content blocks to append")
    
    args = parser.parse_args()
    
    if not args.properties_file and not args.content_file:
        print("Error: Must specify either --properties-file or --content-file", file=sys.stderr)
        sys.exit(1)
    
    results = {}
    
    # Update properties if file provided
    if args.properties_file:
        try:
            with open(args.properties_file, 'r', encoding='utf-8') as f:
                properties = json.load(f)
        except FileNotFoundError:
            print(f"Error: Properties file not found: {args.properties_file}", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in properties file: {e}", file=sys.stderr)
            sys.exit(1)
        
        results["properties"] = update_page_properties(args.page_id, properties)
    
    # Append content if file provided
    if args.content_file:
        try:
            with open(args.content_file, 'r', encoding='utf-8') as f:
                blocks = json.load(f)
        except FileNotFoundError:
            print(f"Error: Content file not found: {args.content_file}", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in content file: {e}", file=sys.stderr)
            sys.exit(1)
        
        results["content"] = append_page_content(args.page_id, blocks)
    
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
