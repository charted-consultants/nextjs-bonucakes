"""Bonucakes Admin Telegram Bot — read-only store assistant powered by Claude."""

import logging
import os
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from agent import ask
from db import load_history, save_messages, clear_history

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
        return True
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
        "• What products do we have available?\n\n"
        "Use /new to start a fresh conversation."
    )


async def new_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_allowed(update):
        return
    user_id = update.effective_user.id
    try:
        clear_history(user_id)
    except Exception as e:
        logger.error("Failed to clear history: %s", e)
    await update.message.reply_text("Fresh start! What would you like to know?")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_allowed(update):
        logger.warning("Blocked user %d", update.effective_user.id)
        return

    user_id = update.effective_user.id
    user_text = update.message.text
    logger.info("User %d: %s", user_id, user_text)

    await update.message.reply_chat_action("typing")

    try:
        history = load_history(user_id)
    except Exception as e:
        logger.error("Failed to load history: %s", e)
        history = []

    try:
        reply = ask(user_text, history)
    except Exception as e:
        logger.error("Agent error: %s", e)
        reply = "Something went wrong — please try again."

    await update.message.reply_text(reply)

    try:
        save_messages(user_id, user_text, reply)
    except Exception as e:
        logger.error("Failed to save messages: %s", e)


def main() -> None:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise ValueError("TELEGRAM_BOT_TOKEN is not set")

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("new", new_conversation))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Starting bonucakes_admin bot...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
