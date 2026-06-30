# FastAPI 主应用

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import people, discovery, health
from app.tasks.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化 DB 和调度器"""
    await init_db()
    if settings.discovery_enabled:
        await start_scheduler()
    yield
    if settings.discovery_enabled:
        await stop_scheduler()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(people.router, prefix="/api/people", tags=["people"])
app.include_router(discovery.router, prefix="/api/discovery", tags=["discovery"])


@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }
