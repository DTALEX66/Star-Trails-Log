<template>
  <view class="page-reminder">
    <view class="empty-state">
      <text class="empty-icon">🔔</text>
      <text class="empty-text">提醒中心</text>
      <text class="empty-hint">此功能将在 Phase 2 实现</text>
      <text class="empty-detail">
        支持生日提醒、新歌上线提醒、综艺开播提醒
      </text>
    </view>
  </view>
</template>

<style scoped>
.page-reminder {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.empty-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.empty-detail {
  font-size: 22rpx;
  color: #ccc;
  margin-top: 4rpx;
  display: block;
}
</style>
