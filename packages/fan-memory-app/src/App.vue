<template>
  <view class="app">
  </view>
</template>

<script setup lang="ts">
</script>

<style>
/* 全局样式 */
page {
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

.app {
  min-height: 100vh;
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
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  border: none;
}

.btn-secondary {
  background: #F0F0F0;
  color: #333;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  border: none;
}

/* 输入框 */
.input-field {
  background: #FFFFFF;
  border: 2rpx solid #E0E0E0;
  border-radius: 8rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
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
</style>
