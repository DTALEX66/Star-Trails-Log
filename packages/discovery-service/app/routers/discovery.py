# 发现内容路由 + 手动触发

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Discovery, Person
from app.schemas import DiscoveryResponse, DiscoveryAction, DiscoveryStats
from app.tasks.scheduler import run_discovery_now

router = APIRouter()


# ============ Discovery CRUD ============

@router.get("/", response_model=list[DiscoveryResponse])
async def list_discoveries(
    person_uid: str | None = Query(None),
    status: str | None = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """获取发现的新内容列表"""
    query = select(Discovery).order_by(Discovery.discovered_at.desc())

    if person_uid:
        result = await db.execute(select(Person).where(Person.uid == person_uid))
        person = result.scalar_one_or_none()
        if not person:
            raise HTTPException(404, "Person not found")
        query = query.where(Discovery.person_id == person.id)

    if status:
        query = query.where(Discovery.status == status)

    query = query.limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/new", response_model=list[DiscoveryResponse])
async def list_new_discoveries(
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取未处理的发现内容"""
    result = await db.execute(
        select(Discovery)
        .where(Discovery.status == "NEW")
        .order_by(Discovery.discovered_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


# ============ User Actions ============

@router.post("/{discovery_id}/action")
async def action_discovery(
    discovery_id: int,
    action: DiscoveryAction,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Discovery).where(Discovery.id == discovery_id))
    discovery = result.scalar_one_or_none()
    if not discovery:
        raise HTTPException(404, "Discovery not found")

    status_map = {"save": "SAVED", "ignore": "IGNORED", "block": "BLOCKED"}
    discovery.status = status_map[action.action]
    await db.commit()
    return {"status": "ok", "new_status": discovery.status}


@router.post("/batch-action")
async def batch_action(
    ids: list[int],
    action: DiscoveryAction,
    db: AsyncSession = Depends(get_db),
):
    status_map = {"save": "SAVED", "ignore": "IGNORED", "block": "BLOCKED"}
    result = await db.execute(select(Discovery).where(Discovery.id.in_(ids)))
    discoveries = result.scalars().all()
    for d in discoveries:
        d.status = status_map[action.action]
    await db.commit()
    return {"status": "ok", "affected": len(discoveries)}


# ============ Stats & Trigger ============

@router.get("/stats", response_model=DiscoveryStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    from app.models import Source
    person_count = (await db.execute(select(func.count(Person.id)))).scalar() or 0
    source_count = (await db.execute(select(func.count(Source.id)))).scalar() or 0
    discovery_count = (await db.execute(select(func.count(Discovery.id)))).scalar() or 0
    new_count = (await db.execute(
        select(func.count(Discovery.id)).where(Discovery.status == "NEW")
    )).scalar() or 0
    last_check = (await db.execute(select(func.max(Discovery.discovered_at)))).scalar()

    return DiscoveryStats(
        total_people=person_count,
        total_sources=source_count,
        total_discoveries=discovery_count,
        new_count=new_count,
        last_check_time=last_check,
    )


@router.post("/trigger")
async def trigger_discovery():
    """手动触发一次全量检查"""
    found, new_items = await run_discovery_now()
    return {"status": "ok", "new_items": new_items}
