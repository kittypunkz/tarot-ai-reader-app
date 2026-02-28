#!/usr/bin/env python3
"""
Direct Notion API helper - Use when notion_client library has issues
This script provides a simple wrapper around the Notion REST API using urllib
"""

import urllib.request
import json
import os
import sys

# Get token from environment
NOTION_TOKEN = os.environ.get('NOTION_TOKEN')
if not NOTION_TOKEN:
    print("Error: NOTION_TOKEN environment variable not set", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    'Authorization': f'Bearer {NOTION_TOKEN}',
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
}


def api_call(endpoint, method='GET', data=None):
    """Make a call to the Notion API"""
    url = f'https://api.notion.com/v1/{endpoint}'
    
    if data:
        req_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
    else:
        req_data = None
    
    req = urllib.request.Request(url, data=req_data, headers=HEADERS, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read().decode('utf-8'))
        print(f"API Error: {e.code} - {error_body.get('message', 'Unknown error')}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


def query_database(database_id, filter=None, sorts=None):
    """Query a database with optional filter and sorts"""
    data = {}
    if filter:
        data['filter'] = filter
    if sorts:
        data['sorts'] = sorts
    
    return api_call(f'databases/{database_id}/query', 'POST', data)


def get_page_blocks(page_id):
    """Get all blocks (content) from a page"""
    return api_call(f'blocks/{page_id}/children')


def append_blocks(page_id, blocks):
    """Append blocks to a page"""
    return api_call(f'blocks/{page_id}/children', 'PATCH', {'children': blocks})


def update_page_properties(page_id, properties):
    """Update page properties"""
    return api_call(f'pages/{page_id}', 'PATCH', {'properties': properties})


def search_notion(query=""):
    """Search pages and databases"""
    return api_call('search', 'POST', {'query': query})


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Notion API Helper')
    parser.add_argument('command', choices=['query', 'blocks', 'search', 'update'], 
                       help='Command to run')
    parser.add_argument('--id', help='Page or Database ID')
    parser.add_argument('--filter', help='JSON filter for query')
    parser.add_argument('--query', default='', help='Search query')
    parser.add_argument('--properties', help='JSON properties for update')
    
    args = parser.parse_args()
    
    if args.command == 'query':
        if not args.id:
            print("Error: --id (database_id) required for query", file=sys.stderr)
            sys.exit(1)
        filter_data = json.loads(args.filter) if args.filter else None
        result = query_database(args.id, filter=filter_data)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif args.command == 'blocks':
        if not args.id:
            print("Error: --id (page_id) required for blocks", file=sys.stderr)
            sys.exit(1)
        result = get_page_blocks(args.id)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif args.command == 'search':
        result = search_notion(args.query)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif args.command == 'update':
        if not args.id or not args.properties:
            print("Error: --id and --properties required for update", file=sys.stderr)
            sys.exit(1)
        props = json.loads(args.properties)
        result = update_page_properties(args.id, props)
        print(json.dumps(result, indent=2, ensure_ascii=False))
