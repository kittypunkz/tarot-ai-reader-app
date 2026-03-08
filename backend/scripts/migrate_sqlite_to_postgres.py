#!/usr/bin/env python3
"""
Migration script: SQLite to PostgreSQL
Run this once to migrate your local SQLite data to Supabase PostgreSQL
"""

import os
import sys
import sqlite3
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def migrate():
    sqlite_path = "tarot.db"
    pg_url = os.getenv("DATABASE_URL")
    
    if not pg_url:
        print("❌ Error: DATABASE_URL environment variable not set")
        print("Example: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres")
        sys.exit(1)
    
    if not os.path.exists(sqlite_path):
        print(f"❌ Error: SQLite database not found at {sqlite_path}")
        sys.exit(1)
    
    print(f"📦 Migrating from SQLite ({sqlite_path}) to PostgreSQL...")
    print(f"🎯 Target: {pg_url.split('@')[1] if '@' in pg_url else 'unknown'}")
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()
    
    # Import PostgreSQL driver
    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        print("❌ Error: psycopg2-binary not installed")
        print("Run: pip install psycopg2-binary")
        sys.exit(1)
    
    # Connect to PostgreSQL
    try:
        pg_conn = psycopg2.connect(pg_url)
        pg_cur = pg_conn.cursor()
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        sys.exit(1)
    
    # Get list of tables
    sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'alembic_%'")
    tables = [row[0] for row in sqlite_cur.fetchall()]
    
    print(f"\n📋 Found {len(tables)} tables: {', '.join(tables)}\n")
    
    total_rows = 0
    
    for table in tables:
        # Get data from SQLite
        sqlite_cur.execute(f"SELECT * FROM {table}")
        rows = sqlite_cur.fetchall()
        
        if not rows:
            print(f"⏭️  {table}: No data")
            continue
        
        # Get column names
        columns = [description[0] for description in sqlite_cur.description]
        
        # Prepare data for PostgreSQL
        data = []
        for row in rows:
            row_dict = dict(row)
            # Convert boolean strings if needed
            for key, value in row_dict.items():
                if isinstance(value, str) and value.lower() in ('true', 'false'):
                    row_dict[key] = value.lower() == 'true'
            data.append(tuple(row_dict.values()))
        
        # Insert into PostgreSQL
        columns_str = ', '.join(columns)
        placeholders = ', '.join(['%s'] * len(columns))
        
        try:
            execute_values(
                pg_cur,
                f"INSERT INTO {table} ({columns_str}) VALUES %s ON CONFLICT DO NOTHING",
                data
            )
            pg_conn.commit()
            print(f"✅ {table}: Migrated {len(rows)} rows")
            total_rows += len(rows)
        except Exception as e:
            print(f"❌ {table}: Error - {e}")
            pg_conn.rollback()
    
    # Close connections
    sqlite_cur.close()
    sqlite_conn.close()
    pg_cur.close()
    pg_conn.close()
    
    print(f"\n🎉 Migration complete! Total rows migrated: {total_rows}")
    print("\nNext steps:")
    print("1. Update your .env file with DATABASE_URL")
    print("2. Run: alembic stamp head")
    print("3. Restart your backend")

if __name__ == "__main__":
    migrate()
