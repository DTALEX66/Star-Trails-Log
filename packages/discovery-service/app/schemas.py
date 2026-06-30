# Pydantic 数据模式（API 请求/响应）

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


# ============ Person ============

class PersonCreate(BaseModel):
    """创建跟踪人物"""
    uid: str
    name: str
    person_type: str = "star"
    aliases: list[str] = []
    keywords: list[str] = []


class PersonUpdate(BaseModel):
    name: Optional[str] = None
    person_type: Optional[str] = None
    aliases: Optional[list[str]] = None
    keywords: Optional[list[str]] = None


class PersonResponse(BaseModel):
    id: int
    uid: str
    name: str
    person_type: str
    aliases: list
    keywords: list
    created_at: datetime
    updated_at: datetime
    source_count: int = 0
    discovery_count: int = 0

    model_config = {"from_attributes": True}


# ============ Source ============

class SourceCreate(BaseModel):
    uid: str
    person_uid: str
    source_type: str
    platform: str
    url: str = ""
    keyword: str = ""
    check_frequency: str = "daily"


class SourceResponse(BaseModel):
    id: int
    uid: str
    person_id: int
    source_type: str
    platform: str
    url: str
    keyword: str
    check_frequency: str
    enabled: bool
    last_checked: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ============ Discovery ============

class DiscoveryResponse(BaseModel):
    id: int
    uid: str
    person_id: int
    title: str
    url: str
    platform: str
    content_type: str
    cover: str
    description: str
    published_at: str
    status: str
    discovered_at: datetime

    model_config = {"from_attributes": True}


class DiscoveryAction(BaseModel):
    """用户对发现内容的操作"""
    action: str = Field(..., pattern="^(save|ignore|block)$")


# ============ Stats ============

class DiscoveryStats(BaseModel):
    total_people: int
    total_sources: int
    total_discoveries: int
    new_count: int
    last_check_time: Optional[datetime] = None


class PersonBrief(BaseModel):
    uid: str
    name: str
    source_count: int
    new_count: int

    model_config = {"from_attributes": True}
