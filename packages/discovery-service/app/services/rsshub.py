# RSSHub 发现服务
# 通过 RSSHub 路由获取各平台内容更新

import hashlib
from datetime import datetime
from typing import Optional
import httpx
import feedparser
from app.config import settings


class RSSHubDiscoverer:
    """通过 RSSHub 发现公开内容更新"""

    def __init__(self):
        self.base_url = settings.rsshub_base_url
        self.timeout = settings.request_timeout

    async def search_by_keyword(self, keyword: str, platform: str = "weibo") -> list[dict]:
        """按关键词搜索内容"""
        route_map = {
            "weibo":      f"/weibo/keyword/{keyword}",
            "bilibili":   f"/bilibili/keyword/{keyword}",
            "xiaohongshu":f"/xiaohongshu/keyword/{keyword}",
            "douyin":     f"/douyin/keyword/{keyword}",
            "zhihu":      f"/zhihu/keyword/{keyword}",
            "baidu":      f"/baidu/s/word/{keyword}",
        }

        route = route_map.get(platform)
        if not route:
            return []

        return await self._fetch_feed(route, platform)

    async def get_user_updates(self, platform: str, user_id: str) -> list[dict]:
        """获取指定用户的更新"""
        route_map = {
            "weibo":      f"/weibo/user/{user_id}",
            "bilibili":   f"/bilibili/user/video/{user_id}",
            "douyin":     f"/douyin/user/{user_id}",
            "xiaohongshu":f"/xiaohongshu/user/{user_id}",
            "youtube":    f"/youtube/channel/{user_id}",
            "twitter":    f"/twitter/user/{user_id}",
            "instagram":  f"/instagram/user/{user_id}",
        }

        route = route_map.get(platform)
        if not route:
            return []

        return await self._fetch_feed(route, platform)

    async def get_music_updates(self, platform: str, artist_id: str) -> list[dict]:
        """获取音乐人更新"""
        route_map = {
            "qqmusic":    f"/qqmusic/singer/songs/{artist_id}",
            "netease":    f"/ncm/artist/{artist_id}",
            "spotify":    f"/spotify/artist/{artist_id}",
        }

        route = route_map.get(platform)
        if not route:
            return []

        return await self._fetch_feed(route, platform)

    async def get_work_page_updates(self, url: str) -> list[dict]:
        """获取作品页更新（综艺/节目等）
        直接通过 RSSHub 的通用路由或自定义路由
        """
        # 对于固定页面，使用 RSSHub 的通用路由
        # 或者可以尝试解析页面提取 RSS
        # Phase 2 先不做复杂实现，返回空
        return []

    async def _fetch_feed(self, route: str, platform: str) -> list[dict]:
        """获取并解析 RSS feed"""
        url = f"{self.base_url}{route}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers={
                    "User-Agent": "FanMemoryOS/0.2.0",
                })
                resp.raise_for_status()

                feed = feedparser.parse(resp.text)
                items = []

                for entry in feed.entries[:20]:  # 每次最多取20条
                    item = self._parse_entry(entry, platform)
                    if item:
                        items.append(item)

                return items

        except httpx.HTTPError as e:
            print(f"[RSSHub] HTTP error fetching {route}: {e}")
            return []
        except Exception as e:
            print(f"[RSSHub] Error fetching {route}: {e}")
            return []

    def _parse_entry(self, entry, platform: str) -> Optional[dict]:
        """解析 RSS 条目"""
        try:
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip()
            if not title or not link:
                return None

            # 生成唯一 ID
            content_id = hashlib.md5(link.encode()).hexdigest()[:12]

            # 提取发布时间
            published = ""
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                try:
                    published = datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d")
                except:
                    pass

            # 提取封面
            cover = ""
            if hasattr(entry, "media_content") and entry.media_content:
                cover = entry.media_content[0].get("url", "")
            elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                cover = entry.media_thumbnail[0].get("url", "")

            # 提取描述/摘要
            description = entry.get("summary", "")[:500] if hasattr(entry, "summary") else ""

            # 推断内容类型
            content_type = self._infer_content_type(platform, title, link)

            return {
                "uid": f"disc_{content_id}",
                "title": title,
                "url": link,
                "platform": platform,
                "content_type": content_type,
                "cover": cover,
                "description": description,
                "published_at": published,
            }

        except Exception as e:
            print(f"[RSSHub] Parse error: {e}")
            return None

    def _infer_content_type(self, platform: str, title: str, url: str) -> str:
        """推断内容类型"""
        platform_types = {
            "bilibili":    "video",
            "youtube":     "video",
            "douyin":      "short",
            "qqmusic":     "music",
            "netease":     "music",
            "spotify":     "music",
            "weibo":       "post",
            "xiaohongshu": "post",
            "twitter":     "post",
            "instagram":   "post",
        }
        return platform_types.get(platform, "other")


# 全局实例
discoverer = RSSHubDiscoverer()
