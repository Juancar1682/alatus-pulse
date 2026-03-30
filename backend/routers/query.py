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

    system_prompt = """You are an analytics assistant for Alatus Solutions, 
a dental industry MarTech company. You have access to unified data from 
two products: DentalPost (dental job board) and IllumiTrac (membership 
subscription software). Use the available tools to answer questions about 
practice health, hiring trends, membership metrics, and portfolio performance. 
Be concise and actionable. Always cite specific practice names and numbers."""

    # ── Agentic loop

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
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