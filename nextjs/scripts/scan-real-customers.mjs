#!/usr/bin/env node
/**
 * scan-real-customers.mjs
 * Quét & xác nhận danh sách KHÁCH THẬT đăng ký workshop, loại bỏ account tester.
 *
 * Chạy được trên bất kỳ DB nào — chỉ cần đổi DATABASE_URL:
 *
 *   # Staging (qua tunnel 5441)
 *   DATABASE_URL="postgresql://user:pass@localhost:5441/bonucakes_staging" \
 *     node scripts/scan-real-customers.mjs
 *
 *   # Production (DB main) — set đúng DATABASE_URL production
 *   DATABASE_URL="postgresql://...prod..." node scripts/scan-real-customers.mjs
 *
 * Tuỳ chọn:
 *   --workshop "Tên workshop"   chỉ quét 1 workshopName cụ thể
 *   --csv out.csv               xuất CSV danh sách khách thật
 *
 * Lưu ý: tester chỉ là nhãn NỘI BỘ để dọn dẹp — KHÔNG ảnh hưởng logic web.
 * Danh sách tester đồng bộ với nextjs/CLAUDE.md.
 */
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// ── Tester emails (đồng bộ với CLAUDE.md) ─────────────────────────────
export const TESTER_EMAILS = [
  'test@test.com',
  'truongsanhcuong246@gmail.com', // Cường Trương – DavidC
  'tramanhng.mba@gmail.com',      // Candy Nguyễn
  'nhanulaw0209@gmail.com',       // Phan Nhan
  'tpminhngan0122@gmail.com',     // Taylor Swift
].map((e) => e.toLowerCase());

const isTester = (email) => TESTER_EMAILS.includes((email || '').toLowerCase());

// ── Args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const onlyWorkshop = getArg('--workshop');
const csvPath = getArg('--csv');

if (!process.env.DATABASE_URL) {
  console.error('❌ Thiếu DATABASE_URL. Ví dụ:\n   DATABASE_URL="postgresql://..." node scripts/scan-real-customers.mjs');
  process.exit(1);
}
// In ra host để xác nhận đang nối ĐÚNG DB (ẩn mật khẩu)
console.log('🔌 DB:', process.env.DATABASE_URL.replace(/:\/\/[^@]+@/, '://***@'));

const prisma = new PrismaClient();

const where = { deletedAt: null };
if (onlyWorkshop) where.workshopName = onlyWorkshop;

const rows = await prisma.workshopRegistration.findMany({
  where,
  include: { customer: true },
  orderBy: [{ workshopName: 'asc' }, { registrationDate: 'asc' }],
});

// ── Gom & phân loại ───────────────────────────────────────────────────
const realByEmail = new Map();   // email -> {name, workshops:Set}
let realRows = 0, testRows = 0;
const byWorkshop = {};           // workshopName -> {real:Set, test:number}

for (const r of rows) {
  const email = (r.customer?.email || '').toLowerCase();
  const ws = r.workshopName;
  byWorkshop[ws] ??= { real: new Set(), test: 0 };
  if (!email || isTester(email)) {
    testRows++; byWorkshop[ws].test++;
    continue;
  }
  realRows++; byWorkshop[ws].real.add(email);
  if (!realByEmail.has(email)) realByEmail.set(email, { name: r.customer?.name, workshops: new Set() });
  realByEmail.get(email).workshops.add(ws);
}

// ── Report ────────────────────────────────────────────────────────────
console.log(`\n=== Phân loại theo workshopName${onlyWorkshop ? ` (lọc: ${onlyWorkshop})` : ''} ===`);
for (const [ws, v] of Object.entries(byWorkshop)) {
  console.log(`  • ${ws}\n      khách THẬT: ${v.real.size} email | tester: ${v.test}`);
}
console.log(`\n=== TỔNG ===`);
console.log(`  Dòng đăng ký: ${rows.length} (thật ${realRows} / test ${testRows})`);
console.log(`  KHÁCH THẬT (email duy nhất): ${realByEmail.size}`);

if (csvPath) {
  const esc = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const lines = ['email,ten,workshops'];
  for (const [email, v] of realByEmail) lines.push([esc(email), esc(v.name), esc([...v.workshops].join(' | '))].join(','));
  fs.writeFileSync(csvPath, '﻿' + lines.join('\n'), 'utf8');
  console.log(`\n📄 Đã xuất CSV khách thật: ${csvPath}`);
}

await prisma.$disconnect();
