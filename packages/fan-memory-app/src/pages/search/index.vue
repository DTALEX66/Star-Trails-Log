<template>
  <view class="page-search">
    <!-- 搜索框 -->
    <view class="search-bar">
      <input class="search-input" v-model="query" placeholder="搜明星/标题/标签/链接/备注…" @input="onSearchDebounced" @confirm="onSearch" focus />
      <text v-if="query" class="clear-btn" @click="clearSearch">×</text>
    </view>

    <!-- 筛选标签 -->
    <view v-if="query || activeFilters.length > 0" class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <text class="filter-chip" :class="{ active: !activeFilter }" @click="setFilter('')">全部</text>
        <text v-for="p in personStore.people" :key="p.id"
          class="filter-chip" :class="{ active: activeFilter === 'person:' + p.id }"
          @click="setFilter(p.id ? 'person:' + p.id : '')">
          {{ p.name }}
        </text>
      </scroll-view>
      <view class="filter-extras">
        <text class="extra-chip" :class="{ active: showUnwatchedOnly }" @click="showUnwatchedOnly = !showUnwatchedOnly">未看</text>
      </view>
    </view>

    <!-- 搜索建议（无搜索词时） -->
    <view v-if="!query && results.length === 0" class="suggestions">
      <text class="suggest-title">快速搜索</text>
      <view class="suggest-grid">
        <text class="suggest-item" @click="quickSearch('未看')">🔴 未看内容</text>
        <text class="suggest-item" @click="quickSearch('B站')">📺 B站</text>
        <text class="suggest-item" @click="quickSearch('微博')">📱 微博</text>
        <text class="suggest-item" @click="quickSearch('音乐')">🎵 音乐</text>
        <text class="suggest-item" @click="quickSearch('YouTube')">▶️ YouTube</text>
        <text class="suggest-item" @click="quickSearch('直播')">🔴 直播</text>
      </view>

      <text class="suggest-title">关注的明星</text>
      <view class="suggest-list">
        <text v-for="p in personStore.people" :key="p.id" class="suggest-person" @click="searchByPerson(p)">
          {{ p.name }} <text class="count">{{ contentStore.getByPerson(p.id).length }}</text>
        </text>
      </view>
    </view>

    <!-- 结果统计 -->
    <view v-if="results.length > 0" class="result-stats">
      <text class="stat-text">找到 {{ results.length }} 条结果</text>
      <text class="stat-text">{{ watchedCount }} 已看 · {{ results.length - watchedCount }} 未看</text>
    </view>

    <!-- 搜索结果 -->
    <view v-if="query && results.length === 0" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">没有找到匹配的内容</text>
      <text class="empty-hint">试试其他关键词或取消筛选</text>
    </view>

    <view v-if="results.length > 0" class="result-list">
      <view v-for="item in results" :key="item.id" class="result-card card-enter" @click="goDetail(item.id)">
        <view class="card-header">
          <text class="platform-tag">{{ getPlatformLabel(item.platform) }}</text>
          <view class="card-people">
            <text v-for="pid in item.people" :key="pid" class="person-tag">{{ getPersonName(pid) }}</text>
          </view>
          <text class="status-tag" :class="item.watched ? 'seen' : 'unseen'">{{ item.watched ? '已看' : '未看' }}</text>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <view class="card-footer">
          <view class="card-tags">
            <text v-for="t in item.tags.slice(0, 3)" :key="t" class="mini-tag">{{ t }}</text>
            <text v-if="item.tags.length > 3" class="mini-tag more">+{{ item.tags.length - 3 }}</text>
          </view>
          <text class="card-date">{{ item.published_at || item.created_at }}</text>
        </view>
        <text v-if="item.note" class="card-note">{{ item.note }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import { usePersonStore } from '@/stores/person'
import { getPlatformLabel } from '@/shared/utils/platform'

const contentStore = useContentStore()
const personStore = usePersonStore()

const query = ref('')
const results = ref<any[]>([])
const activeFilter = ref('')
const showUnwatchedOnly = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

onShow(() => {
  contentStore.load()
  personStore.load()
})

const watchedCount = computed(() => results.value.filter(r => r.watched).length)

function setFilter(f: string) {
  activeFilter.value = activeFilter.value === f ? '' : f
  onSearch()
}

function onSearch() {
  let items = contentStore.contents

  // Text search
  const q = query.value.trim().toLowerCase()
  if (q) {
    items = items.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.note?.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.url.toLowerCase().includes(q) ||
      c.platform.toLowerCase().includes(q)
    )
  }

  // Person filter
  if (activeFilter.value.startsWith('person:')) {
    const pid = activeFilter.value.slice(7)
    items = items.filter(c => c.people.includes(pid))
  }

  // Unwatched filter
  if (showUnwatchedOnly.value) {
    items = items.filter(c => !c.watched)
  }

  results.value = items
}

