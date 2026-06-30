# SQLAlchemy 数据模型

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Float,
    ForeignKey, JSON, UniqueConstraint, Index,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Person(Base):
    """跟踪的明星/团队"""
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(64), unique=True, nullable=False, index=True)  # 对应前端的 person_id
    name = Column(String(128), nullable=False)
    person_type = Column(String(16), default="star")  # star / group
    aliases = Column(JSON, default=list)  # ["别名1", "别名2"]
    keywords = Column(JSON, default=list)   # ["关键词1", "关键词2"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sources = relationship("Source", back_populates="person", cascade="all, delete-orphan")
    discoveries = relationship("Discovery", back_populates="person", cascade="all, delete-orphan")


class Source(Base):
    """追踪源：关键词/官方账号/作品页/音乐人主页"""
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(64), unique=True, nullable=False)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(32), nullable=False)  # keyword / official_account / work_page / music_page
    platform = Column(String(32), nullable=False)
    url = Column(String(512), default="")
    keyword = Column(String(256), default="")
    check_frequency = Column(String(16), default="daily")  # daily / weekly
    enabled = Column(Boolean, default=True)
    last_checked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="sources")

    __table_args__ = (
        Index("idx_source_person", "person_id"),
    )


class Discovery(Base):
    """发现的新内容记录"""
    __tablename__ = "discoveries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(64), unique=True, nullable=False)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(256), nullable=False)
    url = Column(String(1024), nullable=False)
    platform = Column(String(32), nullable=False)
    content_type = Column(String(32), default="other")  # video/music/post/article/live/short
    cover = Column(String(512), default="")
    description = Column(Text, default="")
    published_at = Column(String(32), default="")

    status = Column(String(16), default="NEW")  # NEW / SAVED / IGNORED / BLOCKED
    discovered_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="discoveries")
    source = relationship("Source")

    __table_args__ = (
        Index("idx_discovery_person", "person_id"),
        Index("idx_discovery_status", "status"),
        UniqueConstraint("url", name="uq_discovery_url"),
    )


class CheckLog(Base):
    """检查日志"""
    __tablename__ = "check_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(16), default="SUCCESS")  # SUCCESS / ERROR
    items_found = Column(Integer, default=0)
    items_new = Column(Integer, default=0)
    message = Column(Text, default="")
    checked_at = Column(DateTime, default=datetime.utcnow)
