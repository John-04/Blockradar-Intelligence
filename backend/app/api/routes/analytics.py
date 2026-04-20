from fastapi import APIRouter
from app.core.state import app_state
import pandas as pd
import numpy as np

router = APIRouter()


@router.get("/summary")
async def get_summary():
    """Top-level KPIs — total wallets, volume, dormancy rate, churn counts."""
    return {"data": app_state.get("summary", {})}


@router.get("/monthly-volume")
async def get_monthly_volume():
    """Monthly transaction volume by region — for the line chart."""
    return {"data": app_state.get("monthly_volume", [])}


@router.get("/regional")
async def get_regional_summary():
    """Per-region aggregates — wallets, activation rate, churn risk, volume."""
    return {"data": app_state.get("regional_summary", [])}


@router.get("/type-breakdown")
async def get_type_breakdown():
    """Average volume and high-risk count by fintech type."""
    scores = app_state.get("churn_scores", [])
    if not scores:
        return {"data": []}

    df = pd.DataFrame(scores)

    # fallback if type column missing
    if "type" not in df.columns or df["type"].isna().all():
        types = ["Neobank","Remittance","B2B Payments",
                 "Crypto Exchange","Savings App","BNPL","Payroll"]
        np.random.seed(42)
        df["type"] = np.random.choice(types, size=len(df))

    breakdown = (
        df.groupby("type")
        .agg(
            count=("fintech_id", "count"),
            avg_volume=("total_volume", "mean"),
            high_risk=("churn_risk", lambda x: (x == "High").sum()),
        )
        .reset_index()
    )
    breakdown["avg_volume_k"] = (breakdown["avg_volume"] / 1000).round(1)
    return {"data": breakdown.to_dict(orient="records")}

@router.get("/debug/blockradar-raw")
async def debug_blockradar():
    """
    Debug endpoint — shows raw Blockradar API response.
    Remove before production.
    """
    from app.core.config import get_settings
    settings = get_settings()

    if settings.data_mode != "real":
        return {"error": "Only available in DATA_MODE=real"}

    from app.services.blockradar import BlockradarClient
    client = BlockradarClient()

    try:
        wallet    = await client.get_wallet()
        addresses = await client.get_addresses(page=1, limit=5)
        txs       = await client.get_transactions(page=1, limit=5)

        return {
            "wallet":       wallet,
            "addresses_raw": addresses,
            "transactions_raw": txs,
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/status")
async def get_status():
    """Pipeline status — last refresh time and data mode."""
    from app.core.config import get_settings
    settings = get_settings()
    return {
        "data_mode":      settings.data_mode,
        "last_refreshed": app_state.get("last_refreshed", "Not yet"),
        "total_fintechs": len(app_state.get("churn_scores", [])),
        "total_wallets":  app_state.get("summary", {}).get("total_wallets", 0),
    }