"use client"

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import KitchenView from "@/components/admin/KitchenView"
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, CreditCard, Banknote, RotateCcw, ImageIcon, ChevronUp, ChevronDown, ChevronsUpDown, ChefHat } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: {
    address?: string
    street?: string
    city?: string
    postalCode?: string
    country?: string
  } | null
  customerNote?: string | null
  subtotal: number
  shippingCost: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string | null
  shippingStatus: string | null
  trackingNumber?: string | null
  createdAt: string
  paymentProofUrl?: string | null
  paymentProofUploadedAt?: string | null
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'refunded']

type SortField = 'createdAt' | 'total' | 'customerName' | 'status' | 'paymentStatus'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderToConfirm, setOrderToConfirm] = useState<string | null>(null)
  const [orderToApprove, setOrderToApprove] = useState<string | null>(null)
  const [approveNote, setApproveNote] = useState<string>('')
  const [isApproving, setIsApproving] = useState(false)
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null)
  const [editedOrderStatus, setEditedOrderStatus] = useState<string>('')
  const [editedShippingStatus, setEditedShippingStatus] = useState<string>('')
  const [editedTrackingNumber, setEditedTrackingNumber] = useState<string>('')
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)
  const [paymentDropdown, setPaymentDropdown] = useState<string | null>(null)
  const [orderToMarkPaid, setOrderToMarkPaid] = useState<string | null>(null)
  const [orderToRefund, setOrderToRefund] = useState<string | null>(null)
  const [kitchenOpen, setKitchenOpen] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      params.append('page', String(page))
      params.append('limit', '20')
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders')

      setOrders(data.orders.map((o: any) => ({
        ...o,
        items: o.items?.map((i: any) => ({
          productName: i.productName || i.product?.nameEn || i.product?.nameVi || 'Product',
          quantity: i.quantity,
          price: i.price,
        })) || [],
      })))
      setTotalPages(data.pagination.totalPages)
      setTotalCount(data.pagination.totalCount)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filter, page, sortBy, sortOrder, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    if (selectedOrder || kitchenOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [selectedOrder, kitchenOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null)
        setOrderToMarkPaid(null)
        setOrderToRefund(null)
        setKitchenOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setStatusDropdown(null); setPaymentDropdown(null) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown className="h-3 w-3 text-gray-400 inline ml-1" />
    return sortOrder === 'asc'
      ? <ChevronUp className="h-3 w-3 text-gray-700 inline ml-1" />
      : <ChevronDown className="h-3 w-3 text-gray-700 inline ml-1" />
  }

  const confirmApprovePayment = async () => {
    if (!orderToApprove) return
    setIsApproving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderToApprove}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: approveNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to confirm payment')
      fetchOrders()
      setOrderToApprove(null)
      setApproveNote('')
      alert('✓ Đã duyệt đơn và gửi email xác nhận cho khách!')
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`)
    } finally {
      setIsApproving(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
    setStatusDropdown(null)
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      setOrderToMarkPaid(orderId)
      setPaymentDropdown(null)
      return
    }
    if (paymentStatus === 'refunded') {
      setOrderToRefund(orderId)
      setPaymentDropdown(null)
      return
    }
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, reason: 'Updated by admin' }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o))
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
    setPaymentDropdown(null)
  }

  const confirmMarkAsPaid = async () => {
    if (!orderToMarkPaid) return
    try {
      const res = await fetch(`/api/admin/orders/${orderToMarkPaid}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid', paymentMethod: 'bank_transfer', reason: 'Marked as paid manually by admin' }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setOrders(prev => prev.map(o => o.id === orderToMarkPaid ? { ...o, paymentStatus: 'paid' } : o))
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
    setOrderToMarkPaid(null)
  }

  const confirmRefund = async () => {
    if (!orderToRefund) return
    try {
      const res = await fetch(`/api/admin/orders/${orderToRefund}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'refunded', reason: 'Payment refunded by admin' }),
      })
      if (!res.ok) throw new Error('Failed to refund')
      setOrders(prev => prev.map(o => o.id === orderToRefund ? { ...o, paymentStatus: 'refunded' } : o))
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
    setOrderToRefund(null)
  }

  const saveOrderStatuses = async () => {
    if (!selectedOrder) return
    setIsSavingStatus(true)
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editedOrderStatus, shippingStatus: editedShippingStatus, trackingNumber: editedTrackingNumber || null }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await fetchOrders()
      setSelectedOrder(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSavingStatus(false)
    }
  }

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (search) params.append('search', search)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      params.append('limit', '9999')
      params.append('page', '1')

      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')

      const allOrders: Order[] = data.orders.map((o: any) => ({
        ...o,
        items: o.items?.map((i: any) => ({
          productName: i.productName || i.product?.nameEn || i.product?.nameVi || 'Product',
          quantity: i.quantity,
          price: i.price,
        })) || [],
      }))

      const rows = [
        ['Order #', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'City', 'Postcode', 'Country', 'Items', 'Subtotal', 'Shipping', 'Total', 'Status', 'Payment Status', 'Payment Method', 'Note'],
        ...allOrders.map(o => [
          o.orderNumber,
          new Date(o.createdAt).toLocaleDateString('en-GB'),
          o.customerName,
          o.customerEmail,
          o.customerPhone || '',
          o.shippingAddress?.street || o.shippingAddress?.address || '',
          o.shippingAddress?.city || '',
          o.shippingAddress?.postalCode || '',
          o.shippingAddress?.country || '',
          o.items.map(i => `${i.productName} x${i.quantity}`).join('; '),
          Number(o.subtotal).toFixed(2),
          Number(o.shippingCost).toFixed(2),
          Number(o.total).toFixed(2),
          o.status,
          o.paymentStatus,
          o.paymentMethod || '',
          o.customerNote || '',
        ]),
      ]

      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert('Export failed: ' + err.message)
    }
  }

  const statusFilters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500">{totalCount} total orders</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setKitchenOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-700 transition shadow-sm">
                <ChefHat className="h-4 w-4" /> Kitchen
              </button>
              <button onClick={exportCSV} className="px-4 py-2 text-sm font-semibold bg-[#083121] text-white rounded-md hover:bg-[#0a3d29] transition shadow-sm">
                Export CSV
              </button>
            </div>
          </div>

          {/* Status filters + search */}
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search name, email, order #..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-[#083121]"
              />
            </div>
            <div className="hidden md:block w-px h-5 bg-gray-300" />
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 flex-nowrap">
              {statusFilters.map(s => (
                <button
                  key={s}
                  onClick={() => { setFilter(s); setPage(1) }}
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition flex-shrink-0 ${
                    filter === s
                      ? 'bg-[#083121] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs border rounded ${p === page ? 'bg-[#083121] text-white border-[#083121]' : 'border-gray-300 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}

          {/* Mobile card list */}
          {!loading && !error && orders.length > 0 && (
            <div className="md:hidden space-y-0">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`border border-gray-200 rounded-lg p-3 mb-2 cursor-pointer ${
                    order.status === 'cancelled' ? 'bg-red-50' :
                    order.status === 'delivered' ? 'bg-green-50' :
                    order.status === 'shipped' ? 'bg-indigo-50' :
                    'bg-white'
                  }`}
                  onClick={() => { setSelectedOrder(order); setEditedOrderStatus(order.status); setEditedShippingStatus(order.shippingStatus || 'not_shipped'); setEditedTrackingNumber(order.trackingNumber || '') }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-gray-800 text-sm">#{order.orderNumber}</span>
                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{order.customerName}</span>
                    <span className="font-bold text-sm text-gray-900">£{Number(order.total).toFixed(2)}</span>
                  </div>
                  {order.customerNote && (
                    <p className="text-xs text-gray-500 truncate mb-2">{order.customerNote}</p>
                  )}
                  <div className="flex gap-1 flex-wrap mt-2" onClick={e => e.stopPropagation()}>
                    {[
                      { label: 'Confirmed', value: 'confirmed', check: () => order.status === 'confirmed', action: () => updateOrderStatus(order.id, 'confirmed') },
                      { label: 'Paid', value: 'paid', check: () => order.paymentStatus === 'paid', action: () => setOrderToMarkPaid(order.id) },
                      { label: 'Shipped', value: 'shipped', check: () => order.status === 'shipped', action: () => updateOrderStatus(order.id, 'shipped') },
                      { label: 'Cancelled', value: 'cancelled', check: () => order.status === 'cancelled', action: () => updateOrderStatus(order.id, 'cancelled') },
                    ].map(btn => (
                      <button
                        key={btn.value}
                        onClick={() => btn.action()}
                        className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                          btn.check()
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {loading && <div className="md:hidden p-6 text-center text-gray-500 text-sm">Loading...</div>}
          {error && <div className="md:hidden p-6 text-center text-red-600 text-sm">{error}</div>}
          {!loading && !error && orders.length === 0 && <div className="md:hidden p-6 text-center text-gray-500 text-sm">No orders found.</div>}

          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600 text-sm">{error}</div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                        Order
                      </th>
                      <th onClick={() => handleSort('createdAt')} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none w-28">
                        Date <SortIcon field="createdAt" />
                      </th>
                      <th onClick={() => handleSort('customerName')} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none">
                        Customer <SortIcon field="customerName" />
                      </th>
                      <th onClick={() => handleSort('total')} className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none w-24">
                        Total <SortIcon field="total" />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                        Note
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-px whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-xs">
                    {orders.map((order) => (
                      <tr key={order.id} className={`cursor-pointer transition-colors ${
                        order.status === 'cancelled' ? 'bg-red-50/60 hover:bg-red-100/60' :
                        order.status === 'delivered' ? 'bg-green-50/60 hover:bg-green-100/60' :
                        order.status === 'shipped' ? 'bg-indigo-50/60 hover:bg-indigo-100/60' :
                        'even:bg-gray-50/70 hover:bg-blue-50/50'
                      }`} onClick={() => { setSelectedOrder(order); setEditedOrderStatus(order.status); setEditedShippingStatus(order.shippingStatus || 'not_shipped'); setEditedTrackingNumber(order.trackingNumber || '') }}>
                        <td className="px-4 py-2 whitespace-nowrap font-mono font-medium text-gray-800">
                          #{order.orderNumber}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-800">
                          {order.customerName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 text-right tabular-nums">
                          £{Number(order.total).toFixed(2)}
                        </td>

                        {/* Status button with dropdown */}

                        <td className="px-4 py-2 max-w-[180px]">
                          <span className="text-gray-500 truncate block">{order.customerNote || ''}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {[
                              { label: 'Confirmed', value: 'confirmed', check: () => order.status === 'confirmed', action: () => updateOrderStatus(order.id, 'confirmed') },
                              { label: 'Paid', value: 'paid', check: () => order.paymentStatus === 'paid', action: () => setOrderToMarkPaid(order.id) },
                              { label: 'Shipped', value: 'shipped', check: () => order.status === 'shipped', action: () => updateOrderStatus(order.id, 'shipped') },
                              { label: 'Cancelled', value: 'cancelled', check: () => order.status === 'cancelled', action: () => updateOrderStatus(order.id, 'cancelled') },
                            ].map(btn => (
                              <button
                                key={btn.value}
                                onClick={() => btn.action()}
                                className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                                  btn.check()
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 text-xs border rounded ${p === page ? 'bg-[#083121] text-white border-[#083121]' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-0 md:top-10 mx-auto md:mb-10 border w-full md:max-w-4xl shadow-lg bg-white md:rounded-lg">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Invoice: #{selectedOrder.orderNumber}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-300 space-y-1 text-sm text-gray-900">
                      <p className="font-semibold text-base">{selectedOrder.customerName}</p>
                      <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                      {selectedOrder.customerPhone && <p className="text-gray-600">{selectedOrder.customerPhone}</p>}
                      {selectedOrder.shippingAddress && (
                        <>
                          {(selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address) && (
                            <p>{selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address}</p>
                          )}
                          {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.postalCode) && (
                            <p>{[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.postalCode].filter(Boolean).join(', ')}</p>
                          )}
                          {selectedOrder.shippingAddress.country && <p className="font-medium">{selectedOrder.shippingAddress.country}</p>}
                        </>
                      )}
                    </div>
                    {selectedOrder.customerNote && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Notes</h4>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedOrder.customerNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Management</h3>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Order Status</label>
                      <select
                        value={editedOrderStatus}
                        onChange={e => setEditedOrderStatus(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                    <div className="mb-3 pb-3 border-b border-gray-300">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Payment Status</label>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded uppercase ${paymentColors[selectedOrder.paymentStatus] || 'bg-gray-100'}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                        {selectedOrder.paymentMethod && (
                          <span className="text-xs text-gray-500 capitalize">{selectedOrder.paymentMethod.replace(/_/g, ' ')}</span>
                        )}
                        {selectedOrder.paymentStatus === 'paid' && (
                          <button onClick={() => { setSelectedOrder(null); setOrderToRefund(selectedOrder.id) }}
                            className="ml-auto px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700">
                            Refund
                          </button>
                        )}
                        {selectedOrder.paymentStatus === 'pending' && (
                          <button onClick={() => { setSelectedOrder(null); setOrderToMarkPaid(selectedOrder.id) }}
                            className="ml-auto px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700">
                            Mark Paid
                          </button>
                        )}
                      </div>

                      {/* Payment Proof Image */}
                      {selectedOrder.paymentProofUrl && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> Ảnh xác nhận chuyển khoản
                          </p>
                          <img
                            src={selectedOrder.paymentProofUrl}
                            alt="Payment proof"
                            className="max-w-full max-h-48 object-contain rounded border border-green-300 cursor-pointer"
                            onClick={() => setProofImageUrl(selectedOrder.paymentProofUrl!)}
                          />
                          {selectedOrder.paymentProofUploadedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(selectedOrder.paymentProofUploadedAt).toLocaleString('en-GB')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Duyệt đơn button */}
                      {selectedOrder.paymentStatus === 'pending' && !selectedOrder.paymentMethod?.includes('stripe') && (
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(null)
                              setOrderToApprove(selectedOrder.id)
                            }}
                            className="w-full px-4 py-2.5 bg-[#083121] text-white font-bold rounded hover:bg-[#083121]/90 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Duyệt đơn — Xác nhận đã nhận tiền
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Shipping Status</label>
                      <select
                        value={editedShippingStatus}
                        onChange={e => setEditedShippingStatus(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="not_shipped">Not Shipped</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    {editedShippingStatus === 'shipped' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Tracking Number (DPD)</label>
                        <input
                          type="text"
                          value={editedTrackingNumber}
                          onChange={(e) => setEditedTrackingNumber(e.target.value)}
                          placeholder="Nhập mã vận đơn DPD"
                          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                        {editedTrackingNumber && (
                          <a
                            href={`https://track.dpd.co.uk/search?reference=${encodeURIComponent(editedTrackingNumber)}${selectedOrder?.shippingAddress?.postalCode ? `&postcode=${encodeURIComponent((selectedOrder.shippingAddress.postalCode as string).replace(/\s+/g,''))}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <Truck className="w-3 h-3" /> Xem tracking DPD
                          </a>
                        )}
                        {editedTrackingNumber && selectedOrder?.status !== 'shipped' && (
                          <p className="mt-1 text-xs text-amber-600">Email tracking DPD sẽ tự gửi cho khách khi bấm Save.</p>
                        )}
                        {editedTrackingNumber && selectedOrder?.status === 'shipped' && (
                          <p className="mt-1 text-xs text-green-600">Email tracking DPD đã gửi cho khách.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-2 text-sm text-center font-semibold">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">£{(Number(item.price) / item.quantity).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-right">£{Number(item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="max-w-xs ml-auto space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span><span>£{Number(selectedOrder.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 pb-2 border-b border-gray-300">
                      <span>Shipping</span><span>£{Number(selectedOrder.shippingCost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                      <span>Total</span><span className="text-green-700">£{Number(selectedOrder.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-end gap-3">
                <button onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
                  Close
                </button>
                <button onClick={saveOrderStatuses} disabled={isSavingStatus}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50">
                  {isSavingStatus ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Paid modal */}
        {orderToMarkPaid && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center mx-4 md:mx-0">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-2">Confirm Payment</h3>
              <p className="text-sm text-gray-500 mb-4">Mark this order as paid via bank transfer?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setOrderToMarkPaid(null)} className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button onClick={confirmMarkAsPaid} className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Refund modal */}
        {orderToRefund && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center mx-4 md:mx-0">
              <XCircle className="h-10 w-10 text-red-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-2">Refund Order</h3>
              <p className="text-sm text-gray-500 mb-4">Mark as refunded? You'll need to process the bank transfer manually.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setOrderToRefund(null)} className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button onClick={confirmRefund} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Refund</button>
              </div>
            </div>
          </div>
        )}
        {/* Duyệt đơn Modal */}
        {orderToApprove && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Duyệt đơn — Xác nhận đã nhận tiền
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Sau khi duyệt, hệ thống sẽ tự động gửi email xác nhận đến khách hàng.
                </p>
                <div className="mb-4 text-left">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 block">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    placeholder="VD: Đã nhận chuyển khoản lúc 14:30"
                    className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setOrderToApprove(null); setApproveNote('') }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={confirmApprovePayment}
                    disabled={isApproving}
                    className="px-6 py-2 bg-[#083121] text-white rounded-md hover:bg-[#083121]/90 font-bold disabled:opacity-50"
                  >
                    {isApproving ? 'Đang xử lý...' : 'Xác nhận duyệt đơn'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof Image Lightbox */}
        {proofImageUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={() => setProofImageUrl(null)}
          >
            <img
              src={proofImageUrl}
              alt="Payment proof"
              className="max-w-full max-h-full object-contain rounded shadow-xl"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => setProofImageUrl(null)}
            >
              ×
            </button>
          </div>
        )}
      </AdminSidebar>

      {/* Kitchen modal */}
      {kitchenOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-0 md:p-4" onClick={() => setKitchenOpen(false)}>
          <div className="bg-white rounded-none md:rounded-2xl w-full max-w-6xl max-h-screen md:max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="h-5 w-5" /> Kitchen View
              </h2>
              <button onClick={() => setKitchenOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <KitchenView />
            </div>
          </div>
        </div>
      )}
    </AdminAuth>
  )
}
