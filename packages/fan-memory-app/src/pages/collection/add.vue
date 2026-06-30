<template>
  <view class="page-add-collection">
    <view class="form">
      <!-- 链接输入 -->
      <view class="form-group">
        <text class="form-label">链接 *</text>
        <view class="url-input-row">
          <input
            class="input-field url-input"
            v-model="url"
            placeholder="粘贴链接，自动识别平台和标题"
            @input="onUrlInput"
            @confirm="autoFillTitle"
          />
          <text class="auto-fill-btn" @click="autoFillTitle">提取</text>
        </view>
        <text v-if="detectedPlatform" class="platform-badge">
          {{ detectedPlatform }}
        </text>
      </view>

      <!-- 标题 -->
      <view class="form-group">
        <text class="form-label">标题 *</text>
        <input class="input-field" v-model="title" placeholder="内容标题" />
      </view>

      <!-- 关联人物 -->
      <view class="form-group">
        <text class="form-label">关联人物</text>
        <view v-if="personStore.people.length === 0" class="empty-hint">
          还没有关注任何明星，先去<text class="link" @click="goAddStar">添加明星</text>
        </view>
        <view v-else class="person-select">
          <text
            v-for="p in personStore.people"
            :key="p.id"
            class="person-chip"
            :class="{ selected: selectedPeople.includes(p.id) }"
            @click="togglePerson(p.id)"
          >
            {{ p.name }}
          </text>
        </view>
      </view>

      <!-- 标签 -->
      <view class="form-group">
        <text class="form-label">标签</text>
        <input
          class="input-field"
          v-model="tagInput"
          placeholder="输入标签后按回车"
          @confirm="addTag"
        />
        <view class="tag-list">
          <text v-for="(t, i) in tags" :key="i" class="tag tag-blue">
            {{ t }}
            <text class="tag-remove" @click="tags.splice(i, 1)">×</text>
          </text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-group">
        <text class="form-label">备注</text>
        <textarea class="textarea-field" v-model="note" placeholder="为什么收藏这条？" />
      </view>

      <!-- 去重提示 -->
      <view v-if="duplicateHint" class="duplicate-warning">
        <text class="dup-icon">⚠️</text>
        <view class="dup-content">
          <text class="dup-text">已收藏过此链接：</text>
          <text class="dup-title">{{ duplicateHint }}</text>
        </view>
        <text class="dup-btn" @click="copyUrl">复制原链接</text>
      </view>

      <!-- 按钮 -->
      <view class="form-actions">
        <button class="btn-primary" @click="save" :disabled="isSaving">
          {{ isSaving ? '收藏中...' : '收藏' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePersonStore } from '@/stores/person'
import { useContentStore } from '@/stores/content'
import { useDiscoveryStore } from '@/stores/discovery'
import { identifyPlatform, getPlatformLabel } from '@/shared/utils/platform'
import { showToast, showSuccess, extractTitleFromUrl } from '@/utils/toast'

const personStore = usePersonStore()
const contentStore = useContentStore()
const discoveryStore = useDiscoveryStore()

const url = ref('')
const title = ref('')
const selectedPeople = ref<string[]>([])
const tags = ref<string[]>([])
const tagInput = ref('')
const note = ref('')
const isSaving = ref(false)

onShow(() => {
  personStore.load()
  contentStore.load()
})

const detectedPlatform = computed(() => {
  if (!url.value) return ''
  const info = identifyPlatform(url.value)
  return info ? getPlatformLabel(info.platform) : ''
})

const duplicateHint = computed(() => {
  if (!url.value) return ''
  const existing = contentStore.contents.find(c => c.url === url.value)
  return existing ? existing.title : ''
})

function onUrlInput() {
  // Reset title when URL changes drastically
}

function autoFillTitle() {
  if (!url.value.trim()) return
  if (!title.value.trim()) {
    title.value = extractTitleFromUrl(url.value)
  }
}

function togglePerson(id: string) {
  const idx = selectedPeople.value.indexOf(id)
  if (idx === -1) {
    selectedPeople.value.push(id)
  } else {
    selectedPeople.value.splice(idx, 1)
  }
}

function addTag() {
  if (tagInput.value.trim()) {
    if (!tags.value.includes(tagInput.value.trim())) {
      tags.value.push(tagInput.value.trim())
    }
    tagInput.value = ''
  }
}

function goAddStar() {
  uni.navigateTo({ url: '/pages/star/add' })
}

function copyUrl() {
  const dup = contentStore.contents.find(c => c.url === url.value)
  if (dup) {
    uni.setClipboardData({ data: dup.url })
    showToast('原链接已复制')
  }
}

async function save() {
  if (!url.value.trim()) {
    showToast('请输入链接', 'error')
    return
  }
  if (!title.value.trim()) {
    showToast('请输入标题', 'error')
    return
  }

  isSaving.value = true

  // Auto-fill title if still empty
  autoFillTitle()

  const result = contentStore.add({
    url: url.value.trim(),
    title: title.value.trim(),
    people: selectedPeople.value,
    tags: tags.value,
    note: note.value,
  })

  isSaving.value = false

  if (result.duplicate) {
    showToast('已存在重复内容', 'error')
  } else if (result.content) {
    // 同步到后端：通知发现服务标记为已收藏
    discoveryStore.loadNewDiscoveries(10) // 刷新发现列表

    showSuccess('收藏成功！')
    setTimeout(() => uni.navigateBack(), 1200)
  }
}
</script>

<style scoped>
.page-add-collection {
  padding: 32rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.input-field {
  background: #FFFFFF;
  border: 2rpx solid #E0E0E0;
  border-radius: 8rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.textarea-field {
  background: #FFFFFF;
  border: 2rpx solid #E0E0E0;
  border-radius: 8rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  height: 160rpx;
  box-sizing: border-box;
}

.platform-badge {
  display: inline-block;
  margin-top: 8rpx;
  padding: 4rpx 16rpx;
  background: #E8F0FE;
  color: #007AFF;
  border-radius: 6rpx;
  font-size: 22rpx;
}

.url-input-row {
  display: flex;
  gap: 12rpx;
}

.url-input {
  flex: 1;
}

.auto-fill-btn {
  background: #F0F0F0;
  color: #666;
  padding: 20rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

.person-select {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.person-chip {
  padding: 12rpx 24rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.person-chip.selected {
  border-color: #007AFF;
  color: #007AFF;
  background: #E8F0FE;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.tag-remove {
  margin-left: 6rpx;
  font-size: 24rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #ccc;
}

.duplicate-warning {
  background: #FFF3E0;
  border: 2rpx solid #FFE0B2;
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.dup-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.dup-content {
  flex: 1;
  min-width: 0;
}

.dup-text {
  font-size: 22rpx;
  color: #E65100;
  display: block;
}

.dup-title {
  font-size: 24rpx;
  color: #BF360C;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dup-btn {
  font-size: 22rpx;
  color: #007AFF;
  background: #E8F0FE;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
}

.link {
  color: #007AFF;
  text-decoration: underline;
}

.form-actions {
  margin-top: 24rpx;
}

.form-actions .btn-primary {
  width: 100%;
}

.btn-primary:disabled {
  opacity: 0.5;
}
</style>
