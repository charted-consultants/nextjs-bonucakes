export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-light pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <p className="text-secondary uppercase tracking-widest text-sm mb-3 font-medium">Developer</p>
          <h1 className="text-4xl font-bold text-primary font-serif mb-4">CLI API Reference</h1>
          <p className="text-muted text-lg">
            Protected REST endpoints for managing the Bonucakes store externally — from Claude Code, scripts, or any HTTP client.
          </p>
        </div>

        {/* Auth */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Authentication</h2>
          <p className="text-muted mb-4">All requests require an API key header:</p>
          <pre className="bg-[#083121] text-green-300 rounded-xl p-5 text-sm overflow-x-auto">
{`X-Api-Key: your-api-key
# or
Authorization: Bearer your-api-key`}
          </pre>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Contact the site administrator for your API key.
          </div>
        </section>

        {/* Base URLs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Base URLs</h2>
          <div className="overflow-x-auto rounded-xl border border-primary/10">
            <table className="w-full text-sm">
              <thead className="bg-primary/5">
                <tr>
                  <th className="text-left px-4 py-3 text-primary font-semibold">Environment</th>
                  <th className="text-left px-4 py-3 text-primary font-semibold">URL</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-primary/10">
                  <td className="px-4 py-3 text-muted">Production</td>
                  <td className="px-4 py-3 font-mono text-sm">https://bonucakes.com</td>
                </tr>
                <tr className="border-t border-primary/10">
                  <td className="px-4 py-3 text-muted">Staging</td>
                  <td className="px-4 py-3 font-mono text-sm">https://staging.bonucakes.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Products */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Products</h2>

          <div className="space-y-8">

            {/* List products */}
            <div className="border border-primary/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border-b border-primary/10">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">GET</span>
                <code className="text-sm font-mono text-primary">/api/cli/products</code>
                <span className="text-muted text-sm ml-auto">List all products</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-primary mb-2">Query params</p>
                  <div className="overflow-x-auto rounded-lg border border-primary/10">
                    <table className="w-full text-sm">
                      <thead className="bg-primary/5">
                        <tr>
                          <th className="text-left px-3 py-2 text-primary font-medium">Param</th>
                          <th className="text-left px-3 py-2 text-primary font-medium">Values</th>
                          <th className="text-left px-3 py-2 text-primary font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-primary/10">
                          <td className="px-3 py-2 font-mono text-xs">available</td>
                          <td className="px-3 py-2 text-muted">true / false</td>
                          <td className="px-3 py-2 text-muted">Filter by availability</td>
                        </tr>
                        <tr className="border-t border-primary/10">
                          <td className="px-3 py-2 font-mono text-xs">search</td>
                          <td className="px-3 py-2 text-muted">string</td>
                          <td className="px-3 py-2 text-muted">Search by name (VI or EN)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <pre className="bg-[#083121] text-green-300 rounded-lg p-4 text-xs overflow-x-auto">
{`curl https://bonucakes.com/api/cli/products \\
  -H "X-Api-Key: your-key"

# Only available products
curl "https://bonucakes.com/api/cli/products?available=true" \\
  -H "X-Api-Key: your-key"`}
                </pre>
              </div>
            </div>

            {/* Update product */}
            <div className="border border-primary/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border-b border-primary/10">
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">PATCH</span>
                <code className="text-sm font-mono text-primary">/api/cli/products/:id</code>
                <span className="text-muted text-sm ml-auto">Update a product</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-primary mb-2">Body fields (any combination)</p>
                  <div className="overflow-x-auto rounded-lg border border-primary/10">
                    <table className="w-full text-sm">
                      <thead className="bg-primary/5">
                        <tr>
                          <th className="text-left px-3 py-2 text-primary font-medium">Field</th>
                          <th className="text-left px-3 py-2 text-primary font-medium">Type</th>
                          <th className="text-left px-3 py-2 text-primary font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['price', 'number', 'Price in GBP'],
                          ['compareAtPrice', 'number', 'Original price (for sale display)'],
                          ['stock', 'number', 'Stock quantity'],
                          ['available', 'boolean', 'Show/hide product on site'],
                          ['featured', 'boolean', 'Feature on homepage'],
                          ['stockStatus', 'string', 'in_stock, low_stock, out_of_stock'],
                        ].map(([field, type, desc]) => (
                          <tr key={field} className="border-t border-primary/10">
                            <td className="px-3 py-2 font-mono text-xs">{field}</td>
                            <td className="px-3 py-2 text-muted">{type}</td>
                            <td className="px-3 py-2 text-muted">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <pre className="bg-[#083121] text-green-300 rounded-lg p-4 text-xs overflow-x-auto">
{`curl -X PATCH https://bonucakes.com/api/cli/products/13 \\
  -H "X-Api-Key: your-key" \\
  -H "Content-Type: application/json" \\
  -d '{"available": true, "stock": 50, "stockStatus": "in_stock"}'`}
                </pre>
              </div>
            </div>

          </div>
        </section>

        {/* Orders */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Orders</h2>

          <div className="space-y-8">

            {/* List orders */}
            <div className="border border-primary/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border-b border-primary/10">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">GET</span>
                <code className="text-sm font-mono text-primary">/api/cli/orders</code>
                <span className="text-muted text-sm ml-auto">List orders</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="overflow-x-auto rounded-lg border border-primary/10">
                  <table className="w-full text-sm">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="text-left px-3 py-2 text-primary font-medium">Param</th>
                        <th className="text-left px-3 py-2 text-primary font-medium">Values</th>
                        <th className="text-left px-3 py-2 text-primary font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['status', 'pending, confirmed, processing, shipped, delivered, cancelled', 'Filter by status'],
                        ['from', 'date e.g. 2026-04-01', 'Orders after this date'],
                        ['to', 'date e.g. 2026-04-30', 'Orders before this date'],
                        ['limit', 'number (max 100)', 'Results per page, default 20'],
                      ].map(([param, values, desc]) => (
                        <tr key={param} className="border-t border-primary/10">
                          <td className="px-3 py-2 font-mono text-xs">{param}</td>
                          <td className="px-3 py-2 text-muted text-xs">{values}</td>
                          <td className="px-3 py-2 text-muted">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <pre className="bg-[#083121] text-green-300 rounded-lg p-4 text-xs overflow-x-auto">
{`# Pending orders
curl "https://bonucakes.com/api/cli/orders?status=pending" \\
  -H "X-Api-Key: your-key"

# Orders from April 2026
curl "https://bonucakes.com/api/cli/orders?from=2026-04-01&to=2026-04-30" \\
  -H "X-Api-Key: your-key"`}
                </pre>
              </div>
            </div>

            {/* Orders summary */}
            <div className="border border-primary/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border-b border-primary/10">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">GET</span>
                <code className="text-sm font-mono text-primary">/api/cli/orders/summary</code>
                <span className="text-muted text-sm ml-auto">Revenue & order counts</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="overflow-x-auto rounded-lg border border-primary/10">
                  <table className="w-full text-sm">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="text-left px-3 py-2 text-primary font-medium">period</th>
                        <th className="text-left px-3 py-2 text-primary font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['today', 'Since midnight today'],
                        ['week', 'Last 7 days'],
                        ['month', 'Since start of current month'],
                        ['all', 'All time (default)'],
                      ].map(([val, desc]) => (
                        <tr key={val} className="border-t border-primary/10">
                          <td className="px-3 py-2 font-mono text-xs">{val}</td>
                          <td className="px-3 py-2 text-muted">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <pre className="bg-[#083121] text-green-300 rounded-lg p-4 text-xs overflow-x-auto">
{`curl "https://bonucakes.com/api/cli/orders/summary?period=month" \\
  -H "X-Api-Key: your-key"`}
                </pre>
                <pre className="bg-gray-50 border border-primary/10 rounded-lg p-4 text-xs overflow-x-auto text-gray-700">
{`{
  "period": "month",
  "totalOrders": 14,
  "totalRevenue": "312.00",
  "byStatus": {
    "delivered": 10,
    "pending": 2,
    "cancelled": 2
  }
}`}
                </pre>
              </div>
            </div>

          </div>
        </section>

        {/* Errors */}
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Error responses</h2>
          <div className="overflow-x-auto rounded-xl border border-primary/10">
            <table className="w-full text-sm">
              <thead className="bg-primary/5">
                <tr>
                  <th className="text-left px-4 py-3 text-primary font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-primary font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['401', 'Missing or invalid API key'],
                  ['400', 'Bad request — invalid id or missing fields'],
                  ['500', 'Server error'],
                ].map(([status, meaning]) => (
                  <tr key={status} className="border-t border-primary/10">
                    <td className="px-4 py-3 font-mono text-sm">{status}</td>
                    <td className="px-4 py-3 text-muted">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
