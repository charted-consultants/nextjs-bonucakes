"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Star, CheckCircle, XCircle } from "lucide-react"

interface Review {
  id: number
  productId: number
  productName: string
  customerName: string
  customerEmail: string
  rating: number
  comment: string | null
  approved: boolean
  createdAt: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("approved", filter)
      }

      const res = await fetch(`/api/admin/reviews?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to fetch reviews")

      setReviews(data.reviews)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateReviewStatus = async (id: number, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update review")
      }

      fetchReviews()
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  const deleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete review")
      }

      fetchReviews()
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage product reviews and ratings
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-md border-gray-300 text-sm focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Reviews</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>

          {/* Reviews list */}
          <div className="bg-white shadow rounded-lg">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading reviews...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">Error: {error}</div>
            ) : reviews.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No reviews found.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {renderStars(review.rating)}
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              review.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {review.approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {review.customerName}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Product: {review.productName}
                        </p>
                        {review.comment && (
                          <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleString("en-GB")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!review.approved && (
                          <button
                            onClick={() => updateReviewStatus(review.id, true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </button>
                        )}
                        {review.approved && (
                          <button
                            onClick={() => updateReviewStatus(review.id, false)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Unapprove
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="text-red-600 hover:text-red-900 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminSidebar>
    </AdminAuth>
  )
}
