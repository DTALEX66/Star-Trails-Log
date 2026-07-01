<template>
  <view class="page-edit">
    <view v-if="loading" class="state-card">
      <text class="state-icon">⏳</text>
      <text class="state-title">正在加载资料</text>
      <text class="state-desc">正在从资料库同步明星信息...</text>
    </view>

    <view v-else-if="!person" class="state-card">
      <text class="state-icon">🕳️</text>
      <text class="state-title">没有找到这位明星</text>
      <text class="state-desc">可能已被删除，或当前后端暂时不可用。</text>
      <button class="btn-primary state-action" @click="goHome">回到首页</button>
    </view>

    <view v-else class="fade-in">
      <view class="edit-hero">
        <view class="avatar"><text>{{ editName.charAt(0) || '?' }}</text></view>
        <view class="hero-info">
          <text class="hero-title">编辑 {{ person.name }}</text>
          <text class="hero-subtitle">调整名称、类型与别名，保存后同步到后端资料库。</text>
        </view>
      </view>

      <view class="form">
        <view class="form-group">
          <text class="form-label">姓名</text>
          <input class="input-field" v-model="editName" placeholder="明星/团队名称" />
        </view>
        <view class="form-group">
          <text class="form-label">类型</text>
          <view class="radio-group">
            <text class="radio" :class="{ active: editType === 'star' }" @click="editType = 'star'">个人</text>
            <text class="radio" :class="{ active: editType === 'group' }" @click="editType = 'group'">团体</text>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">别名（逗号分隔）</text>
          <input class="input-field" v-model="editAliases" placeholder="别名1, 别名2" />
        </view>
        <view class="form-group">
          <text class="form-label">备注</text>
          <textarea class="textarea-field" v-model="editNotes" placeholder="记录补充信息，例如团综、代表作品、关注重点" />
        </view>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
        <button class="btn-danger" :disabled="saving" @click="confirmDelete">删除此明星及所有收藏</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePersonStore } from '@/stores/person'
import { showToast, showSuccess, confirm } from '@/utils/toast'

const personStore = usePersonStore()

const personId = ref('')
const editName = ref('')
const editType = ref<'star'|'group'>('star')
const editAliases = ref('')
const editNotes = ref('')
const loading = ref(true)
const saving = ref(false)

onShow(async () => {
  loading.value = true
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  personId.value = page.$page?.options?.id || page.options?.id || ''
  await personStore.load()
  loadPerson()
  loading.value = false
})

const person = computed(() => personStore.getById(personId.value))

function loadPerson() {
  const p = person.value
  if (p) {
    editName.value = p.name
    editType.value = p.type
    editAliases.value = p.aliases.join(', ')
    editNotes.value = p.notes || ''
  }
}

async function save() {
  if (!editName.value.trim()) { showToast('请输入姓名', 'error'); return }
  saving.value = true
  await personStore.update(personId.value, {
    name: editName.value.trim(),
    type: editType.value,
    aliases: editAliases.value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    notes: editNotes.value,
  })
  saving.value = false
  showSuccess('已保存')
  setTimeout(() => uni.navigateBack(), 800)
}

function confirmDelete() {
  confirm('确认删除', `删除「${person.value?.name}」及其所有收藏？不可恢复！`).then(async ok => {
    if (ok) {
      saving.value = true
      await personStore.remove(personId.value)
      saving.value = false
      showSuccess('已删除')
      setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 800)
    }
  })
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page-edit { padding: 32rpx; }
.edit-hero { display: flex; align-items: center; gap: 20rpx; padding: 8rpx 0 32rpx; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 34rpx; font-weight: 700; flex-shrink: 0; }
.hero-info { flex: 1; min-width: 0; }
.hero-title { font-size: 34rpx; font-weight: 700; color: #1a1a1a; display: block; }
.hero-subtitle { font-size: 23rpx; color: #888; line-height: 1.5; margin-top: 6rpx; display: block; }
.form { background: #FFF; border-radius: 18rpx; padding: 28rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05); }
.form-group { margin-bottom: 28rpx; }
.form-label { font-size: 24rpx; color: #666; display: block; margin-bottom: 8rpx; font-weight: 600; }
.input-field { background: #FAFAFA; border: 2rpx solid #E8E8E8; border-radius: 10rpx; padding: 18rpx 20rpx; font-size: 26rpx; width: 100%; box-sizing: border-box; }
.textarea-field { background: #FAFAFA; border: 2rpx solid #E8E8E8; border-radius: 10rpx; padding: 18rpx 20rpx; font-size: 26rpx; width: 100%; height: 180rpx; box-sizing: border-box; }
.radio-group { display: flex; gap: 12rpx; }
.radio { padding: 12rpx 32rpx; border: 2rpx solid #E0E0E0; border-radius: 999rpx; font-size: 24rpx; color: #666; }
.radio.active { border-color: #007AFF; color: #007AFF; background: #E8F0FE; font-weight: 600; }
.btn-primary { width: 100%; border-radius: 12rpx; }
.btn-danger { width: 100%; background: #FF5252; color: #FFF; border-radius: 12rpx; padding: 22rpx; text-align: center; font-size: 28rpx; font-weight: 600; border: none; margin-top: 16rpx; }
.btn-primary[disabled], .btn-danger[disabled] { opacity: 0.55; }
.state-card { min-height: 520rpx; background: #FFF; border-radius: 20rpx; padding: 56rpx 32rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.05); }
.state-icon { font-size: 70rpx; display: block; }
.state-title { font-size: 32rpx; font-weight: 700; color: #333; margin-top: 18rpx; display: block; }
.state-desc { font-size: 24rpx; color: #999; line-height: 1.6; margin-top: 8rpx; display: block; }
.state-action { margin-top: 28rpx; }
</style>
