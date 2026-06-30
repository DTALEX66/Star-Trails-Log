// Fan Memory OS - Shared Data Models
// 所有数据模型定义

// ============ 枚举类型 ============

export type ContentType =
  | 'video' | 'music' | 'post' | 'article' | 'live' | 'short' | 'other';

export type ContentStatus =
  | 'NEW'      // 新发现（未处理）
  | 'SAVED'    // 已收藏
  | 'SEEN'     // 已看
  | 'IGNORED'  // 已忽略
  | 'BLOCKED'; // 已屏蔽

export type ContentSource =
  | 'manual'    // 手动收藏
  | 'share'     // 分享进入
  | 'discovery';// 自动发现

export type Platform =
  | 'bilibili' | 'douyin' | 'kuaishou'
  | 'weibo' | 'xiaohongshu'
  | 'iqiyi' | 'tencent' | 'youku' | 'mango'
  | 'qqmusic' | 'netease' | 'kugou' | 'kuwo'
  | 'applemusic' | 'spotify'
  | 'youtube' | 'twitter' | 'instagram'
  | 'other';

export type PersonType = 'star' | 'group';

export type SourceType =
  | 'keyword'
  | 'official_account'
  | 'work_page'
  | 'music_page';

export type ReminderType =
  | 'music_release'
  | 'birthday'
  | 'show_start'
  | 'live'
  | 'cleanup';

export type IgnoreDuration = 'temporary' | 'forever';

// ============ 核心数据模型 ============

export interface Person {
  id: string;
  name: string;
  type: PersonType;
  aliases: string[];
  teams: string[];
  keywords: string[];
  avatar?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  aliases: string[];
  members: string[];
  keywords: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  title: string;
  url: string;
  platform: Platform;
  content_type: ContentType;
  cover?: string;
  description?: string;
  people: string[];
  teams: string[];
  tags: string[];
  status: ContentStatus;
  watched: boolean;
  source: ContentSource;
  note?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  person_id: string;
  source_type: SourceType;
  platform: Platform;
  url?: string;
  keyword?: string;
  check_frequency: 'daily' | 'weekly';
  enabled: boolean;
  last_checked?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  person_id: string;
  title: string;
  type: ReminderType;
  remind_at: string;
  repeat?: 'yearly' | 'none';
  status: 'pending' | 'triggered' | 'dismissed';
  note?: string;
  created_at: string;
}

export interface IgnoreRule {
  id: string;
  person_id: string;
  rule_type: 'keyword' | 'author' | 'platform' | 'url_pattern';
  value: string;
  duration: IgnoreDuration;
  expires_at?: string;
  created_at: string;
}

// ============ Phase 1 本地数据库 ============

export interface LocalDatabase {
  version: number;
  people: Person[];
  teams: Team[];
  contents: Content[];
  ignore_rules: IgnoreRule[];
  tags: string[];
  last_updated: string;
}

// ============ 工具类型 ============

export interface PersonStats {
  person_id: string;
  total_contents: number;
  by_platform: Record<Platform, number>;
  by_type: Record<ContentType, number>;
  watched: number;
  unwatched: number;
  recent_date?: string;
}

export interface ImportResult {
  success: boolean;
  imported: {
    people: number;
    teams: number;
    contents: number;
    ignore_rules: number;
  };
  skipped: number;
  errors: string[];
}
