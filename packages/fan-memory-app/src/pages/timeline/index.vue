<template>
  <view class="page-timeline">
    <!-- 人物筛选 -->
    <view class="person-filter">
      <scroll-view scroll-x class="filter-scroll">
        <text
          class="filter-item"
          :class="{ active: !selectedPersonId }"
          @click="selectedPersonId = ''"
        >全部</text>
        <text
          v-for="p in personStore.people"
          :key="p.id"
          class="filter-item"
          :class="{ active: selectedPersonId === p.id }"
          @click="selectedPersonId = p.id"
        >{{ p.name }}</text>
      </scroll-view>
    </view>

    <!-- 时间线 -->
    <view v-if="timeline.length === 0" class="empty-state">
      <text class="empty-text">暂无时间线记录</text>
    </view>

    <view v-else class="timeline">
      <view v-for="(day, di) in timeline" :key="di" class="day-group">
        <view class="day-header">
          <text class="day-date">{{ day.date }}</text>
          <text class="day-count">{{ day.items.length }} 条</text>
        </view>
        <view class="day-items">
          <view
            v-for="(item, ii) in day.items"
            :key="ii"
            class="timeline-item"
          >
            <view class="timeline-dot" />
            <view class="timeline-content">
              <view class="tl-header">
                <text class="tl-platform">{{ getPlatformLabel(item.platform) }}</text>
                <text class="tl-type">{{ item.content_type }}</text>
              </view>
              <text class="tl-title">{{ item.title }}</text>
              <view class="tl-footer">
                <text class="tl-people" v-for="pid in item.people" :key="pid">
                  {{ getPersonName(pid) }}
                </text>
                <text
                  class="tl-watched"
                  :class="{ seen: item.watched }"
                >
                  {{ item.watched ? '已看' : '未看' }}
                </text>
              </view>
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
import { useContentStore } from '@/stores/content'
import { usePersonStore } from '@/stores/person'
import { getPlatformLabel } from '@/shared/utils/platform'

const contentStore = useContentStore()
const personStore = usePersonStore()
const selectedPersonId = ref('')

onShow(() => {
  contentStore.load()
  personStore.load()
})

const timeline = computed(() => {
  return contentStore.getTimeline(selectedPersonId.value || undefined)
})

function getPersonName(id: string): string {
  return personStore.getById(id)?.name || '未知'
}
</script>

<style scoped>
.page-timeline {
  padding-bottom: 40rpx;
}

.person-filter {
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

.empty-text {
  font-size: 28rpx;
  color: #999;
  display: block;
}

.timeline {
  padding: 16rpx;
}

.day-group {
  margin-bottom: 24rpx;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16rpx 12rpx;
}

.day-date {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.day-count {
  font-size: 22rpx;
  color: #999;
}

.day-items {
  position: relative;
  padding-left: 32rpx;
}

.day-items::before {
  content: '';
  position: absolute;
  left: 12rpx;
  top: 8rpx;
  bottom: 8rpx;
  width: 4rpx;
  background: #E0E0E0;
  border-radius: 2rpx;
}

.timeline-item {
  position: relative;
  margin-bottom: 16rpx;
}

.timeline-dot {
  position: absolute;
  left: -24rpx;
  top: 12rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #007AFF;
  border: 4rpx solid #E8F0FE;
  z-index: 1;
}

.timeline-content {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
}

.tl-header {
  display: flex;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

.tl-platform {
  font-size: 20rpx;
  color: #007AFF;
  background: #E8F0FE;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
}

.tl-type {
  font-size: 20rpx;
  color: #666;
  background: #F5F5F5;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
}

.tl-title {
  font-size: 26rpx;
  color: #1a1a1a;
  display: block;
  line-height: 1.5;
}

.tl-footer {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
  align-items: center;
}

.tl-people {
  font-size: 20rpx;
  color: #667eea;
  background: #F0F0FF;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
}

.tl-watched {
  font-size: 20rpx;
  color: #FF9800;
  margin-left: auto;
}

.tl-watched.seen {
  color: #4CAF50;
}
</style>
