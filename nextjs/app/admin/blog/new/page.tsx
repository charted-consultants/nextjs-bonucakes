"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titleVi: "",
    titleEn: "",
    excerptVi: "",
    excerptEn: "",
    contentVi: "",
    contentEn: "",
    slug: "",
    image: "",
    category: "",
    tags: "",
    author: "Uyen Nguyen",
    authorImage: "",
    authorRole: "F&B Business Consultant",
    featured: false,
    published: false,
    metaTitle: "",
    metaDescription: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Auto-generate slug from English title
    if (name === "titleEn" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Parse tags from comma-separated string
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : []

      const postData = {
        ...formData,
        tags,
      }

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create post")
      }

      const data = await response.json()
      router.push(`/admin/blog/${data.post.id}`)
    } catch (err) {
      console.error("Error creating post:", err)
      setError(err instanceof Error ? err.message : "Failed to create post")
      setSaving(false)
    }
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/blog"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Blog Post</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new blog post
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title (Vietnamese) *
                  </label>
                  <input
                    type="text"
                    name="titleVi"
                    value={formData.titleVi}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9-]+"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL-friendly version (lowercase, hyphens only)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Excerpt (Vietnamese)
                  </label>
                  <textarea
                    name="excerptVi"
                    value={formData.excerptVi}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Excerpt (English)
                  </label>
                  <textarea
                    name="excerptEn"
                    value={formData.excerptEn}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Content</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content (Vietnamese) *
                </label>
                <textarea
                  name="contentVi"
                  value={formData.contentVi}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                  placeholder="Markdown or HTML content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content (English) *
                </label>
                <textarea
                  name="contentEn"
                  value={formData.contentEn}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                  placeholder="Markdown or HTML content..."
                />
              </div>
            </div>

            {/* Media & Meta */}
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Media & Metadata</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., business, recipes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Comma-separated: tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author Image URL
                  </label>
                  <input
                    type="url"
                    name="authorImage"
                    value={formData.authorImage}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author Role
                  </label>
                  <input
                    type="text"
                    name="authorRole"
                    value={formData.authorRole}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">SEO</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Publishing Options</h2>

              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish Now</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                href="/admin/blog"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </AdminSidebar>
    </AdminAuth>
  )
}
