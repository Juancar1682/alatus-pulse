from anthropic import Anthropic
import json
import os

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def generate_insights(dentalpost_data: list[dict], illumitrac_data: list[dict]) -> list[dict]:
    prompt = f"""You are an analytics advisor for a dental industry MarTech company 
that runs two products:
- DentalPost: a job board connecting dental professionals with employers
- IllumiTrac: a marketing/advertising platform for dental practices

Analyze this data and return exactly 3 JSON insights.
Each insight should have: title, summary, category (opportunity|alert|trend), 
and source (dentalpost|illumitrac|cross-platform).

DentalPost metrics (last 30 days):
{json.dumps(dentalpost_data[-7:], default=str)}

IllumiTrac metrics (last 30 days):
{json.dumps(illumitrac_data[-7:], default=str)}

Return ONLY a JSON array, no markdown, no explanation."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        return json.loads(message.content[0].text)
    except json.JSONDecodeError:
        return [
            {
                "title": "Analysis Unavailable",
                "summary": "Unable to parse insights. Please try again.",
                "category": "alert",
                "source": "cross-platform",
            }
        ]