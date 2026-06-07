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
- **Khoá học** (`/api/courses/[slug]/enroll`): email xác nhận → khách + admin, lưu lead vào `course_enrollments`
- **Order emails**: `lib/email-templates/order-emails.ts`
- **Gửi email thủ công từ admin** (`/api/admin/send-template-email`): chọn mẫu trong DB, gửi cho khách tick chọn (workshop / khoá học), hỗ trợ hẹn giờ; mỗi lần gửi ghi log vào `email_campaigns`

---

## Khoá học & Email mẫu (admin)

### Khoá học (lead)
- Landing: `app/khoa-hoc-banh-mi-sai-gon/page.tsx` → form POST `/api/courses/[slug]/enroll`
- Lead lưu vào bảng RIÊNG `course_enrollments` (KHÔNG lẫn `workshop_registrations`)
- Slug + tên khoá khai báo ở `lib/registration-types.ts` (`COURSE_SLUG_BANH_MI_SAI_GON`)
- Điều kiện nhận đăng ký: phải có record `courses` đúng slug, `published=true` + `enrollment_open=true`
- Admin xem lead: `/admin/courses/enrollments` (sidebar "Đăng ký Khoá học")

### Email mẫu trong DB (`email_templates`)
- Quản lý ở `/admin/email-templates`: thêm / sửa / xoá (xoá mềm `deletedAt`) / preview
- Lọc theo `category`: `marketing`, `transactional`, `notification`, **`workshop`**, **`course`**
- Trang Workshop chỉ hiện mẫu `category=workshop`; trang Khoá học chỉ hiện `category=course`
- Biến cá nhân hoá: `{name}`, `{email}` (render qua `lib/email-templates/render-template.ts`)
- ⚠️ GET `/api/admin/email-templates` đã lọc `deletedAt=null`; client còn lọc thêm `active`

### Gửi email thủ công + lịch sử
- Trang Workshop (`/admin/workshops`) & Khoá học (`/admin/courses/enrollments`): tick chọn khách →
  chọn mẫu → gửi ngay hoặc hẹn giờ (Resend ~72h)
- API chung: `POST /api/admin/send-template-email` (`{recipients, templateId, scheduledAt?, sourceLabel}`)
- Mỗi lần gửi ghi 1 dòng `email_campaigns` (recipient chỉ log khi có `customerId`)
- Xem lại: `/admin/email-marketing/history` (sidebar "Lịch sử Email"), API `GET /api/admin/campaigns`

### Seed mẫu email (idempotent — upsert theo `name`)
```bash
# cần tunnel DB + .env.local
set -a && source .env.local && set +a
npx tsx prisma/seed-templates.ts
```
Đã seed 8 mẫu: 4 workshop (`workshop-reminder-1day`, `-registered-confirm`, `-thankyou`, `-reschedule`) +
4 course (`course-received-confirm`, `-payment-invite`, `-start-reminder`, `-followup-thankyou`).

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
- `courses` + `course_faqs` — dữ liệu khoá học (vd Bánh Mì Sài Gòn)
- `course_enrollments` — lead đăng ký khoá học (bảng RIÊNG, không lẫn workshop)
- `email_templates` — mẫu email lưu DB, lọc theo `category`
- `email_campaigns` + `email_campaign_recipients` — log các email đã gửi (cho trang Lịch sử Email)

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

- **Build cache lỗi** (`Cannot find module './xxxx.js'`, `MODULE_NOT_FOUND`, "missing required error components"): xoá `.next/` rồi restart dev server. ⚠️ KHÔNG chạy `npm run build` trong lúc `npm run dev` đang chạy — `build` ghi đè `.next/` làm dev server hỏng chunk. Muốn build kiểm tra: dừng dev trước, hoặc `rm -rf .next` rồi `npm run dev` lại sau khi build.
- **Nginx staging**: các block `location /api/` đã bị xoá vĩnh viễn để tránh routing nhầm
- **`products.json`** trong `public/`: dữ liệu tĩnh dự phòng, không phải source chính
- **Bilingual**: tất cả text UI hỗ trợ VI/EN qua `useLanguage()` hook
- **Resend build-time**: không khởi tạo `new Resend()` ở module level
