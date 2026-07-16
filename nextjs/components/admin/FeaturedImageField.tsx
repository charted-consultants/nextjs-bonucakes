"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"

type Props = {
  value: string
  onChange: (url: string) => void
}

export default function FeaturedImageField({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "blog")
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok || !json?.media?.url) {
        throw new Error(json?.error || "Upload failed")
      }
      onChange(json.media.url as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Featured Image</label>

      {value ? (
        <div className="mt-2 relative inline-block">
          <img
            src={value}
            alt="Featured"
            className="h-40 w-auto rounded-md border border-gray-300 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#083121] hover:bg-gray-50">
          <Upload className="h-6 w-6 text-gray-400" />
          <span className="mt-1 text-sm text-gray-500">
            {uploading ? "Uploading..." : "Click to upload an image"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <div className="mt-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL directly"
          className="block w-full text-sm border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-[#083121] focus:border-[#083121]"
        />
      </div>
    </div>
  )
}
