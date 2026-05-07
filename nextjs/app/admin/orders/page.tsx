"use client"

import { useState, useEffect } from 'react'
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, CreditCard, Banknote, RotateCcw, ImageIcon } from 'lucide-react'

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
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderToMarkPaid, setOrderToMarkPaid] = useState<string | null>(null)
  const [orderToConfirm, setOrderToConfirm] = useState<string | null>(null)
  const [orderToRefund, setOrderToRefund] = useState<string | null>(null)
  const [orderToApprove, setOrderToApprove] = useState<string | null>(null)
  const [approveNote, setApproveNote] = useState<string>('')
  const [isApproving, setIsApproving] = useState(false)
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null)
  const [editedOrderStatus, setEditedOrderStatus] = useState<string>('')
  const [editedShippingStatus, setEditedShippingStatus] = useState<string>('')
  const [editedTrackingNumber, setEditedTrackingNumber] = useState<string>('')
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedOrder || orderToMarkPaid || orderToConfirm || orderToRefund || orderToApprove || proofImageUrl) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedOrder, orderToMarkPaid, orderToConfirm, orderToRefund, orderToApprove, proofImageUrl])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders')

      setOrders(data.orders)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmMarkAsPaid = async () => {
    if (!orderToMarkPaid) return

    try {
      const res = await fetch(`/api/admin/orders/${orderToMarkPaid}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentMethod: 'bank_transfer', // Set payment method when confirming payment
          reason: 'Marked as paid manually by admin',
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to update order')

      // Refresh orders list
      fetchOrders()
      setOrderToMarkPaid(null)
      alert('Order marked as paid successfully')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
      setOrderToMarkPaid(null)
    }
  }

  const confirmOrderStatus = async () => {
    if (!orderToConfirm) return

    try {
      const res = await fetch(`/api/admin/orders/${orderToConfirm}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to confirm order')
      }

      // Refresh orders list
      fetchOrders()
      setOrderToConfirm(null)
      alert('Order confirmed successfully')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
      setOrderToConfirm(null)
    }
  }

  const confirmRefund = async () => {
    if (!orderToRefund) return

    try {
      const res = await fetch(`/api/admin/orders/${orderToRefund}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'refunded',
          reason: 'Payment refunded by admin',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show detailed error message
        throw new Error(data.error || data.details || 'Failed to refund order')
      }

      // Refresh orders list
      fetchOrders()
      setOrderToRefund(null)

      // Show success message
      const refundedOrder = orders.find(o => o.id === orderToRefund)
      if (refundedOrder?.paymentMethod === 'stripe') {
        alert('✓ Stripe refund processed successfully! The refund will appear in the customer\'s account within 5-10 business days.')
      } else {
        alert('✓ Order marked as refunded. Please process the bank transfer refund manually.')
      }
    } catch (err: any) {
      alert(`Refund Error: ${err.message}`)
      setOrderToRefund(null)
    }
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

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update order')
      }

      fetchOrders()
      setSelectedOrder(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const saveOrderStatuses = async () => {
    if (!selectedOrder) return

    setIsSavingStatus(true)
    try {
      // Update order status
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedOrderStatus,
          shippingStatus: editedShippingStatus,
          trackingNumber: editedTrackingNumber || null
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update order')
      }

      // Refresh orders and close modal
      await fetchOrders()
      setSelectedOrder(null)
      alert('Order updated successfully')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSavingStatus(false)
    }
  }

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage customer orders
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:ring-[#083121] focus:border-[#083121]"
                >
                  {statusFilters.map(sf => (
                    <option key={sf.value} value={sf.value}>{sf.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading orders...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">Error: {error}</div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No orders found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Order
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Date & Time
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Customer
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Total
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Status
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Payment
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Shipping
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const StatusIcon = statusIcons[order.status] || Package
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                          setSelectedOrder(order)
                          setEditedOrderStatus(order.status)
                          setEditedShippingStatus(order.shippingStatus || 'not_shipped')
                          setEditedTrackingNumber(order.trackingNumber || '')
                        }}>
                          <td className="px-2 py-4 whitespace-nowrap w-24">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items?.length || 0} items
                            </div>
                          </td>
                          <td className="px-2 py-4 text-sm text-gray-500 w-32">
                            <div>{new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
                            <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap w-32">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {order.customerName}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right w-24">
                            £{Number(order.total).toLocaleString('en-GB')}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap w-20">
                            <div className="flex items-center justify-center">
                              {order.status === 'pending' && (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              )}
                              {order.status === 'confirmed' && (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              )}
                              {order.status === 'processing' && (
                                <Package className="h-5 w-5 text-purple-600" />
                              )}
                              {order.status === 'shipped' && (
                                <Truck className="h-5 w-5 text-indigo-600" />
                              )}
                              {order.status === 'delivered' && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {order.status === 'cancelled' && (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap w-20">
                            <div className="flex items-center justify-center">
                              {order.paymentStatus === 'paid' && (
                                <CreditCard className="h-5 w-5 text-green-600" />
                              )}
                              {order.paymentStatus === 'pending' && (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              )}
                              {order.paymentStatus === 'failed' && (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              {order.paymentStatus === 'refunded' && (
                                <RotateCcw className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap w-20">
                            <div className="flex items-center justify-center">
                              {(!order.shippingStatus || order.shippingStatus === 'not_shipped') && (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                              {order.shippingStatus === 'shipped' && (
                                <Truck className="h-5 w-5 text-indigo-600" />
                              )}
                              {order.shippingStatus === 'delivered' && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto mb-10 border w-full max-w-4xl shadow-lg bg-white">
              <div className="p-6">
                {/* Customer & Delivery Section */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Order Details */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Invoice: #{selectedOrder.orderNumber}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-300 space-y-1 text-sm text-gray-900">
                      <p className="font-semibold text-base">{selectedOrder.customerName}</p>
                      {selectedOrder.customerPhone && (
                        <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                      )}
                      {selectedOrder.shippingAddress && (
                        <>
                          {selectedOrder.shippingAddress.street && (
                            <p>{selectedOrder.shippingAddress.street}</p>
                          )}
                          {!selectedOrder.shippingAddress.street && selectedOrder.shippingAddress.address && (
                            <p>{selectedOrder.shippingAddress.address}</p>
                          )}
                          {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.postalCode) && (
                            <p>
                              {selectedOrder.shippingAddress.city}
                              {selectedOrder.shippingAddress.city && selectedOrder.shippingAddress.postalCode && ', '}
                              {selectedOrder.shippingAddress.postalCode}
                            </p>
                          )}
                          {selectedOrder.shippingAddress.country &&
                           selectedOrder.shippingAddress.address !== selectedOrder.shippingAddress.country &&
                           selectedOrder.shippingAddress.street !== selectedOrder.shippingAddress.country && (
                            <p className="font-medium">{selectedOrder.shippingAddress.country}</p>
                          )}
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

                  {/* Order Management */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Management</h3>

                    {/* Order Status */}
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Order Status</label>
                      <select
                        value={editedOrderStatus}
                        onChange={(e) => setEditedOrderStatus(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div className="mb-3 pb-3 border-b border-gray-300">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Payment Status</label>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded uppercase ${paymentStatusColors[selectedOrder.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                        {selectedOrder.paymentStatus !== 'pending' && selectedOrder.paymentMethod && (
                          <span className="text-xs text-gray-500">
                            via {selectedOrder.paymentMethod === 'stripe' ? 'Card' : 'Bank Transfer'}
                          </span>
                        )}
                        {selectedOrder.paymentStatus === 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(null)
                              setOrderToRefund(selectedOrder.id)
                            }}
                            className="ml-auto px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        {selectedOrder.paymentStatus === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(null)
                              setOrderToMarkPaid(selectedOrder.id)
                            }}
                            className="ml-auto px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
                            title={selectedOrder.paymentMethod === 'stripe' ? 'Manually mark Stripe payment as paid' : 'Mark payment as received'}
                          >
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

                    {/* Shipping Status */}
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Shipping Status</label>
                      <select
                        value={editedShippingStatus}
                        onChange={(e) => setEditedShippingStatus(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="not_shipped">Not Shipped</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    {/* Tracking Number */}
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
                            href={`https://track.dpd.co.uk/search?reference=${encodeURIComponent(editedTrackingNumber)}`}
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

                {/* Order Items Table */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              £{(Number(item.price) / item.quantity).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                              £{Number(item.price).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6">
                  <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">£{Number(selectedOrder.subtotal).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 pb-3 border-b border-gray-300">
                      <span>Shipping:</span>
                      <span className="font-medium">£{Number(selectedOrder.shippingCost).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                      <span>Total Due:</span>
                      <span className="text-green-700">£{Number(selectedOrder.total).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex justify-end items-center gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Close
                </button>
                <button
                  onClick={saveOrderStatuses}
                  disabled={isSavingStatus || (
                    editedOrderStatus === selectedOrder.status &&
                    editedShippingStatus === (selectedOrder.shippingStatus || 'not_shipped') &&
                    editedTrackingNumber === (selectedOrder.trackingNumber || '')
                  )}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isSavingStatus ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Order Modal */}
        {orderToConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirm Order
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to confirm this order? This action will update the order status to "confirmed".
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setOrderToConfirm(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmOrderStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Paid Confirmation Modal */}
        {orderToMarkPaid && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirm Payment
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to mark this order as paid? This action will update the payment status to "paid".
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setOrderToMarkPaid(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMarkAsPaid}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Confirmation Modal */}
        {orderToRefund && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Refund Payment
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {(() => {
                    const orderToRefundDetails = orders.find(o => o.id === orderToRefund)
                    if (orderToRefundDetails?.paymentMethod === 'stripe') {
                      return 'Are you sure you want to refund this order? This will automatically process a Stripe refund and return the money to the customer\'s card within 5-10 business days.'
                    }
                    return 'Are you sure you want to refund this order? This will mark the order as refunded. You will need to process the bank transfer refund manually.'
                  })()}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setOrderToRefund(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRefund}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  >
                    Refund
                  </button>
                </div>
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
    </AdminAuth>
  )
}
