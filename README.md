# Fan Memory OS (Star-Trails-Log)

> 以明星/团队为中心的追星资料库 + 轻量自动发现提醒系统

---

## 快速启动

### 前置要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | >= 18 |
| npm | >= 9 |
| Python | >= 3.11 |

### 1. 启动前端 (H5)

```bash
# 安装依赖
cd packages/fan-memory-app
npm install --legacy-peer-deps

# 开发模式
npm run dev:h5

# 生产构建
npm run build:h5
# 输出在 dist/build/h5/
```

### 2. 启动后端 (发现服务)

```bash
cd packages/discovery-service

# 创建虚拟环境
python -m venv .venv

# Windows:
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --port 8766

# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8766
```

### 3. 或用 Docker 启动后端

```bash
docker compose up -d
```

---

## 项目结构

```
Star-Trails-Log/
├── docs/                              # 项目文档
│   ├── ARCHITECTURE.md                # 架构设计
│   ├── DATA_MODEL.md                  # 数据模型
│   └── PHASE_PLAN.md                  # 开发路线
├── shared/                            # 共享类型定义
│   ├── models/index.ts                # TypeScript 类型
│   └── utils/                         # ID/平台识别工具
├── scripts/
│   └── test-core-logic.js             # 38 个核心逻辑测试
├── packages/
│   ├── fan-memory-app/                # 前端 (uni-app)
│   │   ├── src/
│   │   │   ├── pages/                 # 16 个页面
│   │   │   ├── stores/                # 4 个 Pinia store
│   │   │   ├── utils/                 # 工具函数
│   │   │   └── shared/                # 本地类型
│   │   └── H5 构建 ✅
│   └── discovery-service/             # 后端 (FastAPI)
│       ├── app/
│       │   ├── models.py              # SQLite 4 表
│       │   ├── routers/               # 14 个 API
│       │   ├── services/              # RSSHub + 去重
│       │   └── tasks/                 # 定时检查
│       ├── tests/test_api.py          # 12 个 API 测试 ✅
│       └── Dockerfile
├── docker-compose.yml                 # 一键部署
└── .gitignore
```

---

## 架构一览

```
uni-app 前端 ←── API ──→ FastAPI 后端
  │                              │
  │ 16 页面                      │ SQLite 存储
  │ 4 个 Pinia store             │ RSSHub 发现
  │ 平台自动识别                  │ 定时检查
  │ 去重引擎                      │ 新内容提醒
```

### 核心 API 端点

| 端点 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/stats` | 全局统计 |
| `GET /api/people/` | 人物列表 |
| `POST /api/people/` | 创建人物 |
| `POST /api/people/{uid}/sources` | 添加追踪源 |
| `GET /api/discovery/new` | 新发现内容 |
| `POST /api/discovery/trigger` | 手动触发检查 |
| `POST /api/discovery/{id}/action` | 用户操作 |

---

## 测试

```bash
# 核心逻辑测试 (38 个)
node scripts/test-core-logic.js

# API 测试 (12 个) — 需先启动后端
cd packages/discovery-service
.venv\Scripts\python tests/test_api.py
```

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | uni-app (Vue 3 + Vite + TypeScript) |
| 状态管理 | Pinia |
| 后端 | Python FastAPI + SQLAlchemy async |
| 数据库 | SQLite |
| 发现引擎 | RSSHub |
| 定时调度 | APScheduler |
| 部署 | Docker / docker-compose |

---

## License

MIT
