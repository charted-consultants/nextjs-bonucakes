"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react"

interface BlogPost {
  id: number
  titleVi: string
  titleEn: string
  slug: string
  published: boolean
  featured: boolean
  publishedAt: string | null
  views: number
  createdAt: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPosts()
  }, [currentPage, statusFilter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        status: statusFilter,
      })

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/admin/posts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch posts")

      const data = await response.json()
      setPosts(data.posts)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete post")

      fetchPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Failed to delete post")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not published"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your blog content
              </p>
            </div>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Search
                </button>
              </form>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No posts found. Create your first blog post!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {post.titleEn || post.titleVi}
                          </div>
                          <div className="text-sm text-gray-500">/{post.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.published
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                          {post.featured && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.publishedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-gray-400" />
                            {post.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          {post.published && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Eye className="h-4 w-4 inline" />
                            </a>
                          )}
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            <Edit className="h-4 w-4 inline" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminSidebar>
    </AdminAuth>
  )
}
