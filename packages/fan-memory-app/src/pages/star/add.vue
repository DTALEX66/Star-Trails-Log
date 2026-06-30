<template>
  <view class="page-add-star">
    <view class="form">
      <view class="form-group">
        <text class="form-label">姓名 *</text>
        <input class="input-field" v-model="name" placeholder="明星/团队名称" />
      </view>

      <view class="form-group">
        <text class="form-label">类型</text>
        <view class="radio-group">
          <text class="radio" :class="{ active: type === 'star' }" @click="type = 'star'">个人</text>
          <text class="radio" :class="{ active: type === 'group' }" @click="type = 'group'">团体</text>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">别名/昵称</text>
        <view class="tag-input">
          <input class="input-field" v-model="aliasInput" placeholder="输入别名后按回车" @confirm="addAlias" />
          <view class="tag-list">
            <text v-for="(a, i) in aliases" :key="i" class="tag tag-blue">
              {{ a }}
              <text class="tag-remove" @click="aliases.splice(i, 1)">×</text>
            </text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">搜索关键词</text>
        <view class="tag-input">
          <input class="input-field" v-model="keywordInput" placeholder="输入关键词后按回车" @confirm="addKeyword" />
          <view class="tag-list">
            <text v-for="(k, i) in keywords" :key="i" class="tag tag-green">
              {{ k }}
              <text class="tag-remove" @click="keywords.splice(i, 1)">×</text>
            </text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">备注</text>
        <textarea class="textarea-field" v-model="notes" placeholder="随便记点什么" />
      </view>

      <view class="form-actions">
        <button class="btn-primary" @click="save">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePersonStore } from '@/stores/person'
import { showToast, showSuccess } from '@/utils/toast'

const personStore = usePersonStore()
const name = ref('')
const type = ref<'star' | 'group'>('star')
const aliases = ref<string[]>([])
const keywords = ref<string[]>([])
const notes = ref('')
const aliasInput = ref('')
const keywordInput = ref('')

function addAlias() {
  if (aliasInput.value.trim()) {
    aliases.value.push(aliasInput.value.trim())
    aliasInput.value = ''
  }
}

function addKeyword() {
  if (keywordInput.value.trim()) {
    keywords.value.push(keywordInput.value.trim())
    keywordInput.value = ''
  }
}

function save() {
  if (!name.value.trim()) {
    showToast('请输入姓名', 'error')
    return
  }

  const person = personStore.add(name.value.trim(), {
    type: type.value,
    aliases: aliases.value,
    keywords: keywords.value.length > 0 ? keywords.value : [name.value.trim()],
    notes: notes.value,
  })

  showSuccess('添加成功！')
  setTimeout(() => {
    uni.redirectTo({ url: '/pages/star/index?id=' + person.id })
  }, 1000)
}
</script>

<style scoped>
.page-add-star {
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

.radio-group {
  display: flex;
  gap: 16rpx;
}

.radio {
  padding: 12rpx 32rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.radio.active {
  border-color: #007AFF;
  color: #007AFF;
  background: #E8F0FE;
}

.tag-input .input-field {
  margin-bottom: 12rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag-remove {
  margin-left: 6rpx;
  font-size: 24rpx;
}

.form-actions {
  margin-top: 48rpx;
}

.form-actions .btn-primary {
  width: 100%;
}
</style>
