from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services.pulse_tools import TOOL_DEFINITIONS, execute_tool
import anthropic
import os

router = APIRouter(prefix="/api", tags=["query"])

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    tools_used: list[str]


@router.post("/query", response_model=QueryResponse)
def query(request: QueryRequest, db: Session = Depends(get_db)):
    tools_used = []
    messages = [{"role": "user", "content": request.question}]

    system_prompt = """You are a concise analytics assistant for Alatus Solutions.
Use tools to answer questions about practice health, hiring, and membership.
Keep answers under 150 words. Be direct and specific. No unnecessary preamble."""

    # ── Agentic loop

    while True:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=system_prompt,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

        # Claude is done — return the final text answer
        if response.stop_reason == "end_turn":
            final_text = next(
                (block.text for block in response.content
                 if hasattr(block, "text")), ""
            )
            return QueryResponse(answer=final_text, tools_used=tools_used)

        # Claude wants to call tools
        if response.stop_reason == "tool_use":
            # Add Claude's response to message history
            messages.append({
                "role": "assistant",
                "content": response.content
            })

            # Execute each tool Claude requested
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    tools_used.append(block.name)
                    result = execute_tool(block.name, block.input, db)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            # Send tool results back to Claude
            messages.append({
                "role": "user",
                "content": tool_results
            })