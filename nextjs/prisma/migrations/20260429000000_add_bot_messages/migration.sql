-- CreateTable
CREATE TABLE "bot_messages" (
    "id" SERIAL NOT NULL,
    "telegram_user_id" BIGINT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bot_messages_telegram_user_id_created_at_idx" ON "bot_messages"("telegram_user_id", "created_at");
