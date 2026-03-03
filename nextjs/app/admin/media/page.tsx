"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminAuth from "@/components/admin/AdminAuth"
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from "lucide-react"

interface MediaFile {
  key: string
  url: string
  size: number
  lastModified: Date
  filename: string
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/media")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to fetch media")

      setFiles(data.files || [])
    } catch (err: any) {
      console.error("Error fetching media:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    try {
      setUploading(true)

      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to upload file")
        }
      }

      fetchMedia()
      e.target.value = ""
    } catch (err: any) {
      alert("Error uploading files: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (key: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const res = await fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete file")
      }

      fetchMedia()
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename)
  }

  return (
    <AdminAuth>
      <AdminSidebar>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload and manage images and files
              </p>
            </div>
            <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Files"}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-12">Loading media...</div>
            ) : files.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No media files yet. Upload your first file!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file) => (
                  <div
                    key={file.key}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 relative group">
                      {isImage(file.filename) ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => deleteFile(file.key)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 mr-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => copyUrl(file.url)}
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-900 truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
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
