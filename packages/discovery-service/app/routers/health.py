# 健康检查路由

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/stats")
async def stats():
    """简要服务统计"""
    from app.database import async_session
    from app.models import Person, Source, Discovery
    from sqlalchemy import select, func

    async with async_session() as session:
        person_count = (await session.execute(select(func.count(Person.id)))).scalar() or 0
        source_count = (await session.execute(select(func.count(Source.id)))).scalar() or 0
        discovery_count = (await session.execute(select(func.count(Discovery.id)))).scalar() or 0
        new_count = (await session.execute(
            select(func.count(Discovery.id)).where(Discovery.status == "NEW")
        )).scalar() or 0

        return {
            "total_people": person_count,
            "total_sources": source_count,
            "total_discoveries": discovery_count,
            "new_count": new_count,
        }
