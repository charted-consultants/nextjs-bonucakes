# Bonucakes CLI API

A set of protected REST endpoints for managing the Bonucakes store externally — from Claude Code, scripts, or any HTTP client.

## Authentication

All requests require an API key passed as a header:

```bash
X-Api-Key: your-api-key-here
# or
Authorization: Bearer your-api-key-here
```

The key is stored in the `CLI_API_KEY` environment variable on the server. Contact the site administrator for your key.

---

## Products

### List products

```
GET /api/cli/products
```

**Query params**

| Param | Type | Description |
|---|---|---|
| `available` | `true` / `false` | Filter by availability |
| `search` | string | Search by name (VI or EN) |

**Example**

```bash
curl https://bonucakes.com/api/cli/products \
  -H "X-Api-Key: your-key"
```

**Response**

```json
{
  "products": [
    {
      "id": 1,
      "nameVi": "Bánh Mì Sài Gòn",
      "nameEn": "Saigon Baguette",
      "slug": "banh-mi-sai-gon-half-baked",
      "price": "9.00",
      "compareAtPrice": null,
      "category": "food",
      "available": true,
      "featured": true,
      "stock": 100,
      "stockStatus": "in_stock"
    }
  ]
}
```

---

### Update a product

```
PATCH /api/cli/products/:id
```

**Body** (any combination of these fields)

| Field | Type | Description |
|---|---|---|
| `price` | number | Price in GBP |
| `compareAtPrice` | number | Original price (for sale display) |
| `stock` | number | Stock quantity |
| `available` | boolean | Show/hide product |
| `featured` | boolean | Feature on homepage |
| `stockStatus` | string | `in_stock`, `low_stock`, `out_of_stock` |

**Example**

```bash
# Mark banh bao as available and set stock to 50
curl -X PATCH https://bonucakes.com/api/cli/products/13 \
  -H "X-Api-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"available": true, "stock": 50, "stockStatus": "in_stock"}'
```

**Response**

```json
{
  "product": {
    "id": 13,
    "nameEn": "bao-bun",
    "nameVi": "Bánh Bao",
    "slug": "banh-bao",
    "price": "10.00",
    "stock": 50,
    "available": true,
    "stockStatus": "in_stock",
    "featured": false
  }
}
```

---

## Orders

### List orders

```
GET /api/cli/orders
```

**Query params**

| Param | Type | Description |
|---|---|---|
| `status` | string | `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` |
| `from` | date | Start date e.g. `2026-04-01` |
| `to` | date | End date e.g. `2026-04-30` |
| `limit` | number | Max results (default: 20, max: 100) |

**Example**

```bash
# Get all pending orders
curl "https://bonucakes.com/api/cli/orders?status=pending" \
  -H "X-Api-Key: your-key"

# Get orders from April 2026
curl "https://bonucakes.com/api/cli/orders?from=2026-04-01&to=2026-04-30" \
  -H "X-Api-Key: your-key"
```

**Response**

```json
{
  "count": 2,
  "orders": [
    {
      "id": "clx...",
      "orderNumber": "BC-001",
      "status": "pending",
      "total": "27.00",
      "currency": "GBP",
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "createdAt": "2026-04-29T10:00:00Z",
      "items": [
        {
          "productName": "Saigon Baguette",
          "quantity": 2,
          "price": "9.00"
        }
      ]
    }
  ]
}
```

---

### Orders summary

```
GET /api/cli/orders/summary
```

**Query params**

| Param | Value | Description |
|---|---|---|
| `period` | `today` | Since midnight today |
| `period` | `week` | Last 7 days |
| `period` | `month` | Since start of current month |
| `period` | `all` | All time (default) |

**Example**

```bash
curl "https://bonucakes.com/api/cli/orders/summary?period=month" \
  -H "X-Api-Key: your-key"
```

**Response**

```json
{
  "period": "month",
  "totalOrders": 14,
  "totalRevenue": "312.00",
  "byStatus": {
    "delivered": 10,
    "pending": 2,
    "cancelled": 2
  }
}
```

---

## Error responses

| Status | Meaning |
|---|---|
| `401` | Missing or invalid API key |
| `400` | Bad request (invalid id, missing fields) |
| `500` | Server error |

```json
{ "error": "Invalid or missing API key" }
```

---

## Staging vs Production

| Environment | Base URL |
|---|---|
| Staging | `https://staging.bonucakes.com` |
| Production | `https://bonucakes.com` |

Both environments use the same API key.
