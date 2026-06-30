<template>
  <view class="page-team-detail fade-in">
    <view v-if="team" class="fade-in">
      <view class="profile">
        <view class="avatar"><text class="avatar-text">{{ team.name.charAt(0) }}</text></view>
        <view class="profile-info">
          <text class="profile-name">{{ team.name }}</text>
          <text class="profile-meta">{{ team.members.length }} 名成员</text>
        </view>
      </view>

      <view v-if="team.aliases.length" class="section">
        <text class="section-label">别称</text>
        <view class="chip-list">
          <text v-for="a in team.aliases" :key="a" class="chip tag-green">{{ a }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-label">成员</text>
        <view v-if="members.length === 0" class="empty-hint">暂无成员</view>
        <view v-else class="member-list">
          <view v-for="p in members" :key="p.id" class="member-row" @click="goStar(p.id)">
            <text class="member-name">{{ p.name }}</text>
            <text class="member-count">{{ getPersonContentCount(p.id) }} 条</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-label">近期内容</text>
        <view v-if="recentContents.length === 0" class="empty-hint">暂无内容</view>
        <view v-else class="content-list">
          <view v-for="item in recentContents" :key="item.id" class="content-card"
            @click="goDetail(item.id)">
            <text class="content-title">{{ item.title }}</text>
            <text class="content-date">{{ item.created_at }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty-state"><text class="empty-text">团队未找到</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTeamStore } from '@/stores/team'
import { usePersonStore } from '@/stores/person'
import { useContentStore } from '@/stores/content'

const teamStore = useTeamStore()
const personStore = usePersonStore()
const contentStore = useContentStore()
const teamId = ref('')

onShow(() => {
  teamStore.load(); personStore.load(); contentStore.load()
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  teamId.value = page.$page?.options?.id || page.options?.id || ''
})

const team = computed(() => teamStore.getById(teamId.value))
const members = computed(() => team.value?.members.map(id => personStore.getById(id)).filter(Boolean) || [])

function getPersonContentCount(id: string) { return contentStore.getByPerson(id).length }
function goStar(id: string) { uni.navigateTo({ url: '/pages/star/index?id=' + id }) }
function goDetail(id: string) { uni.navigateTo({ url: '/pages/collection/detail?id=' + id }) }

const recentContents = computed(() => {
  const ids = team.value?.members || []
  return contentStore.contents
    .filter(c => c.people.some(p => ids.includes(p)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10)
})
</script>

<style scoped>
.page-team-detail { padding-bottom: 40rpx; }
.profile { display: flex; align-items: center; padding: 48rpx 32rpx 32rpx; gap: 24rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: linear-gradient(135deg, #43e97b, #38f9d7); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-text { color: #FFF; font-size: 36rpx; font-weight: 700; }
.profile-info { flex: 1; }
.profile-name { font-size: 34rpx; font-weight: 700; display: block; }
.profile-meta { font-size: 24rpx; color: #999; margin-top: 4rpx; display: block; }
.section { padding: 16rpx 32rpx; }
.section-label { font-size: 24rpx; color: #999; display: block; margin-bottom: 12rpx; }
.chip-list { display: flex; flex-wrap: wrap; gap: 8rpx; }
.chip { padding: 4rpx 16rpx; border-radius: 6rpx; font-size: 22rpx; }
.tag-green { background: #E8F5E9; color: #4CAF50; }
.empty-hint { font-size: 24rpx; color: #ccc; text-align: center; padding: 20rpx; }
.member-list { background: #FFF; border-radius: 12rpx; overflow: hidden; }
.member-row { display: flex; align-items: center; padding: 20rpx 24rpx; border-bottom: 2rpx solid #F5F5F5; }
.member-row:last-child { border-bottom: none; }
.member-name { flex: 1; font-size: 26rpx; color: #1a1a1a; }
.member-count { font-size: 22rpx; color: #999; margin-right: 8rpx; }
.arrow { font-size: 28rpx; color: #ccc; }
.content-list { display: flex; flex-direction: column; gap: 8rpx; }
.content-card { background: #FFF; border-radius: 8rpx; padding: 16rpx 20rpx; }
.content-title { font-size: 26rpx; color: #1a1a1a; display: block; }
.content-date { font-size: 20rpx; color: #bbb; margin-top: 4rpx; display: block; }
.empty-state { text-align: center; padding: 120rpx; }
.empty-text { font-size: 28rpx; color: #999; }
</style>
