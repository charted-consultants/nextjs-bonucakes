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

FORMATTING RULES (Telegram plain text only):
- NEVER use markdown tables (no | pipes |). Use plain numbered lists instead.
- NEVER use asterisks (*) for bold or any other markdown formatting.
- NEVER use underscores (_) for italic.
- Write in plain text only — no markdown whatsoever.
- For order lists, use this format per line:
  #1234 · Customer Name · £28.00 · pending · 15 Apr
- No horizontal rules or heavy formatting.

CONVERSATION RULES:
- If the user sends a short acknowledgment like "ok", "thanks", "got it", "sure", "cool", "nice",
  do NOT re-introduce yourself or list your capabilities. Just say "Anything else?" or similar.
- Only introduce yourself if there is no prior conversation history."""


SONNET = "claude-sonnet-4-6"
HAIKU = "claude-haiku-4-5-20251001"


def ask(user_message: str, history: list[dict] = None) -> str:
    """Agentic loop: Sonnet decides which tools to call, Haiku writes the final answer."""
    messages = list(history or []) + [{"role": "user", "content": user_message}]
    had_tool_calls = False

    for _ in range(5):
        response = client.messages.create(
            model=SONNET,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        if response.stop_reason == "tool_use":
            had_tool_calls = True
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
            continue

        if response.stop_reason == "end_turn":
            if not had_tool_calls:
                # Pure conversation — Sonnet's answer is fine
                for block in response.content:
                    if hasattr(block, "text"):
                        return block.text
                return "Done."

            # Tool calls were made — use Haiku to write the final answer
            messages.append({"role": "assistant", "content": response.content})
            final = client.messages.create(
                model=HAIKU,
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=messages,
            )
            for block in final.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        break

    return "Sorry, I couldn't get that information right now."
