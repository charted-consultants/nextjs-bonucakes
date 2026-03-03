"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Package, ShoppingCart, FileText, TrendingUp, Clock, CheckCircle, Eye } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalBlogPosts: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }>
  recentPosts: Array<{
    id: number
    titleEn: string
    titleVi: string
    slug: string
    published: boolean
    views: number
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBlogPosts: 0,
    recentOrders: [],
    recentPosts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [productsRes, ordersRes, postsRes] = await Promise.all([
        fetch("/api/admin/products?limit=1"),
        fetch("/api/admin/orders?limit=5"),
        fetch("/api/admin/posts?limit=5"),
      ])

      const [productsData, ordersData, postsData] = await Promise.all([
        productsRes.ok ? productsRes.json() : { pagination: { totalCount: 0 }, products: [] },
        ordersRes.ok ? ordersRes.json() : { orders: [], stats: { totalRevenue: 0 } },
        postsRes.ok ? postsRes.json() : { pagination: { totalCount: 0 }, posts: [] },
      ])

      setStats({
        totalProducts: productsData.pagination?.totalCount || 0,
        totalOrders: ordersData.pagination?.totalCount || ordersData.orders?.length || 0,
        totalRevenue: ordersData.stats?.totalRevenue || 0,
        totalBlogPosts: postsData.pagination?.totalCount || 0,
        recentOrders: ordersData.orders?.slice(0, 5) || [],
        recentPosts: postsData.posts?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `£${Number(amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {loading ? "..." : stats.totalProducts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/admin/products" className="text-sm text-amber-600 hover:text-amber-900">
                  View all →
                </Link>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {loading ? "..." : stats.totalOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-900">
                  View all →
                </Link>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {loading ? "..." : formatCurrency(stats.totalRevenue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/admin/orders" className="text-sm text-green-600 hover:text-green-900">
                  View details →
                </Link>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Blog Posts</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {loading ? "..." : stats.totalBlogPosts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <Link href="/admin/blog" className="text-sm text-purple-600 hover:text-purple-900">
                  View all →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : stats.recentOrders.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No orders yet</div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                statusColors[order.status] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {stats.recentOrders.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Link
                      href="/admin/orders"
                      className="text-sm text-amber-600 hover:text-amber-900 font-medium"
                    >
                      View all orders →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Blog Posts */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Blog Posts</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : stats.recentPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No blog posts yet</div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentPosts.map((post) => (
                      <div key={post.id} className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-amber-600"
                          >
                            {post.titleEn || post.titleVi}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                post.published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {post.published ? "Published" : "Draft"}
                            </span>
                            <span className="flex items-center text-xs text-gray-500">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.views}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {stats.recentPosts.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Link
                      href="/admin/blog"
                      className="text-sm text-amber-600 hover:text-amber-900 font-medium"
                    >
                      View all posts →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/products/new"
                className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow transition"
              >
                <h3 className="text-sm font-medium text-gray-900">Add Product</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new product listing</p>
              </Link>
              <Link
                href="/admin/blog/new"
                className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow transition"
              >
                <h3 className="text-sm font-medium text-gray-900">Write Post</h3>
                <p className="mt-1 text-sm text-gray-500">Create new blog content</p>
              </Link>
              <Link
                href="/admin/orders"
                className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow transition"
              >
                <h3 className="text-sm font-medium text-gray-900">View Orders</h3>
                <p className="mt-1 text-sm text-gray-500">Manage customer orders</p>
              </Link>
              <Link
                href="/admin/products"
                className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow transition"
              >
                <h3 className="text-sm font-medium text-gray-900">Products</h3>
                <p className="mt-1 text-sm text-gray-500">Manage product catalog</p>
              </Link>
              <Link
                href="/admin/blog"
                className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow transition"
              >
                <h3 className="text-sm font-medium text-gray-900">Blog</h3>
                <p className="mt-1 text-sm text-gray-500">Manage blog posts</p>
              </Link>
              <Link
                href="/admin/media"
                className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow transition"
              >
                <h3 className="text-sm font-medium text-gray-900">Media Library</h3>
                <p className="mt-1 text-sm text-gray-500">Upload and manage media</p>
              </Link>
            </div>
          </div>
        </div>
      </AdminSidebar>
    </AdminAuth>
  )
}
