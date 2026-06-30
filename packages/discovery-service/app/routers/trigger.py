# 自动发现手动触发路由

from fastapi import APIRouter
from app.tasks.scheduler import run_discovery_now

router = APIRouter()


@router.post("/trigger")
async def trigger_discovery():
    """手动触发一次全量发现"""
    found, new_items = await run_discovery_now()
    return {
        "status": "ok",
        "sources_checked": found,
        "new_items": new_items,
    }
