"use client"

import { useState, useEffect } from 'react'
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface Product {
  id: number
  nameVi: string
  nameEn: string
  slug: string
  price: number
  category: string
  imageSrc: string | null
  available: boolean
  stock: number
  stockStatus: string
  featured: boolean
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('category', filter)
      }

      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch products')

      setProducts(data.products)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete product')
      }

      setProducts(products.filter(p => p.id !== id))
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'food', label: 'Food Products' },
    { value: 'beverage', label: 'Beverages' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'snack', label: 'Snacks' },
  ]

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product catalog
              </p>
            </div>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Product
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading products...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">Error: {error}</div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No products found. <Link href="/admin/products/new" className="text-amber-600 hover:text-amber-700">Add your first product</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.imageSrc ? (
                                <img
                                  className="h-10 w-10 rounded object-cover"
                                  src={product.imageSrc}
                                  alt={product.nameEn}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No img</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.nameVi}</div>
                              <div className="text-sm text-gray-500">{product.nameEn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          £{Number(product.price).toLocaleString('en-GB')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                          <div className="text-xs text-gray-500">{product.stockStatus}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {product.available ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-amber-600 hover:text-amber-900 mr-4 inline-flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminSidebar>
    </AdminAuth>
  )
}
