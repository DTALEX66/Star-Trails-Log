<template>
  <view class="page-star">
    <view class="profile">
      <view class="avatar">
        <text class="avatar-text">{{ person?.name.charAt(0) || '?' }}</text>
      </view>
      <view class="profile-info">
        <text class="profile-name">{{ person?.name || '加载中' }}</text>
        <text class="profile-type">{{ person?.type === 'group' ? '团体' : '个人' }}</text>
      </view>
      <text class="edit-btn" @click="goEdit">编辑</text>
    </view>

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
        <text class="stat-num">{{ sources.length }}</text>
        <text class="stat-label">追踪源</text>
      </view>
    </view>

    <view v-if="person?.aliases?.length" class="section">
      <text class="section-title">别名</text>
      <view class="tag-list">
        <text v-for="a in person!.aliases" :key="a" class="tag tag-blue">{{ a }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-row">
        <text class="section-title">追踪源（{{ sources.length }}）</text>
        <text class="section-action" @click="goAddSource">＋ 添加</text>
      </view>
      <view v-if="sourcesLoading" class="empty-hint">正在同步追踪源...</view>
      <view v-else-if="sources.length === 0" class="source-empty">
        <text class="source-empty-title">还没有追踪源</text>
        <text class="source-empty-desc">添加关键词、官方账号或作品页后，后端会定时发现新内容。</text>
      </view>
      <view v-else class="source-list">
        <view v-for="source in sources" :key="source.uid" class="source-card">
          <view>
            <text class="source-platform">{{ source.platform || 'other' }}</text>
            <text class="source-main">{{ source.keyword || source.url || source.uid }}</text>
          </view>
          <view class="source-actions">
            <text class="source-type">{{ source.source_type }}</text>
            <text class="source-delete" @click.stop="deleteSource(source.uid)">删除</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">收藏内容（{{ contents.length }}）</text>
      <view v-if="contents.length === 0" class="empty-hint">还没有收藏内容</view>
      <view v-else class="content-list">
        <view
          v-for="item in contents"
          :key="item.id"
          class="content-card"
          @click="goDetail(item.id)"
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
import { api } from '@/utils/api'
import { getPlatformLabel } from '@/shared/utils/platform'
import { showSuccess } from '@/utils/toast'

const personStore = usePersonStore()
const contentStore = useContentStore()

const personId = ref('')
const sources = ref<any[]>([])
const sourcesLoading = ref(false)

onShow(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  personId.value = page.$page?.options?.id || page.options?.id || ''
  await load()
})

const person = computed(() => personStore.getById(personId.value))
const contents = computed(() => contentStore.getByPerson(personId.value))
const unwatched = computed(() => contentStore.getUnwatchedByPerson(personId.value))

async function load() {
  await personStore.load()
  contentStore.load()
  await loadSources()
}

async function loadSources() {
  if (!personId.value) return
  sourcesLoading.value = true
  const result = await api.listSources(personId.value)
  sources.value = result.ok && Array.isArray(result.data) ? result.data : []
  sourcesLoading.value = false
}

function toggleWatched(item: any) {
  contentStore.toggleWatched(item.id)
}

function goDetail(id: string) {
  uni.navigateTo({ url: '/pages/collection/detail?id=' + id })
}

function goEdit() {
  uni.navigateTo({ url: '/pages/star/edit?id=' + personId.value })
}

function goAddSource() {
  uni.navigateTo({ url: '/pages/reminder/index?person=' + personId.value })
}

async function deleteSource(uid: string) {
  const result = await api.deleteSource(uid)
  if (result.ok) {
    sources.value = sources.value.filter(s => s.uid !== uid)
    showSuccess('追踪源已删除')
  }
}
</script>

<style scoped>
.page-star { padding-bottom: 40rpx; }
.profile { display: flex; align-items: center; padding: 48rpx 32rpx 32rpx; gap: 24rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-text { color: #FFF; font-size: 36rpx; font-weight: 700; }
.profile-info { flex: 1; }
.profile-name { font-size: 34rpx; font-weight: 700; display: block; }
.profile-type { font-size: 24rpx; color: #999; margin-top: 4rpx; display: block; }
.edit-btn { font-size: 24rpx; color: #007AFF; background: #E8F0FE; padding: 8rpx 20rpx; border-radius: 6rpx; flex-shrink: 0; }
.stats { display: flex; justify-content: space-around; padding: 24rpx 32rpx; background: #FFFFFF; margin: 0 16rpx; border-radius: 12rpx; }
.stat-item { text-align: center; }
.stat-num { font-size: 36rpx; font-weight: 700; color: #007AFF; display: block; }
.stat-label { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.section { padding: 24rpx 32rpx; }
.section-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.section-title { font-size: 28rpx; font-weight: 600; display: block; margin-bottom: 16rpx; }
.section-row .section-title { margin-bottom: 0; }
.section-action { font-size: 23rpx; color: #007AFF; background: #E8F0FE; border-radius: 999rpx; padding: 6rpx 16rpx; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8rpx; }
.source-empty { background: #FFF; border-radius: 14rpx; padding: 28rpx; text-align: center; }
.source-empty-title { display: block; font-size: 26rpx; font-weight: 700; color: #777; }
.source-empty-desc { display: block; font-size: 22rpx; color: #aaa; line-height: 1.6; margin-top: 8rpx; }
.source-list { display: flex; flex-direction: column; gap: 12rpx; }
.source-card { background: #FFF; border-radius: 14rpx; padding: 20rpx; display: flex; justify-content: space-between; gap: 20rpx; align-items: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.source-platform { font-size: 20rpx; color: #667eea; background: #EEF3FF; padding: 2rpx 10rpx; border-radius: 999rpx; }
.source-main { display: block; font-size: 25rpx; color: #333; margin-top: 8rpx; }
.source-actions { flex-shrink: 0; display: flex; align-items: center; gap: 12rpx; }
.source-type { font-size: 21rpx; color: #999; }
.source-delete { font-size: 21rpx; color: #FF5252; background: #FFEBEE; border-radius: 999rpx; padding: 4rpx 12rpx; }
.content-list { display: flex; flex-direction: column; gap: 12rpx; }
.content-card { background: #FFFFFF; border-radius: 12rpx; padding: 20rpx; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.platform-tag { font-size: 22rpx; color: #007AFF; background: #E8F0FE; padding: 2rpx 12rpx; border-radius: 4rpx; }
.status-tag { font-size: 22rpx; padding: 2rpx 12rpx; border-radius: 4rpx; }
.status-tag.seen { color: #4CAF50; background: #E8F5E9; }
.status-tag.unseen { color: #FF9800; background: #FFF3E0; }
.card-title { font-size: 26rpx; color: #1a1a1a; display: block; margin-bottom: 8rpx; line-height: 1.5; }
.card-meta { display: flex; justify-content: space-between; align-items: center; }
.card-date { font-size: 20rpx; color: #bbb; }
.card-tags { display: flex; gap: 4rpx; }
.mini-tag { font-size: 18rpx; color: #999; background: #F5F5F5; padding: 2rpx 8rpx; border-radius: 4rpx; }
.empty-hint { text-align: center; font-size: 24rpx; color: #ccc; padding: 40rpx; }
</style>
