<template>
  <view class="home">
    <!-- 欢迎区域 -->
    <view class="welcome-section">
      <text class="welcome-title">Fan Memory OS</text>
      <text class="welcome-subtitle">你关注的明星/团队都在这里</text>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-btn" @click="navigateTo('/pages/star/add')">
        <text class="action-icon">＋</text>
        <text class="action-label">添加明星</text>
      </view>
      <view class="action-btn" @click="navigateTo('/pages/collection/add')">
        <text class="action-icon">📎</text>
        <text class="action-label">收藏内容</text>
      </view>
    </view>

    <!-- 明星列表 -->
    <view class="section-header">
      <text class="section-title">关注的明星</text>
      <text class="section-count">{{ personStore.people.length }} 人</text>
    </view>

    <view v-if="personStore.people.length === 0" class="empty-state">
      <text class="empty-icon">⭐</text>
      <text class="empty-text">还没有关注任何明星</text>
      <text class="empty-hint">点击上方「添加明星」开始你的追星记录</text>
    </view>

    <view v-else class="person-list">
      <view
        v-for="person in personStore.people"
        :key="person.id"
        class="person-card"
        @click="navigateTo('/pages/star/index?id=' + person.id)"
      >
        <view class="person-avatar">
          <text class="avatar-text">{{ person.name.charAt(0) }}</text>
        </view>
        <view class="person-info">
          <text class="person-name">{{ person.name }}</text>
          <text class="person-meta">
            收藏 {{ contentStore.getByPerson(person.id).length }} 条
            · 未看 {{ contentStore.getUnwatchedByPerson(person.id) }} 条
          </text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { usePersonStore } from '@/stores/person'
import { useContentStore } from '@/stores/content'

const personStore = usePersonStore()
const contentStore = useContentStore()

onShow(() => {
  personStore.load()
  contentStore.load()
})

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style scoped>
.home {
  padding-bottom: 40rpx;
}

.welcome-section {
  padding: 48rpx 32rpx 32rpx;
  text-align: center;
}

.welcome-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
}

.welcome-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.quick-actions {
  display: flex;
  gap: 24rpx;
  padding: 0 32rpx 32rpx;
}

.action-btn {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.action-icon {
  font-size: 36rpx;
  display: block;
}

.action-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
}

.section-count {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 80rpx 32rpx;
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

.person-list {
  padding: 0 16rpx;
}

.person-card {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.04);
}

.person-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.avatar-text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
}

.person-info {
  flex: 1;
  min-width: 0;
}

.person-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
}

.person-meta {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.arrow {
  font-size: 32rpx;
  color: #ccc;
  margin-left: 12rpx;
}
</style>
