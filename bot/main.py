"""Bonucakes Admin Telegram Bot — read-only store assistant powered by Claude."""

import logging
import os
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from agent import ask

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

ALLOWED_IDS = set(
    int(uid.strip())
    for uid in os.getenv("ALLOWED_TELEGRAM_USER_IDS", "").split(",")
    if uid.strip()
)


def is_allowed(update: Update) -> bool:
    if not ALLOWED_IDS:
        return True  # open if no allowlist configured
    return update.effective_user.id in ALLOWED_IDS


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_allowed(update):
        return
    await update.message.reply_text(
        "Hi! I'm the Bonucakes admin bot 🎂\n\n"
        "Ask me anything about your store — orders, revenue, products.\n\n"
        "Examples:\n"
        "• How are sales this week?\n"
        "• Show me pending orders\n"
        "• What products do we have available?"
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_allowed(update):
        logger.warning("Blocked user %d", update.effective_user.id)
        return

    user_text = update.message.text
    logger.info("User %d: %s", update.effective_user.id, user_text)

    await update.message.reply_chat_action("typing")

    try:
        reply = ask(user_text)
    except Exception as e:
        logger.error("Agent error: %s", e)
        reply = "Something went wrong — please try again."

    await update.message.reply_text(reply)


def main() -> None:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise ValueError("TELEGRAM_BOT_TOKEN is not set")

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Starting bonucakes_admin bot...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
