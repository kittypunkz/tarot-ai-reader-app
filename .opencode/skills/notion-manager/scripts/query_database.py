#!/usr/bin/env python3
"""
Query a Notion database with optional filters.
Returns matching pages with their properties.
"""

import os
import sys
import json
import argparse
from notion_client import Client


def query_database(database_id, filter_json=None, sorts_json=None, page_size=100):
    """Query a Notion database and return results."""
    notion = Client(auth=os.environ.get("NOTION_TOKEN"))

    kwargs = {"database_id": database_id, "page_size": page_size}

    if filter_json:
        kwargs["filter"] = json.loads(filter_json)

    if sorts_json:
        kwargs["sorts"] = json.loads(sorts_json)

    try:
        response = notion.databases.query(**kwargs)

        # Simplify results for easier consumption
        results = []
        for page in response.get("results", []):
            simplified = {
                "id": page["id"],
                "url": page["url"],
                "created_time": page["created_time"],
                "last_edited_time": page["last_edited_time"],
                "properties": {},
            }

            # Extract property values
            for prop_name, prop_data in page.get("properties", {}).items():
                prop_type = prop_data.get("type")

                if prop_type == "title":
                    titles = prop_data.get("title", [])
                    simplified["properties"][prop_name] = "".join(
                        [t.get("plain_text", "") for t in titles]
                    )
                elif prop_type == "rich_text":
                    texts = prop_data.get("rich_text", [])
                    simplified["properties"][prop_name] = "".join(
                        [t.get("plain_text", "") for t in texts]
                    )
                elif prop_type == "select":
                    select = prop_data.get("select")
                    simplified["properties"][prop_name] = (
                        select.get("name") if select else None
                    )
                elif prop_type == "multi_select":
                    multi = prop_data.get("multi_select", [])
                    simplified["properties"][prop_name] = [m.get("name") for m in multi]
                elif prop_type == "status":
                    status = prop_data.get("status")
                    simplified["properties"][prop_name] = (
                        status.get("name") if status else None
                    )
                elif prop_type == "checkbox":
                    simplified["properties"][prop_name] = prop_data.get(
                        "checkbox", False
                    )
                elif prop_type == "number":
                    simplified["properties"][prop_name] = prop_data.get("number")
                elif prop_type == "date":
                    date = prop_data.get("date")
                    if date:
                        simplified["properties"][prop_name] = {
                            "start": date.get("start"),
                            "end": date.get("end"),
                        }
                    else:
                        simplified["properties"][prop_name] = None
                elif prop_type == "url":
                    simplified["properties"][prop_name] = prop_data.get("url")
                elif prop_type == "email":
                    simplified["properties"][prop_name] = prop_data.get("email")
                elif prop_type == "phone_number":
                    simplified["properties"][prop_name] = prop_data.get("phone_number")
                elif prop_type == "relation":
                    relations = prop_data.get("relation", [])
                    simplified["properties"][prop_name] = [
                        r.get("id") for r in relations
                    ]
                else:
                    simplified["properties"][prop_name] = prop_data.get(prop_type)

            results.append(simplified)

        return {
            "results": results,
            "has_more": response.get("has_more", False),
            "next_cursor": response.get("next_cursor"),
        }

    except Exception as e:
        print(f"Error querying database: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Query a Notion database")
    parser.add_argument("database_id", help="Notion database ID")
    parser.add_argument("--filter", "-f", help="JSON filter criteria")
    parser.add_argument("--sorts", "-s", help="JSON sort criteria")
    parser.add_argument(
        "--page-size", "-n", type=int, default=100, help="Max results to return"
    )

    args = parser.parse_args()

    result = query_database(args.database_id, args.filter, args.sorts, args.page_size)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
