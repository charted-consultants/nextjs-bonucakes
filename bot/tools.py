"""Tool definitions and implementations for Claude to call the Bonucakes CLI API."""

import os
import requests
from typing import Any

API_BASE_URL = os.getenv("API_BASE_URL", "https://bonucakes.com")
CLI_API_KEY = os.getenv("CLI_API_KEY", "")

HEADERS = {
    "X-Api-Key": CLI_API_KEY,
    "Content-Type": "application/json",
}


def _get(path: str, params: dict = None) -> dict:
    url = f"{API_BASE_URL}/api/cli{path}"
    resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


# --- Tool implementations ---

def get_orders_summary(period: str = "week") -> dict:
    """Get revenue and order count summary for a time period (today/week/month/year)."""
    return _get("/orders/summary", {"period": period})


def get_orders(status: str = None, limit: int = 20, page: int = 1) -> dict:
    """List recent orders, optionally filtered by status."""
    params = {"limit": limit, "page": page}
    if status:
        params["status"] = status
    return _get("/orders", params)


def get_products(available: str = None, featured: str = None) -> dict:
    """List all products, optionally filter by available=true/false or featured=true/false."""
    params = {}
    if available is not None:
        params["available"] = available
    if featured is not None:
        params["featured"] = featured
    return _get("/products", params)


def get_product(product_id: str) -> dict:
    """Get details for a single product by ID or slug."""
    return _get(f"/products/{product_id}")


# --- Claude tool schemas ---

TOOL_DEFINITIONS = [
    {
        "name": "get_orders_summary",
        "description": (
            "Get a summary of orders and revenue for a given time period. "
            "Use this to answer questions like 'how are sales going', 'revenue this week', etc."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "period": {
                    "type": "string",
                    "enum": ["today", "week", "month", "year"],
                    "description": "Time period to summarise. Defaults to 'week'.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_orders",
        "description": "List recent orders with optional status filter. Returns order details including customer name, total, and status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["pending", "processing", "completed", "cancelled", "refunded"],
                    "description": "Filter by order status.",
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of orders to return (default 20, max 50).",
                },
                "page": {
                    "type": "integer",
                    "description": "Page number for pagination.",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_products",
        "description": "List all products. Can filter by availability or featured status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "available": {
                    "type": "string",
                    "enum": ["true", "false"],
                    "description": "Filter by availability.",
                },
                "featured": {
                    "type": "string",
                    "enum": ["true", "false"],
                    "description": "Filter by featured status.",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_product",
        "description": "Get full details for a single product by its ID or slug.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {
                    "type": "string",
                    "description": "The product ID (number) or slug (e.g. 'banh-bao').",
                }
            },
            "required": ["product_id"],
        },
    },
]


def call_tool(name: str, inputs: dict) -> Any:
    """Dispatch a tool call by name."""
    dispatch = {
        "get_orders_summary": lambda i: get_orders_summary(**i),
        "get_orders": lambda i: get_orders(**i),
        "get_products": lambda i: get_products(**i),
        "get_product": lambda i: get_product(**i),
    }
    fn = dispatch.get(name)
    if fn is None:
        return {"error": f"Unknown tool: {name}"}
    try:
        return fn(inputs)
    except requests.HTTPError as e:
        return {"error": f"API error {e.response.status_code}: {e.response.text}"}
    except Exception as e:
        return {"error": str(e)}
