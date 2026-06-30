<template>
  <view class="page-add-team fade-in">
    <view class="form">
      <view class="form-group">
        <text class="form-label">团队名 *</text>
        <input class="input-field" v-model="name" placeholder="组合/团体名称" />
      </view>
      <view class="form-group">
        <text class="form-label">别称</text>
        <input class="input-field" v-model="aliasesInput" placeholder="别称, 昵称（逗号分隔）" />
      </view>
      <view class="form-group">
        <text class="form-label">成员</text>
        <view v-if="personStore.people.length === 0" class="empty-hint">还没有添加明星</view>
        <view v-else class="member-select">
          <text v-for="p in personStore.people" :key="p.id"
            class="member-chip"
            :class="{ selected: selectedMembers.includes(p.id) }"
            @click="toggleMember(p.id)">{{ p.name }}</text>
        </view>
        <text class="selected-count">已选 {{ selectedMembers.length }} 人</text>
      </view>
      <view class="form-group">
        <text class="form-label">备注</text>
        <textarea class="textarea-field" v-model="notes" />
      </view>
      <button class="btn-primary" @click="save">创建团队</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTeamStore } from '@/stores/team'
import { usePersonStore } from '@/stores/person'
import { showToast, showSuccess } from '@/utils/toast'

const teamStore = useTeamStore()
const personStore = usePersonStore()

const name = ref('')
const aliasesInput = ref('')
const selectedMembers = ref<string[]>([])
const notes = ref('')

onShow(() => { personStore.load() })

function toggleMember(id: string) {
  const idx = selectedMembers.value.indexOf(id)
  idx === -1 ? selectedMembers.value.push(id) : selectedMembers.value.splice(idx, 1)
}

function save() {
  if (!name.value.trim()) { showToast('请输入团队名', 'error'); return }
  teamStore.add(name.value.trim(), {
    aliases: aliasesInput.value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    members: selectedMembers.value,
    notes: notes.value,
  })
  showSuccess('创建成功')
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style scoped>
.page-add-team { padding: 32rpx; }
.form-group { margin-bottom: 28rpx; }
.form-label { font-size: 24rpx; color: #666; display: block; margin-bottom: 8rpx; }
.input-field { background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 26rpx; width: 100%; box-sizing: border-box; }
.textarea-field { background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 26rpx; width: 100%; height: 120rpx; box-sizing: border-box; }
.empty-hint { font-size: 24rpx; color: #ccc; }
.member-select { display: flex; flex-wrap: wrap; gap: 10rpx; }
.member-chip { padding: 10rpx 24rpx; border: 2rpx solid #E0E0E0; border-radius: 20rpx; font-size: 24rpx; color: #666; }
.member-chip.selected { border-color: #007AFF; color: #007AFF; background: #E8F0FE; }
.selected-count { font-size: 22rpx; color: #999; margin-top: 8rpx; display: block; }
.btn-primary { width: 100%; }
</style>
