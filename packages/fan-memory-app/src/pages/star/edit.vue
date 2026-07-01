<template>
  <view class="page-edit">
    <view v-if="person" class="fade-in">
      <view class="form">
        <view class="form-group">
          <text class="form-label">姓名</text>
          <input class="input-field" v-model="editName" />
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
          <textarea class="textarea-field" v-model="editNotes" />
        </view>
        <button class="btn-primary" @click="save">保存</button>
        <button class="btn-danger" style="margin-top:16rpx" @click="confirmDelete">删除此明星及所有收藏</button>
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

onShow(() => {
  personStore.load()
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  personId.value = page.$page?.options?.id || page.options?.id || ''
  loadPerson()
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

function save() {
  if (!editName.value.trim()) { showToast('请输入姓名', 'error'); return }
  personStore.update(personId.value, {
    name: editName.value.trim(),
    type: editType.value,
    aliases: editAliases.value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    notes: editNotes.value,
  })
  showSuccess('已保存')
  setTimeout(() => uni.navigateBack(), 800)
}

function confirmDelete() {
  confirm('确认删除', `删除「${person.value?.name}」及其所有收藏？不可恢复！`).then(async ok => {
    if (ok) {
      await personStore.remove(personId.value)
      showSuccess('已删除')
      setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 800)
    }
  })
}
</script>

<style scoped>
.page-edit { padding: 32rpx; }
.form-group { margin-bottom: 28rpx; }
.form-label { font-size: 24rpx; color: #666; display: block; margin-bottom: 8rpx; }
.input-field { background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 26rpx; width: 100%; box-sizing: border-box; }
.textarea-field { background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 26rpx; width: 100%; height: 160rpx; box-sizing: border-box; }
.radio-group { display: flex; gap: 12rpx; }
.radio { padding: 10rpx 28rpx; border: 2rpx solid #E0E0E0; border-radius: 8rpx; font-size: 24rpx; color: #666; }
.radio.active { border-color: #007AFF; color: #007AFF; background: #E8F0FE; }
.btn-primary { width: 100%; }
.btn-danger { width: 100%; background: #FF5252; color: #FFF; border-radius: 10rpx; padding: 22rpx; text-align: center; font-size: 28rpx; font-weight: 600; border: none; }
</style>
