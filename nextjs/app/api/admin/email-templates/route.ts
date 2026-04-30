import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, displayName, description, subject, htmlContent, variables, category, active, isDefault } = body

    if (!name || !displayName || !htmlContent) {
      return NextResponse.json(
        { error: "Name, displayName, and htmlContent are required" },
        { status: 400 }
      )
    }

    // Check if template with this name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        displayName,
        description: description || null,
        subject: subject || "",
        htmlContent,
        variables: variables || [],
        category: category || null,
        active: active !== undefined ? active : true,
        isDefault: isDefault || false,
      }
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, displayName, description, subject, htmlContent, variables, category, active, isDefault } = body

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // If name is being changed, check it's not taken by another template
    if (name && name !== existingTemplate.name) {
      const nameTaken = await prisma.emailTemplate.findUnique({
        where: { name }
      })
      if (nameTaken) {
        return NextResponse.json(
          { error: "Template name already in use" },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (displayName !== undefined) updateData.displayName = displayName
    if (description !== undefined) updateData.description = description
    if (subject !== undefined) updateData.subject = subject
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent
    if (variables !== undefined) updateData.variables = variables
    if (category !== undefined) updateData.category = category
    if (active !== undefined) updateData.active = active
    if (isDefault !== undefined) updateData.isDefault = isDefault

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error updating email template:", error)
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    await prisma.emailTemplate.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    )
  }
}
