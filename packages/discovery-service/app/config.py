# FastAPI 发现服务配置
# 从环境变量加载，支持 .env 文件

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 应用
    app_name: str = "Fan Memory OS Discovery"
    app_version: str = "0.2.0"
    debug: bool = False

    # 数据库
    database_url: str = "sqlite+aiosqlite:///./data/discovery.db"

    # RSSHub
    rsshub_base_url: str = "https://rsshub.app"
    request_timeout: int = 30

    # 调度
    discovery_interval_minutes: int = 60  # 默认每小时检查一次
    discovery_enabled: bool = True

    # CORS — 允许前端访问
    cors_origins: list[str] = ["*"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
