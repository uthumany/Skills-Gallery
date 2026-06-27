#!/usr/bin/env python3
"""
Fetch ALL MCP servers from mcpservers.org API (Tson format).
Parses 9,413 servers across 314 pages into categorized JSON.
"""

import json
import urllib.request
import urllib.parse
import time
import os
import sys
from collections import defaultdict

HASH = "f3f3375e085c79e797d446b98adcbbf75becdf48d70930fec0ddc03f1dcdfd0b"
HEADERS = {
    "accept": "application/json, application/x-ndjson",
    "x-tsr-serverfn": "true",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://mcpservers.org/",
}

# Category mapping: mcpservers.org → Skills Gallery categories
CAT_MAP = {
    "search": "search",
    "web-scraping": "browser",
    "communication": "communication",
    "productivity": "productivity",
    "marketing": "other",
    "design": "media",
    "memory": "ai-ml",
    "finance": "finance",
    "development": "development",
    "database": "database",
    "cloud-service": "cloud",
    "cloud-storage": "cloud",
    "file-system": "other",
    "version-control": "development",
    "other": "other",
    "ai-ml": "ai-ml",
}

def parse_tson(obj):
    """Recursively parse Tson (TanStack Object Notation) to plain Python objects."""
    if not isinstance(obj, dict):
        return obj
    
    t = obj.get("t")
    if t == 0:  # number
        s = obj.get("s", 0)
        return int(s) if isinstance(s, (int, float)) and s == int(s) else s
    elif t == 1:  # string
        return obj.get("s", "")
    elif t == 2:  # null/bool
        s = obj.get("s", 0)
        return None if s == 0 else bool(s)
    elif t == 9:  # array
        return [parse_tson(item) for item in obj.get("a", [])]
    elif t == 10:  # object
        p = obj.get("p", {})
        keys = p.get("k", [])
        vals = p.get("v", [])
        result = {}
        for k, v in zip(keys, vals):
            result[k] = parse_tson(v)
        return result
    return obj

def build_payload(page: int, sort: str = "newest", locale: str = "en") -> str:
    """Build the Tson-encoded payload for the server function."""
    payload_obj = {
        "t": {
            "t": 10, "i": 0,
            "p": {
                "k": ["data"],
                "v": [{
                    "t": 10, "i": 1,
                    "p": {
                        "k": ["page", "sort", "locale"],
                        "v": [
                            {"t": 0, "s": page},
                            {"t": 1, "s": sort},
                            {"t": 1, "s": locale},
                        ]
                    },
                    "o": 0
                }]
            },
            "o": 0
        },
        "f": 63,
        "m": []
    }
    return urllib.parse.quote(json.dumps(payload_obj, separators=(',', ':')), safe='')

def fetch_page(page: int, max_retries: int = 3) -> dict:
    """Fetch a single page of MCP servers via API."""
    payload = build_payload(page)
    url = f"https://mcpservers.org/_serverFn/{HASH}?payload={payload}"
    
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode('utf-8')
                tson_data = json.loads(raw)
                # Parse Tson to plain JSON
                parsed = parse_tson(tson_data)
                return parsed
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2 * (attempt + 1))
                continue
            print(f"  Page {page} failed after {max_retries} retries: {e}")
            return None

def extract_servers(data: dict) -> list:
    """Extract server list from parsed API response."""
    if not data:
        return []
    
    result = data.get("result", {})
    if isinstance(result, dict):
        servers = result.get("servers", [])
        if servers:
            return servers
    return []

def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    all_servers = []
    categories = defaultdict(list)
    
    # Test first
    print("Testing API...")
    page1 = fetch_page(1)
    if not page1:
        print("API test failed. Trying with browser session cookie...")
        return
    
    servers = extract_servers(page1)
    if not servers:
        print(f"Could not extract servers. Response keys: {list(page1.keys())}")
        print(f"Raw: {json.dumps(page1)[:500]}")
        return
    
    print(f"Page 1: {len(servers)} servers. Sample: {servers[0].get('name', '?')}")
    
    # Determine total pages
    pagination = page1.get("result", {}).get("data", {}).get("pagination", {})
    total_pages = pagination.get("totalPages", 314)
    total_servers_count = pagination.get("total", 9413)
    print(f"Total pages: {total_pages}, Total servers: {total_servers_count}")
    
    # Fetch all pages
    for page in range(1, total_pages + 1):
        if page > 1:
            data = fetch_page(page)
            servers = extract_servers(data) if data else []
        else:
            data = page1
        
        for srv in servers:
            # Normalize
            name = srv.get("name", "")
            slug = srv.get("slug", "")
            description = srv.get("description", "")[:300]
            url = srv.get("url", "") or srv.get("websiteUrl", "")
            category_raw = srv.get("category", "other")
            category = CAT_MAP.get(category_raw, "other")
            tags = srv.get("tags", [])
            featured = srv.get("featured", False)
            
            server = {
                "name": name,
                "slug": slug,
                "description": description,
                "url": url,
                "category": category,
                "tags": tags,
                "featured": featured,
            }
            all_servers.append(server)
            categories[category].append(server)
        
        if page % 10 == 0:
            print(f"  Page {page}/{total_pages}: {len(all_servers)} servers collected")
            # Save checkpoint
            tmp = {
                "source": "mcpservers.org",
                "source_url": "https://mcpservers.org/all",
                "total_listed": total_servers_count,
                "total_extracted": len(all_servers),
                "total_pages": total_pages,
                "pages_fetched": page,
                "categories": {k: {"name": k.replace("-", " ").title(), "count": len(v), "servers": v}
                               for k, v in sorted(categories.items())},
                "all_servers": all_servers,
            }
            ckpt_path = os.path.join(output_dir, "mcp-servers-checkpoint.json")
            with open(ckpt_path, "w", encoding="utf-8") as f:
                json.dump(tmp, f, indent=2, ensure_ascii=False)
        
        time.sleep(0.3)  # Be nice to the API
    
    # Save final catalog
    catalog = {
        "source": "mcpservers.org",
        "source_url": "https://mcpservers.org/all",
        "total_listed": total_servers_count,
        "total_extracted": len(all_servers),
        "total_pages": total_pages,
        "pages_fetched": min(total_pages, 50),
        "categories": {k: {"name": k.replace("-", " ").title(), "count": len(v), "servers": v}
                       for k, v in sorted(categories.items())},
        "all_servers": all_servers,
    }
    
    out_path = os.path.join(output_dir, "mcp-servers.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Saved {len(all_servers)} servers to {out_path}")
    print(f"  Categories: {len(categories)}")
    for cat_name, servers in sorted(categories.items(), key=lambda x: -len(x[1])):
        print(f"    {cat_name}: {len(servers)}")

if __name__ == "__main__":
    main()
