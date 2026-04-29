"""Claude agent that answers questions about the Bonucakes store using the CLI API."""

import json
import os
import anthropic
from tools import TOOL_DEFINITIONS, call_tool

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a helpful assistant for Bonucakes, a Vietnamese bakery in the UK.
You help the shop owner quickly check on their store — orders, revenue, and products.

You have access to tools that query the live store data. Use them to give accurate,
concise answers. Format numbers nicely (e.g. £1,234.56). Keep responses short and friendly.
If asked something you can't help with (like editing data), politely say you're read-only for now.

FORMATTING RULES (Telegram does not render markdown tables):
- NEVER use markdown tables (no | pipes |). Use plain numbered lists instead.
- For order lists, use this format per line:
  #1234 · Customer Name · £28.00 · pending · 15 Apr
- Bold with *text*, italic with _text_. Keep it simple.
- No horizontal rules or heavy formatting.

CONVERSATION RULES:
- If the user sends a short acknowledgment like "ok", "thanks", "got it", "sure", "cool", "nice",
  do NOT re-introduce yourself or list your capabilities. Just say "Anything else?" or similar.
- Only introduce yourself if there is no prior conversation history."""


def ask(user_message: str, history: list[dict] = None) -> str:
    """Run a single-turn agentic loop with optional conversation history."""
    messages = list(history or []) + [{"role": "user", "content": user_message}]

    for _ in range(5):  # max 5 tool-call rounds
        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        if response.stop_reason != "tool_use":
            break

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = call_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return "Sorry, I couldn't get that information right now."
