<template>
  <view class="app">
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useDiscoveryStore } from '@/stores/discovery'

const discoveryStore = useDiscoveryStore()

// 每次显示页面时更新小红点和连接状态
onShow(async () => {
  const connected = await discoveryStore.checkConnection()
  if (connected) {
    await discoveryStore.loadStats()
    const count = discoveryStore.stats.new_count
    if (count > 0) {
      uni.setTabBarBadge({ index: 4, text: String(Math.min(count, 99)) })
    } else {
      uni.removeTabBarBadge({ index: 4 })
    }
  }
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #333;
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
}

/* 渐入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 卡片入场 */
@keyframes cardIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

.card-enter {
  animation: cardIn 0.25s ease-out;
}

/* 通用卡片样式 */
.card {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 通用按钮 */
.btn-primary {
  background: #007AFF;
  color: #FFFFFF;
  border-radius: 10rpx;
  padding: 22rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: opacity 0.2s;
}

.btn-primary:active {
  opacity: 0.8;
}

.btn-primary:disabled {
  opacity: 0.5;
}

.btn-secondary {
  background: #F0F0F0;
  color: #333;
  border-radius: 10rpx;
  padding: 22rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  border: none;
}

/* 输入框 */
.input-field {
  background: #FFFFFF;
  border: 2rpx solid #E0E0E0;
  border-radius: 10rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #007AFF;
}

/* 状态标签 */
.tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  margin: 4rpx;
}

.tag-blue {
  background: #E8F0FE;
  color: #007AFF;
}

.tag-green {
  background: #E8F5E9;
  color: #4CAF50;
}

.tag-gray {
  background: #F5F5F5;
  color: #999;
}

/* Safe area */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
