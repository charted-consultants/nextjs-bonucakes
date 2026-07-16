"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { useCallback } from "react"

type Props = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-sm border transition-colors ${
        active
          ? "bg-[#083121] text-white border-[#083121]"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  )
}

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("folder", "blog-content")
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
  const json = await res.json()
  if (!res.ok || !json?.media?.url) {
    throw new Error(json?.error || "Upload failed")
  }
  return json.media.url as string
}

function Toolbar({ editor }: { editor: Editor }) {
  const addImage = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const url = await uploadImageFile(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Upload failed")
      }
    }
    input.click()
  }, [editor])

  const setLink = useCallback(() => {
    const url = window.prompt("Link URL:")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-t-md bg-gray-50">
      <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</ToolbarButton>
      <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><em>I</em></ToolbarButton>
      <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolbarButton>
      <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</ToolbarButton>
      <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>• List</ToolbarButton>
      <ToolbarButton title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1. List</ToolbarButton>
      <ToolbarButton title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>&ldquo;</ToolbarButton>
      <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</ToolbarButton>
      <ToolbarButton title="Link" onClick={setLink} active={editor.isActive("link")}>Link</ToolbarButton>
      <ToolbarButton title="Image" onClick={addImage}>Image</ToolbarButton>
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>Undo</ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>Redo</ToolbarButton>
    </div>
  )
}

const EXTENSIONS = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
]

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...EXTENSIONS,
      Placeholder.configure({ placeholder: placeholder || "Write your post…" }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none border border-t-0 border-gray-300 rounded-b-md p-4 min-h-[280px] focus:outline-none [&_*:focus]:outline-none"
      />
    </div>
  )
}
