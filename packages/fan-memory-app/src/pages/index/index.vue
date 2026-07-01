<template>
  <view class="home">
    <!-- 欢迎区域 -->
    <view class="welcome-section">
      <text class="eyebrow">Fan Memory OS</text>
      <text class="welcome-title">追星资料库</text>
      <text class="welcome-subtitle">收藏、追踪、发现你关注的明星/团队内容</text>
    </view>

    <!-- 数据概览 -->
    <view class="dashboard-card">
      <view class="dashboard-header">
        <view>
          <text class="dashboard-title">资料库概览</text>
          <text class="dashboard-subtitle">{{ discoveryStore.connected ? '后端已连接，数据实时同步' : '后端未连接，显示本地数据' }}</text>
        </view>
        <text class="status-pill" :class="discoveryStore.connected ? 'online' : 'offline'">
          {{ discoveryStore.connected ? '在线' : '离线' }}
        </text>
      </view>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ personStore.people.length }}</text>
          <text class="stat-label">关注人物</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ discoveryStore.stats.total_sources }}</text>
          <text class="stat-label">追踪源</text>
        </view>
        <view class="stat-card highlight">
          <text class="stat-value">{{ discoveryStore.stats.new_count }}</text>
          <text class="stat-label">新发现</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-btn primary-action" @click="navigateTo('/pages/star/add')">
        <text class="action-icon">＋</text>
        <text class="action-label">添加明星</text>
        <text class="action-hint">建立关注对象</text>
      </view>
      <view class="action-btn" @click="navigateTo('/pages/collection/add')">
        <text class="action-icon">📎</text>
        <text class="action-label">收藏内容</text>
        <text class="action-hint">保存链接资料</text>
      </view>
    </view>

    <!-- 明星列表 -->
    <view class="section-header">
      <view>
        <text class="section-title">关注的明星</text>
        <text class="section-desc">按创建时间同步自后端资料库</text>
      </view>
      <text class="section-count">{{ personStore.people.length }} 人</text>
    </view>

    <view v-if="loading" class="empty-state">
      <text class="empty-icon">⏳</text>
      <text class="empty-text">正在加载资料库</text>
      <text class="empty-hint">稍等一下，正在同步人物与统计信息</text>
    </view>

    <view v-else-if="personStore.people.length === 0" class="empty-state">
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
            · 关键词 {{ person.keywords.length }} 个
          </text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePersonStore } from '@/stores/person'
import { useContentStore } from '@/stores/content'
import { useDiscoveryStore } from '@/stores/discovery'

const personStore = usePersonStore()
const contentStore = useContentStore()
const discoveryStore = useDiscoveryStore()
const loading = ref(true)

onShow(async () => {
  loading.value = true
  await personStore.load()
  contentStore.load()
  await discoveryStore.loadStats()
  loading.value = false
})

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style scoped>
.home { padding-bottom: 40rpx; }
.welcome-section { padding: 44rpx 32rpx 24rpx; }
.eyebrow { font-size: 22rpx; color: #667eea; font-weight: 700; letter-spacing: 2rpx; display: block; text-transform: uppercase; }
.welcome-title { font-size: 46rpx; font-weight: 800; color: #1a1a1a; display: block; margin-top: 8rpx; }
.welcome-subtitle { font-size: 25rpx; color: #888; margin-top: 8rpx; display: block; line-height: 1.5; }
.dashboard-card { margin: 0 24rpx 28rpx; padding: 28rpx; border-radius: 24rpx; background: linear-gradient(135deg, #ffffff, #f7f9ff); box-shadow: 0 10rpx 30rpx rgba(80, 100, 160, 0.10); }
.dashboard-header { display: flex; justify-content: space-between; gap: 18rpx; align-items: flex-start; }
.dashboard-title { display: block; font-size: 30rpx; font-weight: 800; color: #20243a; }
.dashboard-subtitle { display: block; font-size: 22rpx; color: #8b90a3; margin-top: 6rpx; }
.status-pill { border-radius: 999rpx; padding: 6rpx 18rpx; font-size: 21rpx; font-weight: 700; flex-shrink: 0; }
.status-pill.online { color: #21a366; background: #e8f7ef; }
.status-pill.offline { color: #d97706; background: #fff4df; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx; margin-top: 24rpx; }
.stat-card { background: rgba(255,255,255,0.82); border: 1rpx solid rgba(102,126,234,0.10); border-radius: 18rpx; padding: 20rpx 10rpx; text-align: center; }
.stat-card.highlight { background: #eef3ff; }
.stat-value { display: block; font-size: 38rpx; color: #2f3a8f; font-weight: 800; }
.stat-label { display: block; font-size: 21rpx; color: #777f99; margin-top: 4rpx; }
.quick-actions { display: flex; gap: 20rpx; padding: 0 24rpx 32rpx; }
.action-btn { flex: 1; background: #FFFFFF; border-radius: 18rpx; padding: 26rpx; text-align: left; box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.06); }
.primary-action { background: linear-gradient(135deg, #667eea, #764ba2); }
.action-icon { font-size: 36rpx; display: block; }
.action-label { font-size: 26rpx; color: #333; margin-top: 8rpx; display: block; font-weight: 700; }
.action-hint { font-size: 21rpx; color: #aaa; margin-top: 4rpx; display: block; }
.primary-action .action-label, .primary-action .action-hint, .primary-action .action-icon { color: #FFF; }
.section-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 12rpx 32rpx 18rpx; }
.section-title { font-size: 30rpx; font-weight: 700; display: block; }
.section-desc { font-size: 21rpx; color: #aaa; display: block; margin-top: 4rpx; }
.section-count { font-size: 24rpx; color: #667eea; font-weight: 700; background: #eef3ff; border-radius: 999rpx; padding: 6rpx 16rpx; }
.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-icon { font-size: 64rpx; display: block; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 16rpx; display: block; }
.empty-hint { font-size: 24rpx; color: #ccc; margin-top: 8rpx; display: block; }
.person-list { padding: 0 16rpx; }
.person-card { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; margin-bottom: 14rpx; display: flex; align-items: center; box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.05); }
.person-avatar { width: 76rpx; height: 76rpx; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; margin-right: 20rpx; flex-shrink: 0; }
.avatar-text { color: #FFFFFF; font-size: 30rpx; font-weight: 700; }
.person-info { flex: 1; min-width: 0; }
.person-name { font-size: 29rpx; font-weight: 700; color: #1a1a1a; display: block; }
.person-meta { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.arrow { font-size: 34rpx; color: #ccc; margin-left: 12rpx; }
</style>
