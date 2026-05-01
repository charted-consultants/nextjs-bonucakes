/**
 * Import orders from Resend emails with full details
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const orders = [
  {
    orderNumber: "1414",
    customerName: "Anh Bui",
    customerEmail: "info@012.vn",
    customerPhone: "N/A",
    shippingAddress: "UK",
    items: [
      {
        productName: "Bánh Mì Sài Gòn",
        quantity: 12, // 11 paid + 1 free (buy 10 get 1)
        unitPrice: 9,
        subtotal: 99,
        notes: "Mua 10 tặng 1 (thực tế 12 ổ)"
      }
    ],
    subtotal: 99,
    shippingFee: 8,
    total: 107,
    paymentMethod: "bank_transfer",
    paymentStatus: "pending",
    orderStatus: "pending",
    orderDate: new Date("2026-02-24T20:40:50Z"),
    notes: "Thanh toán chuyển khoản Tide - Bonu Cakes Ltd (04-06-05, 18828806)"
  },
  {
    orderNumber: "0970",
    customerName: "Ha Phuong Vo",
    customerEmail: "ivyhaphuong@gmail.com",
    customerPhone: "07389091380",
    shippingAddress: "Barrhead nail, 104-106 Main Street, Barrhead, G78 1SE",
    items: [
      {
        productName: "Bánh Mì Sài Gòn",
        quantity: 5,
        unitPrice: 9,
        subtotal: 45,
        notes: null
      }
    ],
    subtotal: 45,
    shippingFee: 8,
    total: 53,
    paymentMethod: "unknown",
    paymentStatus: "pending",
    orderStatus: "pending",
    orderDate: new Date("2026-03-01T07:29:42Z"),
    notes: null
  }
]

async function importOrders() {
  console.log('Starting order import from Resend emails...\n')

  for (const orderData of orders) {
    try {
      console.log(`Processing Order #${orderData.orderNumber}...`)

      // Check if order already exists
      const existing = await prisma.order.findFirst({
        where: { orderNumber: orderData.orderNumber }
      })

      if (existing) {
        console.log(`  ⚠ Order #${orderData.orderNumber} already exists - skipping`)
        continue
      }

      // Find or create product
      let product = await prisma.product.findFirst({
        where: {
          slug: "banh-mi-saigon"
        }
      })

      if (!product) {
        console.log(`  ℹ Product "Bánh Mì Sài Gòn" not found - creating`)
        product = await prisma.product.create({
          data: {
            nameVi: "Bánh Mì Sài Gòn",
            nameEn: "Saigon Banh Mi",
            slug: "banh-mi-saigon",
            descriptionVi: "Bánh mì Việt Nam truyền thống với nhân đầy đủ",
            descriptionEn: "Traditional Vietnamese baguette with full fillings",
            price: 9,
            category: "Savory",
            featured: true,
            available: true,
            stock: 100,
            stockStatus: "in_stock",
            trackInventory: false
          }
        })
      }

      // Create order with items
      const order = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          shippingAddress: orderData.shippingAddress
            ? { address: orderData.shippingAddress, country: "UK" }
            : { address: "UK", country: "UK" },
          billingAddress: orderData.shippingAddress
            ? { address: orderData.shippingAddress, country: "UK" }
            : { address: "UK", country: "UK" },
          items: {
            create: orderData.items.map(item => ({
              productId: product!.id,
              productName: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
              subtotal: item.subtotal
            }))
          },
          subtotal: orderData.subtotal,
          shippingCost: orderData.shippingFee,
          total: orderData.total,
          currency: "GBP",
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          status: orderData.orderStatus,
          customerNote: orderData.notes,
          createdAt: orderData.orderDate
        },
        include: {
          items: true
        }
      })

      console.log(`  ✓ Created Order #${orderData.orderNumber}`)
      console.log(`    Customer: ${orderData.customerName} (${orderData.customerEmail})`)
      console.log(`    Items: ${orderData.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}`)
      console.log(`    Total: £${orderData.total}`)
      console.log()

    } catch (error: any) {
      console.error(`  ✗ Failed to import Order #${orderData.orderNumber}:`, error.message)
    }
  }

  console.log('\n✅ Order import complete!')
}

importOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
