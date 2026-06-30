<template>
  <view class="page-star">
    <!-- 人物信息 -->
    <view class="profile">
      <view class="avatar">
        <text class="avatar-text">{{ person?.name.charAt(0) || '?' }}</text>
      </view>
      <view class="profile-info">
        <text class="profile-name">{{ person?.name }}</text>
        <text class="profile-type">{{ person?.type === 'group' ? '团体' : '个人' }}</text>
      </view>
    </view>

    <!-- 统计 -->
    <view class="stats">
      <view class="stat-item">
        <text class="stat-num">{{ contents.length }}</text>
        <text class="stat-label">收藏</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ unwatched }}</text>
        <text class="stat-label">未看</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ platforms.length }}</text>
        <text class="stat-label">平台</text>
      </view>
    </view>

    <!-- 别名 -->
    <view v-if="person?.aliases?.length" class="section">
      <text class="section-title">别名</text>
      <view class="tag-list">
        <text v-for="a in person!.aliases" :key="a" class="tag tag-blue">{{ a }}</text>
      </view>
    </view>

    <!-- 内容列表 -->
    <view class="section">
      <text class="section-title">收藏内容（{{ contents.length }}）</text>
      <view v-if="contents.length === 0" class="empty-hint">还没有收藏内容</view>
      <view v-else class="content-list">
        <view
          v-for="item in contents"
          :key="item.id"
          class="content-card"
          @click="openUrl(item.url)"
        >
          <view class="card-header">
            <text class="platform-tag">{{ getPlatformLabel(item.platform) }}</text>
            <text
              class="status-tag"
              :class="item.watched ? 'seen' : 'unseen'"
              @click.stop="toggleWatched(item)"
            >
              {{ item.watched ? '已看' : '未看' }}
            </text>
          </view>
          <text class="card-title">{{ item.title }}</text>
          <view class="card-meta">
            <text class="card-date">{{ item.published_at || item.created_at }}</text>
            <view class="card-tags">
              <text v-for="t in item.tags" :key="t" class="mini-tag">{{ t }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePersonStore } from '@/stores/person'
import { useContentStore } from '@/stores/content'
import { getPlatformLabel } from '@/shared/utils/platform'

const personStore = usePersonStore()
const contentStore = useContentStore()

const personId = ref('')

onShow(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  personId.value = page.$page?.options?.id || page.options?.id || ''
  load()
})

const person = computed(() => personStore.getById(personId.value))
const contents = computed(() => contentStore.getByPerson(personId.value))
const unwatched = computed(() => contentStore.getUnwatchedByPerson(personId.value))
const platforms = computed(() => {
  const set = new Set(contents.value.map(c => c.platform))
  return [...set]
})

function load() {
  personStore.load()
  contentStore.load()
}

function toggleWatched(item: any) {
  contentStore.toggleWatched(item.id)
}

function openUrl(url: string) {
  uni.setClipboardData({ data: url })
  uni.showToast({ title: '链接已复制', icon: 'none' })
}
</script>

<style scoped>
.page-star {
  padding-bottom: 40rpx;
}

.profile {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx 32rpx;
  gap: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #FFF;
  font-size: 36rpx;
  font-weight: 700;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 34rpx;
  font-weight: 700;
  display: block;
}

.profile-type {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.stats {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  margin: 0 16rpx;
  border-radius: 12rpx;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #007AFF;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.section {
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.content-list {
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

.status-tag {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 4rpx;
}

.status-tag.seen {
  color: #4CAF50;
  background: #E8F5E9;
}

.status-tag.unseen {
  color: #FF9800;
  background: #FFF3E0;
}

.card-title {
  font-size: 26rpx;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.5;
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

.empty-hint {
  text-align: center;
  font-size: 24rpx;
  color: #ccc;
  padding: 40rpx;
}
</style>
