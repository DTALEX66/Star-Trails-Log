<template>
  <view class="page-settings">
    <view class="settings-section">
      <text class="section-title">连接</text>

      <view class="settings-item">
        <text class="item-label">后端地址</text>
        <input class="item-input" v-model="backendUrl" placeholder="http://localhost:8766" @blur="saveBackendUrl" />
      </view>

      <view class="settings-item" @click="testConnection">
        <text class="item-label">测试连接</text>
        <text class="item-value">{{ connectionStatus }}</text>
        <text class="arrow">›</text>
      </view>

      <view class="connection-card">
        <text class="connection-title">Discovery Service</text>
        <text class="connection-line">人物 {{ remoteStats.total_people }} · 追踪源 {{ remoteStats.total_sources }} · 新发现 {{ remoteStats.new_count }}</text>
        <text class="connection-line muted">{{ lastChecked ? '上次检测：' + lastChecked : '尚未完成检测' }}</text>
      </view>
    </view>

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

      <view class="settings-item" @click="navTo('/pages/team/index')">
        <text class="item-label">团队管理</text>
        <text class="item-value">组合/团体</text>
        <text class="arrow">›</text>
      </view>

      <view class="settings-item" @click="navTo('/pages/block/index')">
        <text class="item-label">屏蔽规则</text>
        <text class="item-value">关键词/作者/平台</text>
        <text class="arrow">›</text>
      </view>

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
import { api } from '@/utils/api'
import { showToast, showSuccess } from '@/utils/toast'

const contentStore = useContentStore()
const personStore = usePersonStore()

const API_URL_KEY = 'fan_memory_api_url'
const backendUrl = ref('http://localhost:8766')
const connectionStatus = ref('未测试')
const lastChecked = ref('')
const remoteStats = ref({ total_people: 0, total_sources: 0, total_discoveries: 0, new_count: 0 })

onShow(async () => {
  contentStore.load()
  await personStore.load()
  backendUrl.value = String(uni.getStorageSync(API_URL_KEY) || 'http://localhost:8766')
  await testConnection()
})

const stats = computed(() => {
  const p = personStore.people.length
  const c = contentStore.contents.length
  return `${p} 人 · ${c} 条`
})

function saveBackendUrl(showMessage = true) {
  const url = backendUrl.value.replace(/\/+$/, '')
  backendUrl.value = url
  try { uni.setStorageSync(API_URL_KEY, url) } catch {}
  if (showMessage) showToast('地址已保存')
}

async function testConnection() {
  connectionStatus.value = '检测中...'
  saveBackendUrl(false)
  const health = await api.health()
  if (health.ok) {
    connectionStatus.value = '✅ 已连接'
    const stats = await api.getDiscoveryStats()
    if (stats.ok && stats.data) remoteStats.value = stats.data
    lastChecked.value = new Date().toLocaleTimeString()
    showSuccess('后端连接成功')
  } else {
    connectionStatus.value = '❌ 无法连接'
    showToast('无法连接到后端', 'error')
  }
}

function exportData() {
  const json = storageService.exportJSON()
  uni.setClipboardData({
    data: json,
    success: () => showSuccess('已复制到剪贴板'),
  })
}

function importData() {
  uni.showModal({
    title: '导入数据',
    content: '请将 JSON 数据粘贴到控制台调用 storageService.importJSON()',
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
  uni.showModal({ title: '数据统计', content: msg, showCancel: false })
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
        showSuccess('已重置')
      }
    },
  })
}

function navTo(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style scoped>
.page-settings { padding: 16rpx 0; }
.settings-section { margin-bottom: 24rpx; }
.section-title { font-size: 24rpx; color: #999; padding: 16rpx 32rpx 8rpx; display: block; }
.settings-item { background: #FFF; padding: 24rpx 32rpx; display: flex; align-items: center; border-bottom: 2rpx solid #F5F5F5; }
.settings-item:last-child { border-bottom: none; }
.item-label { flex: 1; font-size: 28rpx; color: #333; }
.item-input { flex: 1; font-size: 26rpx; color: #007AFF; text-align: right; border: none; padding: 0; }
.item-value { font-size: 24rpx; color: #999; margin-right: 8rpx; }
.arrow { font-size: 28rpx; color: #ccc; }
.connection-card { margin: 16rpx 24rpx 0; background: #FFF; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.connection-title { display: block; font-size: 26rpx; color: #333; font-weight: 700; }
.connection-line { display: block; font-size: 23rpx; color: #666; margin-top: 8rpx; }
.connection-line.muted { color: #aaa; }
.settings-footer { text-align: center; padding: 48rpx 32rpx; }
.footer-text { font-size: 22rpx; color: #ccc; display: block; margin-bottom: 4rpx; }
</style>
