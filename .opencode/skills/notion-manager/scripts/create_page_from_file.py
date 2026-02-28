#!/usr/bin/env python3
"""
Create a new Notion page using properties from a JSON file.
Useful for working with non-English/UTF-8 text that gets corrupted in command line.

Usage:
    python create_page_from_file.py --database-id DATABASE_ID --properties-file props.json
    python create_page_from_file.py --database-id DATABASE_ID --properties-file props.json --content-file content.json

Example props.json:
    {
        "Name": {"title": [{"text": {"content": "ภาษาไทย"}}]},
        "Status": {"select": {"name": "In Progress"}}
    }
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


def main():
    parser = argparse.ArgumentParser(
        description="Create a Notion page from JSON files (supports UTF-8)"
    )
    parser.add_argument("--database-id", "-d", required=True, help="Database ID")
    parser.add_argument(
        "--properties-file",
        "-p",
        required=True,
        help="Path to JSON file containing properties",
    )
    parser.add_argument(
        "--content-file",
        "-c",
        help="Path to JSON file containing content blocks (optional)",
    )

    args = parser.parse_args()

    # Read properties from file with UTF-8 encoding
    try:
        with open(args.properties_file, "r", encoding="utf-8") as f:
            properties = json.load(f)
    except FileNotFoundError:
        print(
            f"Error: Properties file not found: {args.properties_file}", file=sys.stderr
        )
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in properties file: {e}", file=sys.stderr)
        sys.exit(1)

    # Read content blocks if provided
    content_blocks = None
    if args.content_file:
        try:
            with open(args.content_file, "r", encoding="utf-8") as f:
                content_blocks = json.load(f)
        except FileNotFoundError:
            print(
                f"Error: Content file not found: {args.content_file}", file=sys.stderr
            )
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in content file: {e}", file=sys.stderr)
            sys.exit(1)

    # Create the page
    result = create_page_in_database(args.database_id, properties, content_blocks)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
