# 自动发现调度器
# 定期检查所有已启用的追踪源

from datetime import datetime
from sqlalchemy import select
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import async_session
from app.models import Person, Source, Discovery, CheckLog
from app.services.rsshub import discoverer
from app.services.dedup import dedup_service
from app.config import settings

scheduler = AsyncIOScheduler()


async def check_source(source: Source, db):
    """检查单个追踪源"""
    items = []
    person = await db.get(Person, source.person_id)
    if not person:
        return 0, 0

    try:
        if source.source_type == "keyword":
            if source.keyword:
                items = await discoverer.search_by_keyword(
                    source.keyword, source.platform
                )

        elif source.source_type == "official_account":
            if source.url:
                # 从 URL 提取 user_id
                user_id = _extract_user_id(source.url, source.platform)
                if user_id:
                    items = await discoverer.get_user_updates(source.platform, user_id)

        elif source.source_type == "music_page":
            if source.url:
                artist_id = _extract_artist_id(source.url, source.platform)
                if artist_id:
                    items = await discoverer.get_music_updates(source.platform, artist_id)

        elif source.source_type == "work_page":
            items = await discoverer.get_work_page_updates(source.url)

    except Exception as e:
        print(f"[Scheduler] Error checking source {source.uid}: {e}")
        return 0, 0

    # 去重入库
    new_count = 0
    for item in items:
        if await dedup_service.is_duplicate(item["url"], db):
            continue

        discovery = Discovery(
            uid=item["uid"],
            person_id=source.person_id,
            source_id=source.id,
            title=item["title"],
            url=item["url"],
            platform=item["platform"],
            content_type=item["content_type"],
            cover=item["cover"],
            description=item["description"],
            published_at=item["published_at"],
            status="NEW",
        )
        db.add(discovery)
        new_count += 1

    # 更新源的最后检查时间
    source.last_checked = datetime.utcnow()

    # 记录检查日志
    log = CheckLog(
        source_id=source.id,
        person_id=source.person_id,
        status="SUCCESS",
        items_found=len(items),
        items_new=new_count,
    )
    db.add(log)

    return len(items), new_count


def _extract_user_id(url: str, platform: str) -> str:
    """从 URL 提取用户 ID"""
    url = url.rstrip("/")
    if platform == "bilibili":
        # https://space.bilibili.com/123456
        if "space.bilibili.com" in url:
            return url.split("/")[-1]
    elif platform == "weibo":
        # https://weibo.com/u/123456
        parts = url.split("/")
        for i, p in enumerate(parts):
            if p == "u" and i + 1 < len(parts):
                return parts[i + 1]
    elif platform == "youtube":
        # https://www.youtube.com/channel/UCxxx or @handle
        parts = url.split("/")
        return parts[-1] if parts else ""
    elif platform == "twitter" or platform == "x":
        # https://twitter.com/username
        parts = url.split("/")
        return parts[-1] if parts else ""
    return ""


def _extract_artist_id(url: str, platform: str) -> str:
    """从 URL 提取音乐人 ID"""
    url = url.rstrip("/")
    if platform == "qqmusic":
        # https://y.qq.com/n/ryqq/singer/001
        parts = url.split("/")
        return parts[-1] if parts else ""
    elif platform == "netease":
        # https://music.163.com/artist?id=123
        if "artist" in url:
            from urllib.parse import parse_qs, urlparse
            params = parse_qs(urlparse(url).query)
            return params.get("id", [""])[0]
    return ""


async def discover_all():
    """检查所有已启用的追踪源"""
    async with async_session() as db:
        result = await db.execute(
            select(Source).where(Source.enabled == True)
        )
        sources = result.scalars().all()

        total_found = 0
        total_new = 0

        for source in sources:
            found, new_items = await check_source(source, db)
            total_found += found
            total_new += new_items

        await db.commit()
        print(f"[Scheduler] Check complete: {len(sources)} sources, {total_found} found, {total_new} new")
        return total_found, total_new


async def start_scheduler():
    """启动调度器"""
    if scheduler.running:
        return

    interval = settings.discovery_interval_minutes
    scheduler.add_job(
        discover_all,
        "interval",
        minutes=interval,
        id="discover_all",
        replace_existing=True,
    )
    scheduler.start()
    print(f"[Scheduler] Started — checking every {interval} minutes")


async def stop_scheduler():
    """停止调度器"""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("[Scheduler] Stopped")


async def run_discovery_now():
    """手动触发一次发现（API 调用）"""
    return await discover_all()
