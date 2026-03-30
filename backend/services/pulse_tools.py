from sqlalchemy.orm import Session
from models.db_models import Practice, PracticeEvent

# ── Tool definitions

TOOL_DEFINITIONS = [
    {
        "name": "get_portfolio_summary",
        "description": "Get a high-level summary of the entire Alatus portfolio — total practices, average health score, total MRR, average churn rate, and total open jobs across DentalPost.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "get_struggling_practices",
        "description": "Get practices that are struggling — low health scores, high churn, many open jobs, or slow hiring. Use this when asked about at-risk practices, who needs attention, or who to reach out to.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "How many practices to return. Default 5."
                }
            },
            "required": []
        }
    },
    {
        "name": "get_healthy_practices",
        "description": "Get the best performing practices with high health scores, low churn, and strong hiring velocity.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "How many practices to return. Default 5."
                }
            },
            "required": []
        }
    },
    {
        "name": "get_practice_details",
        "description": "Get detailed information about a specific practice by name, including their DentalPost hiring data and IllumiTrac membership data.",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "The name of the practice to look up."
                }
            },
            "required": ["name"]
        }
    },
    {
        "name": "get_churn_analysis",
        "description": "Get churn analysis across all practices — which practices have the highest churn rates and what their membership numbers look like.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    }
]


# ── Tool execution

def execute_tool(tool_name: str, tool_input: dict, db: Session) -> str:
    if tool_name == "get_portfolio_summary":
        practices = db.query(Practice).all()
        total = len(practices)
        avg_health = round(sum(p.health_score for p in practices) / total, 1)
        total_mrr = round(sum(p.mrr for p in practices), 2)
        avg_churn = round(sum(p.churn_rate for p in practices) / total * 100, 1)
        total_jobs = sum(p.open_jobs for p in practices)

        return f"""Portfolio Summary:
- Total practices: {total}
- Average health score: {avg_health}/100
- Total MRR across all practices: ${total_mrr:,.2f}
- Average churn rate: {avg_churn}%
- Total open jobs on DentalPost: {total_jobs}"""

    elif tool_name == "get_struggling_practices":
        limit = tool_input.get("limit", 5)
        practices = (
            db.query(Practice)
            .order_by(Practice.health_score.asc())
            .limit(limit)
            .all()
        )
        lines = [f"Bottom {limit} practices by health score:"]
        for p in practices:
            lines.append(
                f"- {p.name} ({p.city}, {p.state}): "
                f"health={p.health_score}/100, "
                f"churn={round(p.churn_rate*100,1)}%, "
                f"open jobs={p.open_jobs}, "
                f"MRR=${p.mrr:,.0f}"
            )
        return "\n".join(lines)

    elif tool_name == "get_healthy_practices":
        limit = tool_input.get("limit", 5)
        practices = (
            db.query(Practice)
            .order_by(Practice.health_score.desc())
            .limit(limit)
            .all()
        )
        lines = [f"Top {limit} practices by health score:"]
        for p in practices:
            lines.append(
                f"- {p.name} ({p.city}, {p.state}): "
                f"health={p.health_score}/100, "
                f"churn={round(p.churn_rate*100,1)}%, "
                f"MRR=${p.mrr:,.0f}"
            )
        return "\n".join(lines)

    elif tool_name == "get_practice_details":
        name = tool_input.get("name", "")
        practice = (
            db.query(Practice)
            .filter(Practice.name.ilike(f"%{name}%"))
            .first()
        )
        if not practice:
            return f"No practice found matching '{name}'"

        return f"""Practice: {practice.name} ({practice.city}, {practice.state})
Health Score: {practice.health_score}/100
DentalPost:
  - Open jobs: {practice.open_jobs}
  - Avg days to fill: {practice.avg_days_to_fill}
  - Total hires (90d): {practice.total_hires_90d}
IllumiTrac:
  - Active members: {practice.active_members}
  - MRR: ${practice.mrr:,.2f}
  - Churn rate: {round(practice.churn_rate*100,1)}%
  - Missed payments (30d): {practice.missed_payments_30d}"""

    elif tool_name == "get_churn_analysis":
        practices = (
            db.query(Practice)
            .order_by(Practice.churn_rate.desc())
            .limit(10)
            .all()
        )
        lines = ["Churn analysis — top 10 highest churn practices:"]
        for p in practices:
            lines.append(
                f"- {p.name}: {round(p.churn_rate*100,1)}% churn, "
                f"{p.active_members} members, "
                f"MRR=${p.mrr:,.0f}"
            )
        return "\n".join(lines)

    return f"Unknown tool: {tool_name}"