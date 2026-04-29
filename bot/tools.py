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
    return _get("/orders/summary", {"period": period})


def get_orders(status: str = None, limit: int = 20, page: int = 1) -> dict:
    params = {"limit": limit, "page": page}
    if status:
        params["status"] = status
    return _get("/orders", params)


def get_order(order_id: str) -> dict:
    """Get full details for a single order including address and items."""
    return _get(f"/orders/{order_id}")


def get_products(available: str = None, featured: str = None) -> dict:
    params = {}
    if available is not None:
        params["available"] = available
    if featured is not None:
        params["featured"] = featured
    return _get("/products", params)


def get_product(product_id: str) -> dict:
    return _get(f"/products/{product_id}")


def get_customers(search: str = None, limit: int = 20) -> dict:
    """Search or list customers."""
    params = {"limit": limit}
    if search:
        params["search"] = search
    return _get("/customers", params)


def get_customer(customer_id: int) -> dict:
    """Get a single customer with their recent orders."""
    return _get(f"/customers/{customer_id}")


# --- Claude tool schemas ---

TOOL_DEFINITIONS = [
    {
        "name": "get_orders_summary",
        "description": "Get a summary of orders and revenue for a time period. Use for 'how are sales going', 'revenue this week', etc.",
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
        "description": "List recent orders with optional status filter. Returns customer name, total, items, and status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
                    "description": "Filter by order status.",
                },
                "limit": {"type": "integer", "description": "Number of orders to return (default 20, max 100)."},
                "page": {"type": "integer", "description": "Page number for pagination."},
            },
            "required": [],
        },
    },
    {
        "name": "get_order",
        "description": "Get full details for a single order including shipping address, billing address, items, customer phone, and notes. Use this when the user asks for an address or full order info.",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "The order ID or order number (e.g. '2268' or '#2268').",
                }
            },
            "required": ["order_id"],
        },
    },
    {
        "name": "get_products",
        "description": "List all products. Can filter by availability or featured status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "available": {"type": "string", "enum": ["true", "false"]},
                "featured": {"type": "string", "enum": ["true", "false"]},
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
    {
        "name": "get_customers",
        "description": "List customers or search by name, email, or phone. Returns top spenders by default.",
        "input_schema": {
            "type": "object",
            "properties": {
                "search": {"type": "string", "description": "Search term for name, email, or phone."},
                "limit": {"type": "integer", "description": "Number of customers to return (default 20)."},
            },
            "required": [],
        },
    },
    {
        "name": "get_customer",
        "description": "Get a single customer's details and their recent order history.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_id": {"type": "integer", "description": "The customer's numeric ID."},
            },
            "required": ["customer_id"],
        },
    },
]


def call_tool(name: str, inputs: dict) -> Any:
    dispatch = {
        "get_orders_summary": lambda i: get_orders_summary(**i),
        "get_orders": lambda i: get_orders(**i),
        "get_order": lambda i: get_order(**i),
        "get_products": lambda i: get_products(**i),
        "get_product": lambda i: get_product(**i),
        "get_customers": lambda i: get_customers(**i),
        "get_customer": lambda i: get_customer(**i),
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
