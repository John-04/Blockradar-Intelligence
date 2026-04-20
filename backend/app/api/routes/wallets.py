from fastapi import APIRouter, Query
from typing import Optional
from app.core.state import app_state
import pandas as pd

router = APIRouter()


@router.get("/dormancy")
async def get_dormancy(
    region: Optional[str] = Query(default=None),
):
    """Dormancy stats — overall and per region."""
    raw = app_state.get("raw", {})
    addresses = raw.get("addresses", [])
    if not addresses:
        return {"data": {}}

    df = pd.DataFrame(addresses)

    if region:
        df = df[df["_region"].str.lower() == region.lower()]

    total = len(df)
    dormant = int(df["isDormant"].sum())
    active = total - dormant

    by_region = (
        df.groupby("_region")
        .agg(
            total=("id", "count"),
            dormant=("isDormant", "sum"),
        )
        .reset_index()
    )
    by_region["dormancy_rate"] = (by_region["dormant"] / by_region["total"]).round(4)
    by_region["activation_rate"] = 1 - by_region["dormancy_rate"]

    return {
        "data": {
            "overall": {
                "total_wallets": total,
                "active_wallets": active,
                "dormant_wallets": dormant,
                "dormancy_rate": round(dormant / max(total, 1), 4),
                "activation_rate": round(active / max(total, 1), 4),
            },
            "by_region": by_region.rename(
                columns={"_region": "region"}
            ).to_dict(orient="records"),
        }
    }


@router.get("/activity")
async def get_wallet_activity(
    fintech_id: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
):
    """Raw wallet activity — filterable by fintech."""
    raw = app_state.get("raw", {})
    addresses = raw.get("addresses", [])
    if not addresses:
        return {"data": []}

    df = pd.DataFrame(addresses)

    if fintech_id:
        df = df[df["_fintechId"] == fintech_id]

    cols = [
        "id", "_fintechId", "_fintechName", "_region", "_country",
        "currency", "network", "balanceUsd", "totalTransactions",
        "lastActive", "createdAt", "isDormant", "daysSinceLastTx",
    ]
    available = [c for c in cols if c in df.columns]

    result = df[available].head(limit).to_dict(orient="records")
    return {"total": len(df), "returned": len(result), "data": result}