<template>
  <view class="page-block fade-in">
    <view class="section-header">
      <text class="section-title">屏蔽规则</text>
    </view>

    <view class="block-form">
      <text class="form-label">添加屏蔽规则</text>
      <view class="input-row">
        <picker class="type-picker" :value="ruleTypeIndex" :range="ruleTypes" @change="e => ruleTypeIndex = e.detail.value">
          <text class="picker-text">{{ ruleTypes[ruleTypeIndex] }}</text>
        </picker>
        <input class="input-field" v-model="ruleValue" placeholder="关键词/作者/平台" />
        <text class="add-rule-btn" @click="addRule">添加</text>
      </view>
    </view>

    <view v-if="rules.length === 0" class="empty-state">
      <text class="empty-icon">🛡️</text>
      <text class="empty-text">暂无屏蔽规则</text>
      <text class="empty-hint">添加规则后，匹配的内容将不再出现在新内容提醒中</text>
    </view>

    <view v-else class="rule-list">
      <view v-for="(rule, i) in rules" :key="rule.id" class="rule-row card-enter">
        <view class="rule-info">
          <text class="rule-type-badge">{{ ruleTypeLabel(rule.rule_type) }}</text>
          <text class="rule-value">{{ rule.value }}</text>
        </view>
        <text class="rule-remove" @click="removeRule(i)">删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storageService } from '@/utils/storage'
import { showToast, showSuccess } from '@/utils/toast'
import { generateId, ID_PREFIX } from '@/shared/utils/id'

const rules = ref<any[]>([])
const ruleTypes = ['关键词', '作者/账号', '平台', 'URL模式']
const ruleTypeIndex = ref(0)
const ruleValue = ref('')

onShow(() => { load() })

function load() { rules.value = storageService.getIgnoreRules() }

const ruleTypeMap = ['keyword', 'author', 'platform', 'url_pattern']
function ruleTypeLabel(t: string) {
  const map: Record<string, string> = { keyword: '关键词', author: '作者', platform: '平台', url_pattern: 'URL' }
  return map[t] || t
}

function addRule() {
  if (!ruleValue.value.trim()) { showToast('请输入规则值', 'error'); return }
  const rule = {
    id: generateId(ID_PREFIX.rule),
    person_id: '',
    rule_type: ruleTypeMap[ruleTypeIndex.value],
    value: ruleValue.value.trim(),
    duration: 'forever' as const,
    created_at: new Date().toISOString().split('T')[0],
  }
  storageService.addIgnoreRule(rule)
  rules.value.push(rule)
  ruleValue.value = ''
  showSuccess('已添加')
}

function removeRule(index: number) {
  const rule = rules.value[index]
  storageService.deleteIgnoreRule(rule.id)
  rules.value.splice(index, 1)
  showToast('已删除')
}
</script>

<style scoped>
.page-block { padding: 24rpx 16rpx; }
.section-header { padding: 0 16rpx 24rpx; }
.section-title { font-size: 32rpx; font-weight: 700; }
.block-form { background: #FFF; border-radius: 12rpx; padding: 24rpx; margin-bottom: 24rpx; }
.form-label { font-size: 22rpx; color: #999; display: block; margin-bottom: 12rpx; }
.input-row { display: flex; gap: 12rpx; }
.type-picker { background: #F5F5F5; border-radius: 8rpx; padding: 12rpx 16rpx; display: flex; align-items: center; }
.picker-text { font-size: 24rpx; color: #333; }
.input-field { flex: 1; background: #FFF; border: 2rpx solid #E0E0E0; border-radius: 8rpx; padding: 12rpx 16rpx; font-size: 26rpx; }
.add-rule-btn { background: #007AFF; color: #FFF; border-radius: 8rpx; padding: 12rpx 24rpx; font-size: 24rpx; display: flex; align-items: center; }
.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-icon { font-size: 64rpx; display: block; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 16rpx; display: block; }
.empty-hint { font-size: 22rpx; color: #ccc; margin-top: 8rpx; display: block; }
.rule-list { display: flex; flex-direction: column; gap: 8rpx; }
.rule-row { background: #FFF; border-radius: 10rpx; padding: 20rpx 24rpx; display: flex; align-items: center; justify-content: space-between; }
.rule-info { display: flex; align-items: center; gap: 12rpx; }
.rule-type-badge { font-size: 20rpx; color: #FF9800; background: #FFF3E0; padding: 2rpx 12rpx; border-radius: 4rpx; }
.rule-value { font-size: 26rpx; color: #333; }
.rule-remove { font-size: 24rpx; color: #FF5252; }
</style>
