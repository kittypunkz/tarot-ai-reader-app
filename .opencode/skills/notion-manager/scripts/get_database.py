#!/usr/bin/env python3
"""
Get database schema and information.
"""

import os
import sys
import json
import argparse
from notion_client import Client


def get_database(database_id):
    """Get database schema and properties."""
    notion = Client(auth=os.environ.get("NOTION_TOKEN"))

    try:
        database = notion.databases.retrieve(database_id=database_id)

        # Simplify schema for easier consumption
        schema = {
            "id": database["id"],
            "title": "".join(
                [t.get("plain_text", "") for t in database.get("title", [])]
            ),
            "url": database["url"],
            "properties": {},
        }

        for prop_name, prop_data in database.get("properties", {}).items():
            prop_info = {"type": prop_data.get("type")}

            # Include options for select/multi_select/status
            prop_type = prop_data.get("type")
            if prop_type == "select":
                options = prop_data.get("select", {}).get("options", [])
                prop_info["options"] = [o.get("name") for o in options]
            elif prop_type == "multi_select":
                options = prop_data.get("multi_select", {}).get("options", [])
                prop_info["options"] = [o.get("name") for o in options]
            elif prop_type == "status":
                options = prop_data.get("status", {}).get("options", [])
                groups = prop_data.get("status", {}).get("groups", [])
                prop_info["options"] = [o.get("name") for o in options]
                prop_info["groups"] = [g.get("name") for g in groups]
            elif prop_type == "relation":
                prop_info["database_id"] = prop_data.get("relation", {}).get(
                    "database_id"
                )
            elif prop_type == "rollup":
                prop_info["relation_property"] = prop_data.get("rollup", {}).get(
                    "relation_property_name"
                )
                prop_info["rollup_property"] = prop_data.get("rollup", {}).get(
                    "rollup_property_name"
                )

            schema["properties"][prop_name] = prop_info

        return schema

    except Exception as e:
        print(f"Error getting database: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Get Notion database schema")
    parser.add_argument("database_id", help="Notion database ID")

    args = parser.parse_args()

    result = get_database(args.database_id)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
