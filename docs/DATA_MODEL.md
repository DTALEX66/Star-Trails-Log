# 数据模型设计

## 核心数据表

### people — 明星/团队表

```typescript
interface Person {
  id: string;              // person_xxx
  name: string;            // 主名
  type: 'star' | 'group';  // 个人/团体
  aliases: string[];       // 别名、昵称
  teams: string[];         // 所属团队 ID
  keywords: string[];      // 搜索关键词
  avatar?: string;         // 头像 URL
  notes?: string;          // 备注
  created_at: string;      // 创建时间
  updated_at: string;      // 更新时间
}
```

**示例：**
```json
{
  "id": "person_001",
  "name": "王一珩",
  "type": "star",
  "aliases": ["王哥", "一珩"],
  "teams": [],
  "keywords": ["王一珩", "王一珩 直播", "王一珩 新歌"],
  "created_at": "2026-06-30"
}
```

---

### teams — 团队表

```typescript
interface Team {
  id: string;              // team_xxx
  name: string;            // 团队名
  aliases: string[];       // 别称
  members: string[];       // 成员 Person ID
  keywords: string[];      // 搜索关键词
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

---

### contents — 内容表

```typescript
interface Content {
  id: string;              // content_xxx
  title: string;           // 标题
  url: string;             // 原始链接
  platform: Platform;      // 平台
  content_type: ContentType; // 内容类型
  cover?: string;          // 封面 URL
  description?: string;    // 摘要/描述
  people: string[];        // 关联人物 ID
  teams: string[];         // 关联团队 ID
  tags: string[];          // 自定义标签
  status: ContentStatus;   // 状态
  watched: boolean;        // 已看/未看
  source: ContentSource;   // 来源
  note?: string;           // 用户备注
  published_at?: string;   // 原始发布时间
  created_at: string;      // 收藏时间
  updated_at: string;
}
```

**内容类型 (ContentType)：**
```typescript
type ContentType =
  | 'video'       // 视频（B站、抖音、YouTube等）
  | 'music'       // 音乐（QQ音乐、网易云等）
  | 'post'        // 社交动态（微博、小红书等）
  | 'article'     // 文章
  | 'live'        // 直播
  | 'short'       // 短视频/Short
  | 'other';
```

**内容状态 (ContentStatus)：**
```typescript
type ContentStatus =
  | 'NEW'         // 新发现（未处理）
  | 'SAVED'       // 已收藏
  | 'SEEN'        // 已看
  | 'IGNORED'     // 已忽略
  | 'BLOCKED';    // 已屏蔽
```

**内容来源 (ContentSource)：**
```typescript
type ContentSource =
  | 'manual'      // 手动收藏
  | 'share'       // 分享进入
  | 'discovery';  // 自动发现
```

**平台枚举：**
```typescript
type Platform =
  | 'bilibili' | 'douyin' | 'kuaishou'
  | 'weibo' | 'xiaohongshu'
  | 'iqiyi' | 'tencent' | 'youku' | 'mango'
  | 'qqmusic' | 'netease' | 'kugou' | 'kuwo'
  | 'applemusic' | 'spotify'
  | 'youtube' | 'twitter' | 'instagram'
  | 'other';
```

**示例：**
```json
{
  "id": "content_001",
  "title": "某明星最新采访",
  "url": "https://www.bilibili.com/video/BV1xxx",
  "platform": "bilibili",
  "content_type": "video",
  "cover": "https://i0.hdslb.com/bfs/xxx.jpg",
  "people": ["person_001"],
  "teams": [],
  "tags": ["采访", "高光"],
  "status": "SAVED",
  "watched": false,
  "source": "manual",
  "note": "这段回答特别好",
  "published_at": "2026-06-29",
  "created_at": "2026-06-30"
}
```

---

### sources — 追踪源表（Phase 2）

```typescript
interface Source {
  id: string;
  person_id: string;
  source_type: 'keyword' | 'official_account' | 'work_page' | 'music_page';
  platform: Platform;
  url?: string;            // 官方账号/作品页 URL
  keyword?: string;        // 关键词
  check_frequency: 'daily' | 'weekly';
  enabled: boolean;
  last_checked?: string;
  created_at: string;
}
```

---

### reminders — 提醒表（Phase 2）

```typescript
interface Reminder {
  id: string;
  person_id: string;
  title: string;
  type: 'music_release' | 'birthday' | 'show_start' | 'live' | 'cleanup';
  remind_at: string;       // 提醒时间
  repeat?: 'yearly' | 'none';
  status: 'pending' | 'triggered' | 'dismissed';
  note?: string;
  created_at: string;
}
```

---

### ignore_rules — 屏蔽规则表

```typescript
interface IgnoreRule {
  id: string;
  person_id: string;
  rule_type: 'keyword' | 'author' | 'platform' | 'url_pattern';
  value: string;
  duration: 'temporary' | 'forever';
  expires_at?: string;
  created_at: string;
}
```

---

## 去重规则

```
1. URL 完全一致 → 重复
2. 平台 + 内容 ID 一致 → 重复
3. 标题相似度 > 85% → 疑似重复
4. 已收藏 → 不再作为新内容提醒
5. 已忽略 → 7天内不再提醒
6. 已屏蔽关键词/作者/平台 → 不再出现
```

---

## Phase 1 存储方案

Phase 1 使用 **uni-app 本地缓存**（基于 `uni.setStorageSync`），数据结构为：

```typescript
interface LocalDatabase {
  version: 1;
  people: Person[];
  teams: Team[];
  contents: Content[];
  ignore_rules: IgnoreRule[];
  tags: string[];          // 标签词库
  last_updated: string;
}
```

全量数据以 JSON 格式导入/导出。
