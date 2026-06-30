# 去重服务 — 检查发现的内容是否已存在

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Discovery


class DedupService:
    """内容去重服务"""

    async def is_duplicate(self, url: str, db: AsyncSession) -> bool:
        """检查 URL 是否已被记录（包括已收藏和已忽略）"""
        result = await db.execute(
            select(Discovery).where(Discovery.url == url)
        )
        return result.scalar_one_or_none() is not None

    async def find_potential_duplicate(self, platform: str, title: str, db: AsyncSession):
        """查找可能重复的内容（同平台+标题相似）"""
        result = await db.execute(
            select(Discovery).where(Discovery.platform == platform)
        )
        discoveries = result.scalars().all()
        for d in discoveries:
            if self._similar_title(d.title, title):
                return d
        return None

    def _similar_title(self, a: str, b: str) -> bool:
        """简单标题相似度检查"""
        a_lower = a.lower()
        b_lower = b.lower()
        # 包含关系
        if len(a_lower) > 3 and len(b_lower) > 3:
            return a_lower in b_lower or b_lower in a_lower
        return a_lower == b_lower


dedup_service = DedupService()
