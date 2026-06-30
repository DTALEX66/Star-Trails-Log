<template>
  <view class="page-detail">
    <view v-if="content" class="fade-in">
      <!-- 头部 -->
      <view class="detail-header">
        <view class="header-meta">
          <text class="platform-badge">{{ getPlatformLabel(content.platform) }}</text>
          <text class="type-tag">{{ content.content_type }}</text>
          <text class="status-tag" :class="content.watched ? 'seen' : 'unseen'"
            @click="toggleWatched">{{ content.watched ? '已看' : '未看' }}</text>
        </view>
        <text class="detail-title">{{ content.title }}</text>
        <text class="detail-date">{{ content.published_at || content.created_at }}</text>
      </view>

      <!-- 关联人物 -->
      <view class="detail-section">
        <text class="section-label">人物</text>
        <view class="chip-list">
          <text v-for="pid in content.people" :key="pid" class="chip chip-blue"
            @click="goStar(pid)">{{ getPersonName(pid) }}</text>
        </view>
      </view>

      <!-- 标签 -->
      <view v-if="content.tags.length" class="detail-section">
        <text class="section-label">标签</text>
        <view class="chip-list">
          <text v-for="t in content.tags" :key="t" class="chip chip-tag">{{ t }}</text>
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="content.note" class="detail-section">
        <text class="section-label">备注</text>
        <view class="note-box">
          <text class="note-text">{{ content.note }}</text>
        </view>
      </view>

      <!-- 来源 -->
      <view class="detail-section">
        <text class="section-label">来源</text>
        <text class="source-text">{{ content.source === 'manual' ? '手动收藏' : content.source }}</text>
      </view>

      <!-- 操作 -->
      <view class="detail-actions">
        <button class="btn-primary" @click="openUrl">打开链接</button>
        <button class="btn-secondary" @click="editMode = !editMode">
          {{ editMode ? '取消编辑' : '编辑' }}
        </button>
        <button class="btn-danger" @click="confirmDelete">删除</button>
      </view>

      <!-- 编辑模式 -->
      <view v-if="editMode" class="edit-form card-enter">
        <view class="form-group">
          <text class="form-label">标题</text>
          <input class="input-field" v-model="editTitle" />
        </view>
        <view class="form-group">
          <text class="form-label">备注</text>
          <textarea class="textarea-field" v-model="editNote" />
        </view>
        <view class="form-group">
          <text class="form-label">标签（逗号分隔）</text>
          <input class="input-field" v-model="editTags" placeholder="标签1, 标签2" />
        </view>
        <button class="btn-primary" @click="saveEdit">保存修改</button>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-text">内容未找到</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import { usePersonStore } from '@/stores/person'
import { getPlatformLabel } from '@/shared/utils/platform'
import { showToast, showSuccess, confirm } from '@/utils/toast'

const contentStore = useContentStore()
const personStore = usePersonStore()

const contentId = ref('')
const editMode = ref(false)
const editTitle = ref('')
const editNote = ref('')
const editTags = ref('')

onShow(() => {
  contentStore.load()
  personStore.load()
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  contentId.value = page.$page?.options?.id || page.options?.id || ''
})

const content = computed(() => contentStore.getById(contentId.value))

function getPersonName(id: string) {
  return personStore.getById(id)?.name || '未知'
}

function toggleWatched() {
  if (content.value) {
    contentStore.toggleWatched(content.value.id)
    if (content.value.watched) showToast('标记为已看')
    else showToast('标记为未看')
  }
}

function openUrl() {
  if (content.value) {
    uni.setClipboardData({ data: content.value.url })
    showToast('链接已复制')
  }
}

function goStar(id: string) {
  uni.navigateTo({ url: '/pages/star/index?id=' + id })
}

function confirmDelete() {
  if (!content.value) return
  confirm('确认删除', `删除「${content.value.title}」？`).then(ok => {
    if (ok) {
      contentStore.remove(content.value!.id)
      showSuccess('已删除')
      setTimeout(() => uni.navigateBack(), 800)
    }
  })
}

function saveEdit() {
  if (!content.value || !editTitle.value.trim()) return
  contentStore.updateContent(content.value.id, {
    title: editTitle.value.trim(),
    note: editNote.value,
    tags: editTags.value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
  })
  editMode.value = false
  showSuccess('已保存')
}
</script>

<style scoped>
.page-detail { padding: 0 0 40rpx; }

.detail-header { background: #FFF; padding: 32rpx; margin-bottom: 16rpx; }
.header-meta { display: flex; gap: 8rpx; align-items: center; margin-bottom: 12rpx; }
.platform-badge { font-size: 22rpx; color: #007AFF; background: #E8F0FE; padding: 2rpx 14rpx; border-radius: 4rpx; }
.type-tag { font-size: 22rpx; color: #666; background: #F5F5F5; padding: 2rpx 14rpx; border-radius: 4rpx; }
.status-tag { font-size: 22rpx; padding: 2rpx 14rpx; border-radius: 4rpx; margin-left: auto; }
.status-tag.seen { color: #4CAF50; background: #E8F5E9; }
.status-tag.unseen { color: #FF9800; background: #FFF3E0; }
.detail-title { font-size: 34rpx; font-weight: 700; color: #1a1a1a; display: block; line-height: 1.5; }
.detail-date { font-size: 22rpx; color: #bbb; margin-top: 8rpx; display: block; }

.detail-section { background: #FFF; padding: 24rpx 32rpx; margin-bottom: 2rpx; }
.section-label { font-size: 24rpx; color: #999; display: block; margin-bottom: 12rpx; }
.chip-list { display: flex; flex-wrap: wrap; gap: 10rpx; }
.chip { padding: 8rpx 20rpx; border-radius: 6rpx; font-size: 24rpx; }
.chip-blue { color: #007AFF; background: #E8F0FE; }
.chip-tag { color: #666; background: #F5F5F5; }
.note-box { background: #FAFAFA; border-radius: 8rpx; padding: 16rpx; }
.note-text { font-size: 26rpx; color: #666; line-height: 1.6; }
.source-text { font-size: 24rpx; color: #999; }

.detail-actions { display: flex; flex-direction: column; gap: 16rpx; padding: 32rpx; }
.btn-danger { background: #FF5252; color: #FFF; border-radius: 10rpx; padding: 22rpx; text-align: center; font-size: 28rpx; font-weight: 600; border: none; }

.edit-form { background: #FFF; padding: 32rpx; margin: 16rpx; border-radius: 12rpx; }
.form-group { margin-bottom: 24rpx; }
.form-label { font-size: 24rpx; color: #666; display: block; margin-bottom: 8rpx; }
.input-field { background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 26rpx; width: 100%; box-sizing: border-box; }
.textarea-field { background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 26rpx; width: 100%; height: 120rpx; box-sizing: border-box; }
.empty-state { text-align: center; padding: 120rpx; }
.empty-text { font-size: 28rpx; color: #999; }
</style>
