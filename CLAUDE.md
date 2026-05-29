# CLAUDE.md — Bonucakes / Bếp Bà Bo (Monorepo)

> Đây là file tổng quan cho **toàn bộ repo**. Code chính của web nằm trong `nextjs/`
> và đã có CLAUDE.md riêng rất chi tiết — **xem `nextjs/CLAUDE.md` khi làm việc với app**.

---

## Tổng quan

Thương hiệu **Bonucakes / Bếp Bà Bo** — bán đồ ăn Việt Nam tự làm cho thị trường UK (giá GBP).
Repo này là monorepo gồm web app, bot quản trị, site HTML cũ và tài liệu kinh doanh.

- **Đường dẫn:** `/Users/truongsanhcuong/CODE/nextjs-bonucakes`
- **Git remote:** `github.com:charted-consultants/nextjs-bonucakes`
- **Là git repo:** có

---

## Cấu trúc repo

| Thư mục / file | Nội dung | Stack |
|----------------|----------|-------|
| **`nextjs/`** | ⭐ App chính: web TMĐT + API + admin | Next.js 14.2.3 · TS · Tailwind · Prisma/PostgreSQL · Stripe · Resend · R2 |
| **`bot/`** | Telegram bot quản trị **read-only**, hỏi đáp về đơn/doanh thu/sản phẩm | Python · python-telegram-bot · Anthropic (Claude) · psycopg2 |
| **`html/`** | Site HTML tĩnh cũ (brochure, tiền thân trước khi migrate sang Next.js) | HTML/CSS/JS |
| **`public/`** | Assets tĩnh dùng chung | — |
| **`docs/`** | Tài liệu kinh doanh: pricing, brand voice, invoice, SOW, refactor plan (`.md` / `.typ` / `.pdf`) | Typst / Markdown |
| **`facebook_data/`** | Export dữ liệu Facebook | — |
| `email-*.html`, `workshop-*.html` | Template email (workshop reminder, newsletter, promotion, announcement) | HTML |
| `*-analysis.md/html`, `workshop-*.md` | Phân tích & nội dung: BCG matrix, vị trí nhà hàng, insight workshop | — |
| `SETUP.md` | Hướng dẫn setup site tĩnh + auto-deploy lên VPS qua GitHub Actions | — |
| `bonu-platform-architecture.md` | Kiến trúc tổng thể nền tảng Bonu | — |
| `DJI_*.aac`, `hero-bg.mp4` | File media lớn | — |

---

## Bắt đầu nhanh

### Web app (chính)
```bash
cd nextjs
npm run dev        # localhost:3000
```
⚠️ Phải mở SSH tunnel tới DB staging **trước khi dev** — chi tiết trong `nextjs/CLAUDE.md`.

### Bot Telegram
```bash
cd bot
pip install -r requirements.txt
python main.py
```
Cần env: `ANTHROPIC_API_KEY`, `ALLOWED_TELEGRAM_USER_IDS`, và connection string DB.
Bot **chỉ đọc** (không sửa dữ liệu), dùng tool query DB trực tiếp.

---

## Quy tắc dự án

- Ảnh đưa lên web nén thành **WebP** trước (`cwebp -q 85`)
- Commit git **chỉ khi được yêu cầu rõ ràng**; không tự push lên remote
- Kiểm tra `pwd` trước khi đọc/sửa file
- Secrets (`.env.local`, `.env.*.local`, key bot) **không bao giờ** track vào git
- Khi sửa app: ưu tiên đọc `nextjs/CLAUDE.md` để nắm hardcoded products, email flow, màu thương hiệu, deploy

---

## Tài liệu liên quan

- `nextjs/CLAUDE.md` — hướng dẫn chi tiết cho web app (deploy, DB, email, sản phẩm hardcoded)
- `nextjs/SETUP.md`, `nextjs/PRODUCTION_DEPLOYMENT_GUIDE.md` — setup & deploy app
- `nextjs/STRIPE_*.md`, `nextjs/CART_*.md`, `nextjs/CHECKOUT-FLOW-GUIDE.md` — module nghiệp vụ
- `bonu-platform-architecture.md` — kiến trúc nền tảng
