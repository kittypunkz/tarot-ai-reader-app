#!/usr/bin/env python3
"""
Create a new page in a Notion database or as a standalone page.
"""

import os
import sys
import json
import argparse
from notion_client import Client


def create_page_in_database(database_id, properties, content_blocks=None):
    """Create a new page in a database."""
    notion = Client(auth=os.environ.get("NOTION_TOKEN"))

    kwargs = {"parent": {"database_id": database_id}, "properties": properties}

    if content_blocks:
        kwargs["children"] = content_blocks

    try:
        page = notion.pages.create(**kwargs)
        return {
            "id": page["id"],
            "url": page["url"],
            "created_time": page["created_time"],
            "properties": page.get("properties", {}),
        }
    except Exception as e:
        print(f"Error creating page: {e}", file=sys.stderr)
        sys.exit(1)


def create_standalone_page(parent_page_id, title, content_blocks=None):
    """Create a standalone page under a parent page."""
    notion = Client(auth=os.environ.get("NOTION_TOKEN"))

    properties = {"title": {"title": [{"text": {"content": title}}]}}

    kwargs = {"parent": {"page_id": parent_page_id}, "properties": properties}

    if content_blocks:
        kwargs["children"] = content_blocks

    try:
        page = notion.pages.create(**kwargs)
        return {
            "id": page["id"],
            "url": page["url"],
            "created_time": page["created_time"],
        }
    except Exception as e:
        print(f"Error creating page: {e}", file=sys.stderr)
        sys.exit(1)


def build_property_value(prop_type, value):
    """Build a Notion property value from a simple value."""
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
        return {"url": str(value)}
    elif prop_type == "email":
        return {"email": str(value)}
    elif prop_type == "phone_number":
        return {"phone_number": str(value)}
    elif prop_type == "date":
        # Value can be a date string or dict with start/end
        if isinstance(value, dict):
            return {"date": value}
        else:
            return {"date": {"start": str(value)}}
    else:
        return {prop_type: value}


def main():
    parser = argparse.ArgumentParser(description="Create a new Notion page")
    parser.add_argument("--database-id", "-d", help="Database ID to create page in")
    parser.add_argument("--parent-id", "-p", help="Parent page ID for standalone page")
    parser.add_argument("--title", "-t", help="Page title")
    parser.add_argument(
        "--properties", "-props", help="JSON properties object for database pages"
    )
    parser.add_argument("--content", "-c", help="JSON array of content blocks")

    args = parser.parse_args()

    if not args.database_id and not args.parent_id:
        print(
            "Error: Must specify either --database-id or --parent-id", file=sys.stderr
        )
        sys.exit(1)

    content_blocks = None
    if args.content:
        content_blocks = json.loads(args.content)

    if args.database_id:
        if not args.properties:
            print(
                "Error: --properties required when creating database page",
                file=sys.stderr,
            )
            sys.exit(1)

        properties = json.loads(args.properties)
        result = create_page_in_database(args.database_id, properties, content_blocks)
    else:
        if not args.title:
            print(
                "Error: --title required when creating standalone page", file=sys.stderr
            )
            sys.exit(1)

        result = create_standalone_page(args.parent_id, args.title, content_blocks)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
