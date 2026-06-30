<template>
  <view class="page-collection">
    <!-- 筛选栏 -->
    <view class="filters">
      <scroll-view scroll-x class="filter-scroll">
        <text
          class="filter-item"
          :class="{ active: currentFilter === 'all' }"
          @click="currentFilter = 'all'"
        >全部</text>
        <text
          class="filter-item"
          :class="{ active: currentFilter === 'unwatched' }"
          @click="currentFilter = 'unwatched'"
        >未看</text>
        <text
          class="filter-item"
          :class="{ active: currentFilter === 'seen' }"
          @click="currentFilter = 'seen'"
        >已看</text>
      </scroll-view>
    </view>

    <!-- 列表 -->
    <view v-if="filteredContents.length === 0" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">还没有收藏内容</text>
      <text class="empty-hint">去收藏你关注的明星/团队内容</text>
    </view>

    <view v-else class="content-list">
      <view
        v-for="item in filteredContents"
        :key="item.id"
        class="content-card"
        @click="openUrl(item.url)"
      >
        <view class="card-header">
          <text class="platform-tag">{{ getPlatformLabel(item.platform) }}</text>
          <view class="card-actions">
            <text
              class="action-btn"
              @click.stop="toggleWatched(item)"
            >{{ item.watched ? '✓ 已看' : '○ 未看' }}</text>
            <text class="action-btn danger" @click.stop="confirmDelete(item)">删除</text>
          </view>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <view class="card-people">
          <text
            v-for="pid in item.people"
            :key="pid"
            class="person-tag"
          >{{ getPersonName(pid) }}</text>
        </view>
        <view class="card-meta">
          <text class="card-date">{{ item.published_at || item.created_at }}</text>
          <view class="card-tags">
            <text v-for="t in item.tags" :key="t" class="mini-tag">{{ t }}</text>
          </view>
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
const currentFilter = ref('all')

onShow(() => {
  contentStore.load()
  personStore.load()
})

const filteredContents = computed(() => {
  let items = contentStore.contents
  if (currentFilter.value === 'unwatched') {
    items = items.filter(c => !c.watched)
  } else if (currentFilter.value === 'seen') {
    items = items.filter(c => c.watched)
  }
  return items
})

function getPersonName(id: string): string {
  return personStore.getById(id)?.name || '未知'
}

function toggleWatched(item: any) {
  contentStore.toggleWatched(item.id)
}

function confirmDelete(item: any) {
  uni.showModal({
    title: '确认删除',
    content: `删除「${item.title}」？`,
    success: (res) => {
      if (res.confirm) {
        contentStore.remove(item.id)
      }
    }
  })
}

function openUrl(url: string) {
  uni.setClipboardData({ data: url })
  uni.showToast({ title: '链接已复制', icon: 'none' })
}
</script>

<style scoped>
.page-collection {
  padding-bottom: 40rpx;
}

.filters {
  padding: 16rpx 0;
  background: #FFFFFF;
  border-bottom: 2rpx solid #F0F0F0;
}

.filter-scroll {
  display: flex;
  white-space: nowrap;
  padding: 0 32rpx;
}

.filter-item {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-right: 12rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
  color: #666;
  background: #F5F5F5;
}

.filter-item.active {
  color: #FFF;
  background: #007AFF;
}

.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 16rpx;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 8rpx;
  display: block;
}

.content-list {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.content-card {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.platform-tag {
  font-size: 22rpx;
  color: #007AFF;
  background: #E8F0FE;
  padding: 2rpx 12rpx;
  border-radius: 4rpx;
}

.card-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  font-size: 22rpx;
  color: #007AFF;
}

.action-btn.danger {
  color: #FF5252;
}

.card-title {
  font-size: 26rpx;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.5;
}

.card-people {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
  margin-bottom: 8rpx;
}

.person-tag {
  font-size: 20rpx;
  color: #667eea;
  background: #F0F0FF;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
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

.card-tags {
  display: flex;
  gap: 4rpx;
}

.mini-tag {
  font-size: 18rpx;
  color: #999;
  background: #F5F5F5;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.card-note {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  padding: 8rpx 12rpx;
  background: #FAFAFA;
  border-radius: 6rpx;
  display: block;
}
</style>
