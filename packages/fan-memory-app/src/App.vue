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
  background:
    radial-gradient(circle at 16% 0%, rgba(102, 126, 234, 0.10), transparent 28%),
    linear-gradient(180deg, #FBFCFF 0%, #F5F7FB 45%, #F8F8F8 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #1F2937;
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
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(102, 126, 234, 0.08);
  border-radius: 18rpx;
  padding: 24rpx;
  margin: 16rpx;
  box-shadow: 0 10rpx 28rpx rgba(31, 41, 55, 0.07);
}

/* 通用按钮 */
.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #FFFFFF;
  border-radius: 14rpx;
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
  background: #FFFFFF;
  color: #667eea;
  border: 2rpx solid #DFE5FF;
  border-radius: 14rpx;
  padding: 22rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  border: none;
}

/* 输入框 */
.input-field {
  background: #FFFFFF;
  border: 2rpx solid #E7EAF3;
  border-radius: 14rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #667eea;
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
  background: #EEF3FF;
  color: #667eea;
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
