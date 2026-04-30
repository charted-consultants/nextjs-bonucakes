"""Database helpers for persisting bot conversation history."""

import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.getenv("DATABASE_URL", "")
HISTORY_LIMIT = 20  # messages to load per conversation


def _conn():
    return psycopg2.connect(DATABASE_URL)


def load_history(telegram_user_id: int) -> list[dict]:
    """Return the last HISTORY_LIMIT messages for a user, oldest first."""
    with _conn() as conn, conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute(
            """
            SELECT role, content FROM (
                SELECT role, content, created_at
                FROM bot_messages
                WHERE telegram_user_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            ) sub
            ORDER BY created_at ASC
            """,
            (telegram_user_id, HISTORY_LIMIT),
        )
        return [{"role": row["role"], "content": row["content"]} for row in cur.fetchall()]


def save_messages(telegram_user_id: int, user_text: str, assistant_text: str) -> None:
    """Persist a user+assistant exchange."""
    with _conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO bot_messages (telegram_user_id, role, content) VALUES (%s, %s, %s), (%s, %s, %s)",
            (telegram_user_id, "user", user_text, telegram_user_id, "assistant", assistant_text),
        )
        conn.commit()


def clear_history(telegram_user_id: int) -> None:
    """Delete all messages for a user (triggered by /new command)."""
    with _conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM bot_messages WHERE telegram_user_id = %s", (telegram_user_id,))
        conn.commit()
