# CLAUDE.md — Bonucakes / Bếp Bà Bo

## Tổng quan dự án
Website thương mại điện tử bán đồ ăn Việt Nam tự làm (Bếp Bà Bo). Khách UK, giá GBP.

- **Frontend + API**: Next.js 14.2.3 (App Router), TypeScript, Tailwind CSS
- **DB**: PostgreSQL qua Prisma ORM
- **Email**: Resend
- **Ảnh**: Cloudflare R2 (`https://static.bonucakes.com`)
- **Thanh toán**: Stripe
- **Repo**: `github.com:charted-consultants/nextjs-bonucakes`
- **Code chính**: `/nextjs/` trong repo

---

## Môi trường

### Local dev
```bash
cd nextjs
npm run dev        # chạy trên localhost:3000
```
**Bắt buộc** mở SSH tunnel trước khi dev:
```bash
ssh -L 5441:localhost:5441 root@143.110.167.193 -N -f
```
`.env.local` chứa secrets (gitignored):
```
DATABASE_URL=postgresql://bonucakes_user:bonucakes2026_staging@localhost:5441/bonucakes_staging
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
ADMIN_EMAIL=...
```

### Staging
- Server: `143.110.167.193`
- URL: `https://staging.bonucakes.com`
- DB: Docker container `bonucakes-staging-db-1`, port `5441`
- Env: `/root/docker-images/bonucakes-staging/.env` (không có trong git)
- Deploy: push lên branch `staging` → CI/CD tự chạy
```bash
git push origin main:staging
```

### Production
- URL: `https://bonucakes.com`
- Deploy: push lên branch `main`
```bash
git push origin main
```

---

## Git workflow
```bash
# Deploy staging
git push origin main:staging

# Deploy production
git push origin main

# Deploy cả hai cùng lúc
git push origin main && git push origin main:staging
```

**Quan trọng:**
- `.env.local` và `.env.*.local` bị gitignore
- `.env` được track (không chứa secrets — chỉ có comment và public keys)
- Env trên server không bị ghi đè khi deploy

---

## Cấu trúc thư mục (`/nextjs`)

```
app/
  page.tsx                    # Trang chủ
  products/
    page.tsx                  # Danh sách sản phẩm
    [slug]/page.tsx           # Chi tiết sản phẩm
  preorderBLTM/page.tsx       # Pre-order Bánh Bông Lan Trứng Muối
  workshop/page.tsx           # Đăng ký workshop Bếp Bà Bo
  cart/page.tsx
  checkout/page.tsx
  admin/                      # Trang admin (protected)
  api/
    products/route.ts         # GET danh sách sản phẩm (public)
    products/[slug]/route.ts  # GET chi tiết sản phẩm (public)
    preorder-bltm/route.ts    # POST pre-order BLTM
    workshop/route.ts         # POST đăng ký workshop
    orders/route.ts
    admin/                    # Các API admin (protected)
    cron/                     # Cron jobs

components/
  ProductCard.tsx             # Card sản phẩm — có hardcode slug BLTM → Pre-Order
  ProductBadge.tsx
  LanguageToggle.tsx          # VI/EN toggle — dùng useLanguage()
  Navbar.tsx
  Footer.tsx

lib/
  hardcoded-products.ts       # ⚠️ BLTM + Chà Bông hardcoded ở đây
  prisma.ts
  api-helpers.ts
  stores/cart-store.ts        # Zustand cart store
  email-templates/

public/
  products.json               # Static product data (backup, không dùng làm source chính)
```

---

## Sản phẩm hardcoded quan trọng

2 sản phẩm này **luôn serve từ code**, không phụ thuộc DB:

| Sản phẩm | Slug | Giá | Available |
|----------|------|-----|-----------|
| Bánh Bông Lan Trứng Muối | `banh-bong-lan-trung-muoi` | £40/cái | false (Pre-Order) |
| Chà Bông Heo | `cha-bong` | £35/500g, £70/1kg | true |

**File:** `lib/hardcoded-products.ts`

