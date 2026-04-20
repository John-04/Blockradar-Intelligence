"""
Shared in-memory state — holds pipeline results
so all API routes can access them without re-running.
"""

app_state: dict = {
    "summary": {},
    "churn_scores": [],
    "monthly_volume": [],
    "regional_summary": [],
    "raw": {},
}