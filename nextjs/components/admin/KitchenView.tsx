"use client"

import { useState, useEffect, useCallback } from 'react'

interface OrderItem {
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerNote: string | null
  customerPhone: string | null
  shippingAddress: {
    street?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
  } | null
  status: string
  createdAt: string
  items: OrderItem[]
}

interface ProductionItem {
  productName: string
  totalQty: number
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
}

const STATUS_NEXT: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'ready',
}

const STATUS_COLOURS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
}

const ALL_STATUSES = ['pending', 'confirmed', 'processing']

function toLocalDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function KitchenView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'confirmed', 'processing'])
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return toLocalDateString(d)
  })
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return toLocalDateString(d)
  })

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const fetchOrders = useCallback(async () => {
    if (selectedStatuses.length === 0) {
      setOrders([])
      setLastUpdated(new Date())
      setLoading(false)
      return
    }
    try {
      const results = await Promise.all(
        selectedStatuses.map(status =>
          fetch(`/api/admin/orders?status=${status}&limit=100&page=1&sortBy=createdAt&sortOrder=asc`)
            .then(r => r.json())
        )
      )

      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)

      const all: Order[] = results.flatMap(data =>
        (data.orders || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerNote: o.customerNote || null,
          customerPhone: o.customerPhone || null,
          shippingAddress: o.shippingAddress || null,
          status: o.status,
          createdAt: o.createdAt,
          items: (o.items || []).map((i: any) => ({
            productName: i.productName || i.product?.nameEn || i.product?.nameVi || 'Product',
            quantity: i.quantity,
            price: i.price,
          })),
        }))
      ).filter(o => {
        const d = new Date(o.createdAt)
        return d >= from && d <= to
      })

      all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      setOrders(all)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Kitchen fetch error', err)
    } finally {
      setLoading(false)
    }
  }, [selectedStatuses, dateFrom, dateTo])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const advanceStatus = async (order: Order) => {
    const next = STATUS_NEXT[order.status]
    if (!next) return
    setUpdatingId(order.id)
    try {
      if (next === 'ready') {
        await fetch(`/api/admin/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'delivered' }),
        })
        setOrders(prev => prev.filter(o => o.id !== order.id))
      } else {
        await fetch(`/api/admin/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        })
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o))
      }
    } catch (err) {
      console.error('Update error', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const production: ProductionItem[] = Object.values(
    orders.flatMap(o => o.items).reduce<Record<string, ProductionItem>>((acc, item) => {
      if (acc[item.productName]) {
        acc[item.productName].totalQty += item.quantity
      } else {
        acc[item.productName] = { productName: item.productName, totalQty: item.quantity }
      }
      return acc
    }, {})
  ).sort((a, b) => b.totalQty - a.totalQty)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading orders...</div>
  )

  if (orders.length === 0) return (
    <div className="flex items-center justify-center h-64 text-gray-500 text-sm">No active orders</div>
  )

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#083121]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#083121]"
            />
          </div>
        </div>
        <div className="w-px h-5 bg-gray-300 hidden md:block" />
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition ${
                selectedStatuses.includes(s)
                  ? 'bg-[#083121] text-white'
                  : 'bg-white border border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="md:ml-auto w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
          <p className="text-xs text-gray-500">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
            {lastUpdated && <span className="ml-1">· {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          </p>
          <button onClick={fetchOrders} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 transition">
            Refresh
          </button>
        </div>
      </div>

      {/* Production Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Total to Prepare</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {production.map(item => (
            <div key={item.productName} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 shadow-sm">
              <span className="text-sm text-gray-700 leading-tight">{item.productName}</span>
              <span className="text-xl font-bold text-gray-900 tabular-nums shrink-0">{item.totalQty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Queue */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Queue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-base font-bold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}{order.customerName}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${STATUS_COLOURS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>

              {(order.customerPhone || order.shippingAddress) && (
                <div className="text-xs text-gray-500 space-y-0.5">
                  {order.customerPhone && <p>{order.customerPhone}</p>}
                  {order.shippingAddress && (
                    <p>
                      {[
                        order.shippingAddress.street || order.shippingAddress.address,
                        order.shippingAddress.city,
                        order.shippingAddress.postalCode,
                        order.shippingAddress.country,
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex-1 divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-700">{item.productName}</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {order.customerNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Note</p>
                  <p className="text-sm text-amber-900">{order.customerNote}</p>
                </div>
              )}

              <button
                onClick={() => advanceStatus(order)}
                disabled={updatingId === order.id}
                className={`w-full py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 ${
                  order.status === 'processing'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-[#083121] hover:bg-[#0a3d29] text-white'
                }`}
              >
                {updatingId === order.id ? 'Updating...' :
                  order.status === 'pending' ? 'Confirm' :
                  order.status === 'confirmed' ? 'Start Processing' :
                  'Mark Ready'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