Logic API:
- DB query trong `try/catch` riêng — nếu DB fail, hardcoded vẫn hiện
- Hardcoded luôn đứng đầu danh sách, DB slugs trùng bị loại bỏ
- Detail API check hardcoded trước, không query DB cho 2 slug này

**Nút bấm BLTM:** `ProductCard.tsx` có case đặc biệt cho slug `banh-bong-lan-trung-muoi` → Link đến `/preorderBLTM`

---

## Email (Resend)

- Khởi tạo Resend **bên trong handler**, không phải module level (tránh lỗi build)
- `FROM_EMAIL`: đọc từ `RESEND_FROM_EMAIL` env
- `ADMIN_EMAIL`: đọc từ `ADMIN_EMAIL` env
- Secrets KHÔNG được track trong git

Các luồng email:
- **Pre-order BLTM** (`/api/preorder-bltm`): email xác nhận → khách + admin
- **Workshop** (`/api/workshop`): email xác nhận → khách + admin
- **Order emails**: `lib/email-templates/order-emails.ts`

---

## Màu thương hiệu (Tailwind)

| Tên | Hex |
|-----|-----|
| `primary` | `#083121` (xanh đậm) |
| `secondary` | `#fcc56c` (vàng gold) |
| `light` | `#f8faf9` (nền sáng) |
| `muted` | `#4a5c52` (xám xanh) |

---

## DB

### Tunnel local
```bash
ssh -L 5441:localhost:5441 root@143.110.167.193 -N -f
```
Kiểm tra tunnel còn sống:
```bash
lsof -i :5441 | grep LISTEN
```

### Prisma
```bash
npx prisma db push      # sync schema lên DB
npx prisma studio       # GUI quản lý DB
```

### Các bảng chính
- `products` + `product_variants`
- `customers`
- `orders` + `order_items`
- `workshop_registrations` — dùng cho cả workshop lẫn pre-order BLTM
- `reviews`

### 🧪 Email tester — chỉ là nhãn nội bộ để DỌN DẸP, KHÔNG đụng logic web

Đây là các tài khoản chủ dự án dùng để **test logic web**. Quy ước:
- ⚠️ **"Tester" KHÔNG phải khái niệm trong code/logic web.** Web app phải xử lý **chuẩn cho TẤT CẢ email như nhau** (gửi email xác nhận, lưu đơn/đăng ký, v.v.) — TUYỆT ĐỐI không hardcode kiểu "nếu email tester thì bỏ qua".
- Nhãn tester chỉ để **anh + Claude** biết đơn nào là test khi cần **scan & dọn dẹp DB**.
- Khi anh hỏi thống kê đơn/khách: báo đủ data, nhưng **tách 2 bảng** "Khách thật" vs "Tester" cho dễ nhìn.
- Chỉ **xoá đơn test** khi anh yêu cầu rõ ràng — luôn giữ nguyên data khách thật.

| Email | Ghi chú |
|-------|---------|
| `test@test.com` | Check Test |
| `truongsanhcuong246@gmail.com` | Cường Trương – DavidC (chủ dự án) |
| `tramanhng.mba@gmail.com` | "Candy Nguyễn" – tester |
| `nhanulaw0209@gmail.com` | "Phan Nhan" – tester |
| `tpminhngan0122@gmail.com` | "Taylor Swift" – tester |

Tính tới 2026-06-05 (`workshop_registrations`, chưa xoá): tổng 41 dòng = **23 dòng khách thật / 22 người** (đều thuộc workshop *"Triển khai và thiết lập mục tiêu"* 04/03/2026) + **18 dòng tester**. Pre-order BLTM và 2 đợt workshop/tư vấn tháng 5 hiện toàn bộ là tester.

---

## Lưu ý kỹ thuật

- **Build cache lỗi** (`MODULE_NOT_FOUND`): xoá `.next/` rồi restart dev server
- **Nginx staging**: các block `location /api/` đã bị xoá vĩnh viễn để tránh routing nhầm
- **`products.json`** trong `public/`: dữ liệu tĩnh dự phòng, không phải source chính
- **Bilingual**: tất cả text UI hỗ trợ VI/EN qua `useLanguage()` hook
- **Resend build-time**: không khởi tạo `new Resend()` ở module level
