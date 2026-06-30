<template>
  <view class="page-settings">
    <view class="settings-section">
      <text class="section-title">数据</text>

      <view class="settings-item" @click="exportData">
        <text class="item-label">导出数据</text>
        <text class="item-value">JSON 文件</text>
        <text class="arrow">›</text>
      </view>

      <view class="settings-item" @click="importData">
        <text class="item-label">导入数据</text>
        <text class="item-value">从 JSON 恢复</text>
        <text class="arrow">›</text>
      </view>

      <view class="settings-item" @click="showStats">
        <text class="item-label">数据统计</text>
        <text class="item-value">{{ stats }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="settings-section">
      <text class="section-title">管理</text>

      <view class="settings-item" @click="confirmReset">
        <text class="item-label" style="color: #FF5252;">重置所有数据</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="settings-footer">
      <text class="footer-text">Fan Memory OS v0.1.0</text>
      <text class="footer-text">Star-Trails-Log</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import { usePersonStore } from '@/stores/person'
import { storageService } from '@/utils/storage'

const contentStore = useContentStore()
const personStore = usePersonStore()

onShow(() => {
  contentStore.load()
  personStore.load()
})

const stats = computed(() => {
  const p = personStore.people.length
  const c = contentStore.contents.length
  return `${p} 人 · ${c} 条`
})

function exportData() {
  const json = storageService.exportJSON()
  // 保存到文件 (uni-app中通过文件系统)
  uni.setClipboardData({
    data: json,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
    }
  })
}

function importData() {
  uni.showModal({
    title: '导入数据',
    content: '将 JSON 数据粘贴到输入框？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '请在控制台调用 storageService.importJSON()', icon: 'none' })
      }
    }
  })
}

function showStats() {
  const db = storageService.load()
  const msg = [
    `明星/团队：${db.people.length}`,
    `内容：${db.contents.length}`,
    `屏蔽规则：${db.ignore_rules.length}`,
    `标签：${db.tags.length}`,
    `最后更新：${db.last_updated?.slice(0, 10) || '-'}`,
  ].join('\n')

  uni.showModal({
    title: '数据统计',
    content: msg,
    showCancel: false,
  })
}

function confirmReset() {
  uni.showModal({
    title: '确认重置',
    content: '这将删除所有数据，不可恢复！',
    success: (res) => {
      if (res.confirm) {
        storageService.reset()
        contentStore.load()
        personStore.load()
        uni.showToast({ title: '已重置', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.page-settings {
  padding: 16rpx 0;
}

.settings-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 24rpx;
  color: #999;
  padding: 16rpx 32rpx 8rpx;
  display: block;
}

.settings-item {
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #F5F5F5;
}

.settings-item:last-child {
  border-bottom: none;
}

.item-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.item-value {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.arrow {
  font-size: 28rpx;
  color: #ccc;
}

.settings-footer {
  text-align: center;
  padding: 48rpx 32rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #ccc;
  display: block;
  margin-bottom: 4rpx;
}
</style>
