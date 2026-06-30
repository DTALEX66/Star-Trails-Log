<template>
  <view class="page-team-list fade-in">
    <view class="section-header">
      <text class="section-title">团队管理</text>
      <text class="add-btn" @click="goAdd">+ 添加</text>
    </view>

    <view v-if="teams.length === 0" class="empty-state">
      <text class="empty-icon">👥</text>
      <text class="empty-text">还没有创建团队</text>
      <text class="empty-hint">把明星归入团队，方便统一查看</text>
    </view>

    <view v-else class="team-list">
      <view v-for="team in teams" :key="team.id" class="team-card card-enter"
        @click="goDetail(team.id)">
        <view class="team-avatar">
          <text class="avatar-text">{{ team.name.charAt(0) }}</text>
        </view>
        <view class="team-info">
          <text class="team-name">{{ team.name }}</text>
          <text class="team-meta">{{ team.members.length }} 名成员 · {{ getContentCount(team.id) }} 条内容</text>
          <view v-if="team.aliases.length" class="alias-row">
            <text v-for="a in team.aliases.slice(0,3)" :key="a" class="alias-tag">{{ a }}</text>
          </view>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTeamStore } from '@/stores/team'
import { useContentStore } from '@/stores/content'

const teamStore = useTeamStore()
const contentStore = useContentStore()

onShow(() => { teamStore.load(); contentStore.load() })

const teams = computed(() => teamStore.teams)

function getContentCount(teamId: string): number {
  const personIds = teamStore.getById(teamId)?.members || []
  return contentStore.contents.filter(c => c.people.some(p => personIds.includes(p))).length
}

function goAdd() { uni.navigateTo({ url: '/pages/team/add' }) }
function goDetail(id: string) { uni.navigateTo({ url: '/pages/team/detail?id=' + id }) }
</script>

<style scoped>
.page-team-list { padding: 24rpx 16rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 0 16rpx 24rpx; }
.section-title { font-size: 32rpx; font-weight: 700; }
.add-btn { font-size: 26rpx; color: #007AFF; font-weight: 600; }
.empty-state { text-align: center; padding: 120rpx 32rpx; }
.empty-icon { font-size: 64rpx; display: block; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 16rpx; display: block; }
.empty-hint { font-size: 24rpx; color: #ccc; margin-top: 8rpx; display: block; }

.team-card { background: #FFF; border-radius: 12rpx; padding: 24rpx; margin-bottom: 12rpx; display: flex; align-items: center; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.team-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; background: linear-gradient(135deg, #43e97b, #38f9d7); display: flex; align-items: center; justify-content: center; margin-right: 20rpx; flex-shrink: 0; }
.avatar-text { color: #FFF; font-size: 28rpx; font-weight: 600; }
.team-info { flex: 1; min-width: 0; }
.team-name { font-size: 28rpx; font-weight: 600; color: #1a1a1a; display: block; }
.team-meta { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.alias-row { display: flex; gap: 6rpx; margin-top: 6rpx; flex-wrap: wrap; }
.alias-tag { font-size: 18rpx; color: #38f9d7; background: #F0FFF4; padding: 2rpx 10rpx; border-radius: 4rpx; }
.arrow { font-size: 32rpx; color: #ccc; margin-left: 12rpx; }
</style>