function onSearchDebounced() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(onSearch, 200)
}

function clearSearch() {
  query.value = ''
  results.value = []
  activeFilter.value = ''
  showUnwatchedOnly.value = false
}

function quickSearch(text: string) {
  query.value = text
  onSearch()
}

function searchByPerson(p: any) {
  query.value = p.name
  activeFilter.value = 'person:' + p.id
  onSearch()
}

function getPersonName(id: string): string {
  return personStore.getById(id)?.name || '未知'
}

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/collection/detail?id=' + id })
}
</script>

<style scoped>
.page-search { padding: 16rpx; }

.search-bar { display: flex; align-items: center; background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 12rpx; padding: 0 24rpx; }
.search-input { flex: 1; padding: 20rpx 0; font-size: 28rpx; }
.clear-btn { font-size: 32rpx; color: #999; padding: 8rpx; }

.filter-bar { display: flex; align-items: center; gap: 12rpx; margin-top: 12rpx; }
.filter-scroll { flex: 1; white-space: nowrap; }
.filter-chip { display: inline-block; padding: 6rpx 20rpx; margin-right: 8rpx; font-size: 22rpx; border-radius: 16rpx; color: #666; background: #F5F5F5; }
.filter-chip.active { color: #FFF; background: #007AFF; }
.filter-extras { flex-shrink: 0; }
.extra-chip { padding: 6rpx 20rpx; font-size: 22rpx; border-radius: 16rpx; color: #FF9800; background: #FFF3E0; }
.extra-chip.active { color: #FFF; background: #FF9800; }

.suggestions { padding: 24rpx 0; }
.suggest-title { font-size: 24rpx; color: #999; display: block; margin: 16rpx 0 12rpx; }
.suggest-grid { display: flex; gap: 12rpx; flex-wrap: wrap; }
.suggest-item { padding: 12rpx 24rpx; background: #F5F5F5; border-radius: 8rpx; font-size: 24rpx; color: #666; }
.suggest-list { display: flex; flex-wrap: wrap; gap: 10rpx; }
.suggest-person { padding: 10rpx 24rpx; background: #E8F0FE; border-radius: 20rpx; font-size: 24rpx; color: #007AFF; }
.count { font-size: 20rpx; color: #999; margin-left: 4rpx; }

.result-stats { display: flex; justify-content: space-between; padding: 16rpx 8rpx 8rpx; }
.stat-text { font-size: 22rpx; color: #999; }

.empty-state { text-align: center; padding: 100rpx 32rpx; }
.empty-icon { font-size: 48rpx; display: block; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 12rpx; display: block; }
.empty-hint { font-size: 22rpx; color: #ccc; margin-top: 6rpx; display: block; }

.result-list { display: flex; flex-direction: column; gap: 10rpx; padding-top: 8rpx; }
.result-card { background: #FFF; border-radius: 12rpx; padding: 20rpx; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.card-header { display: flex; gap: 8rpx; align-items: center; margin-bottom: 8rpx; }
.platform-tag { font-size: 20rpx; color: #007AFF; background: #E8F0FE; padding: 2rpx 10rpx; border-radius: 4rpx; }
.card-people { flex: 1; display: flex; gap: 4rpx; flex-wrap: wrap; }
.person-tag { font-size: 18rpx; color: #667eea; background: #F0F0FF; padding: 2rpx 8rpx; border-radius: 4rpx; }
.status-tag { font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 4rpx; }
.status-tag.seen { color: #4CAF50; background: #E8F5E9; }
.status-tag.unseen { color: #FF9800; background: #FFF3E0; }
.card-title { font-size: 26rpx; color: #1a1a1a; display: block; line-height: 1.5; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8rpx; }
.card-tags { display: flex; gap: 4rpx; flex-wrap: wrap; }
.mini-tag { font-size: 18rpx; color: #999; background: #F5F5F5; padding: 2rpx 8rpx; border-radius: 4rpx; }
.mini-tag.more { color: #007AFF; background: #E8F0FE; }
.card-date { font-size: 20rpx; color: #bbb; }
.card-note { font-size: 22rpx; color: #999; margin-top: 8rpx; padding: 8rpx 12rpx; background: #FAFAFA; border-radius: 6rpx; display: block; }
</style>
