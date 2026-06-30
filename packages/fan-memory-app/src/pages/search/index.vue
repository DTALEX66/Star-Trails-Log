<template>
  <view class="page-search">
    <!-- 搜索框 -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model="query"
        placeholder="搜明星/标题/标签/备注…"
        @input="onSearch"
        focus
      />
      <text v-if="query" class="clear-btn" @click="query = ''; results = []">×</text>
    </view>

    <!-- 搜索建议 -->
    <view v-if="!query" class="suggestions">
      <text class="suggest-title">快速搜索</text>
      <view class="suggest-grid">
        <text class="suggest-item" @click="query = '未看'; onSearch()">未看内容</text>
        <text class="suggest-item" @click="query = 'B站'; onSearch()">B站收藏</text>
        <text class="suggest-item" @click="query = '音乐'; onSearch()">音乐收藏</text>
      </view>

      <text class="suggest-title">明星</text>
      <view class="suggest-list">
        <text
          v-for="p in personStore.people"
          :key="p.id"
          class="suggest-person"
          @click="query = p.name; onSearch()"
        >{{ p.name }}</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="query && results.length === 0" class="empty-state">
      <text class="empty-text">没有找到匹配的内容</text>
    </view>

    <view v-if="results.length > 0" class="result-list">
      <view
        v-for="item in results"
        :key="item.id"
        class="result-card"
        @click="openUrl(item.url)"
      >
        <view class="card-header">
          <text class="platform-tag">{{ getPlatformLabel(item.platform) }}</text>
          <text class="person-label" v-for="pid in item.people" :key="pid">
            {{ getPersonName(pid) }}
          </text>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <view class="card-meta">
          <text class="card-date">{{ item.published_at || item.created_at }}</text>
          <text class="card-tag">{{ item.watched ? '已看' : '未看' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import { usePersonStore } from '@/stores/person'
import { getPlatformLabel } from '@/shared/utils/platform'

const contentStore = useContentStore()
const personStore = usePersonStore()
const query = ref('')
const results = ref<any[]>([])

onShow(() => {
  contentStore.load()
  personStore.load()
})

function onSearch() {
  if (!query.value.trim()) {
    results.value = []
    return
  }
  results.value = contentStore.search(query.value.trim())
}

function getPersonName(id: string): string {
  return personStore.getById(id)?.name || '未知'
}

function openUrl(url: string) {
  uni.setClipboardData({ data: url })
  uni.showToast({ title: '链接已复制', icon: 'none' })
}
</script>

<style scoped>
.page-search {
  padding: 16rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  padding: 0 24rpx;
}

.search-input {
  flex: 1;
  padding: 20rpx 0;
  font-size: 28rpx;
}

.clear-btn {
  font-size: 32rpx;
  color: #999;
  padding: 8rpx;
}

.suggestions {
  padding: 24rpx 0;
}

.suggest-title {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin: 16rpx 0 12rpx;
}

.suggest-grid {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.suggest-item {
  padding: 12rpx 24rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.suggest-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.suggest-person {
  padding: 12rpx 24rpx;
  background: #E8F0FE;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #007AFF;
}

.empty-state {
  text-align: center;
  padding: 80rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.result-list {
  padding-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.result-card {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.platform-tag {
  font-size: 20rpx;
  color: #007AFF;
  background: #E8F0FE;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
}

.person-label {
  font-size: 20rpx;
  color: #667eea;
  background: #F0F0FF;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
}

.card-title {
  font-size: 26rpx;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-date {
  font-size: 20rpx;
  color: #bbb;
}

.card-tag {
  font-size: 20rpx;
  color: #FF9800;
}
</style>
