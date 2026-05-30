-- Backfill data consistency cho Pre-Order BLTM.
-- 3 fix tương ứng với 3 bug phát hiện qua data audit ngày 2026-05-30:

-- ---------------------------------------------------------------------------
-- Bug 1: 2 record (id 27, 31) có preorder_quantity = NULL vì được tạo TRƯỚC
-- migration 20260519 thêm cột này. 3 chỗ code xử lý NULL khác nhau:
--   - admin/preorder-bltm/page.tsx       :  || 0   → NULL thành 0
--   - api/preorder-bltm getBltmStats     :  ?? 1   → NULL thành 1
--   - api/cron/preorder-bltm-digest      :  ?? 1   → NULL thành 1
-- → Cùng dataset, admin thấy 9 cái, email thấy 11 cái.
-- Fix: backfill NULL → 1 (khớp intent của ?? 1).
UPDATE "workshop_registrations"
SET "preorder_quantity" = 1
WHERE "workshop_name" = 'Pre-Order BLTM'
  AND "preorder_quantity" IS NULL;

-- ---------------------------------------------------------------------------
-- Bug 2: Customer cũ (đã có trong DB qua flow order/workshop) khi quay lại
-- pre-order KHÔNG được gắn tag 'preorder_bltm' vì code chỉ set tag khi CREATE
-- customer mới. Hậu quả: 2/4 customer pre-order mất tag → filter analytics sai.
UPDATE "customers"
SET "tags" = "tags" || ARRAY['preorder_bltm']
WHERE "id" IN (
  SELECT DISTINCT "customer_id"
  FROM "workshop_registrations"
  WHERE "workshop_name" = 'Pre-Order BLTM'
    AND "customer_id" IS NOT NULL
    AND "deleted_at" IS NULL
)
AND NOT ('preorder_bltm' = ANY("tags"));

-- ---------------------------------------------------------------------------
-- Bug 3: Customer cũ có marketing_consent = false (vd: tạo qua order/Stripe
-- không tự consent) khi pre-order KHÔNG được update consent. Pre-order là
-- hành động chủ động → coi là implicit consent cho marketing.
UPDATE "customers"
SET "marketing_consent" = true,
    "consented_at" = COALESCE("consented_at", NOW())
WHERE "id" IN (
  SELECT DISTINCT "customer_id"
  FROM "workshop_registrations"
  WHERE "workshop_name" = 'Pre-Order BLTM'
    AND "customer_id" IS NOT NULL
    AND "deleted_at" IS NULL
)
AND "marketing_consent" = false;
