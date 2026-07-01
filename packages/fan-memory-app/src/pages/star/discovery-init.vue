<template>
  <view class="page-discovery-init">
    <view class="hero-card">
      <text class="eyebrow">DISCOVERY SETUP</text>
      <text class="title">开始追踪「{{ person?.name || '新关注' }}」</text>
      <text class="subtitle">选择你关心的方向，系统会生成搜索词并创建追踪源。</text>
    </view>

    <view class="section">
      <text class="section-title">关注方向</text>
      <view class="direction-grid">
        <text
          v-for="direction in directions"
          :key="direction"
          class="direction-chip"
          :class="{ active: selectedDirections.includes(direction) }"
          @click="toggleDirection(direction)"
        >
          {{ direction }}
        </text>
      </view>
    </view>

    <view class="section">
      <view class="section-row">
        <text class="section-title">推荐追踪词</text>
        <text class="section-count">{{ seeds.length }} 个</text>
      </view>
      <view class="seed-list">
        <view v-for="seed in seeds" :key="seed.keyword" class="seed-card">
          <text class="seed-keyword">{{ seed.keyword }}</text>
          <text class="seed-platform">{{ seed.platform }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="btn-secondary" @click="skip">稍后再说</button>
      <button class="btn-primary" :disabled="submitting" @click="startTracking">
        {{ submitting ? '创建中...' : '开始自动发现' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePersonStore } from '@/stores/person'
import { useDiscoveryStore } from '@/stores/discovery'
import { buildDiscoverySeeds } from '@/shared/utils/discoverySeeds'
import { generateId } from '@/shared/utils/id'
import { showSuccess, showToast } from '@/utils/toast'

const personStore = usePersonStore()
const discoveryStore = useDiscoveryStore()
const personId = ref('')
const selectedDirections = ref<string[]>(['全部动态'])
const submitting = ref(false)

const directions = ['全部动态', '影视作品', '舞台音乐', '商务代言', '综艺采访']
const person = computed(() => personStore.getById(personId.value))
const seeds = computed(() => buildDiscoverySeeds(person.value?.name || '', selectedDirections.value))

onShow(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  personId.value = page.$page?.options?.id || page.options?.id || ''
  await personStore.load()
})

function toggleDirection(direction: string) {
  if (selectedDirections.value.includes(direction)) {
    selectedDirections.value = selectedDirections.value.filter(item => item !== direction)
    return
  }
  selectedDirections.value.push(direction)
}

async function startTracking() {
  if (!person.value) return
  submitting.value = true
  let created = 0
  for (const seed of seeds.value) {
    const ok = await discoveryStore.syncSource(person.value.id, {
      uid: generateId('source'),
      source_type: seed.source_type,
      platform: seed.platform,
      keyword: seed.keyword,
    })
    if (ok) created += 1
  }
  submitting.value = false
  if (created > 0) {
    showSuccess(`已创建 ${created} 个追踪源`)
    setTimeout(() => uni.redirectTo({ url: '/pages/star/index?id=' + person.value!.id }), 800)
  } else {
    showToast('后端未连接，稍后可在提醒页添加追踪源', 'error')
  }
}

function skip() {
  uni.redirectTo({ url: '/pages/star/index?id=' + personId.value })
}
</script>

<style scoped>
.page-discovery-init { padding: 28rpx 24rpx 160rpx; }
.hero-card { background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 26rpx; padding: 34rpx; color: #fff; box-shadow: 0 14rpx 36rpx rgba(102,126,234,0.22); }
.eyebrow { display: block; font-size: 21rpx; opacity: .82; letter-spacing: 2rpx; font-weight: 700; }
.title { display: block; margin-top: 10rpx; font-size: 38rpx; font-weight: 800; }
.subtitle { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.6; opacity: .9; }
.section { margin-top: 28rpx; }
.section-row { display: flex; align-items: center; justify-content: space-between; }
.section-title { display: block; font-size: 29rpx; font-weight: 800; color: #1f2937; margin-bottom: 16rpx; }
.section-count { font-size: 22rpx; color: #667eea; background: #eef3ff; border-radius: 999rpx; padding: 6rpx 16rpx; }
.direction-grid { display: flex; flex-wrap: wrap; gap: 14rpx; }
.direction-chip { font-size: 25rpx; color: #666; background: #fff; border: 2rpx solid #eceef5; border-radius: 999rpx; padding: 13rpx 24rpx; }
.direction-chip.active { color: #fff; background: #667eea; border-color: #667eea; }
.seed-list { display: flex; flex-direction: column; gap: 12rpx; }
.seed-card { background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.seed-keyword { font-size: 26rpx; color: #1f2937; font-weight: 650; }
.seed-platform { font-size: 21rpx; color: #667eea; background: #eef3ff; border-radius: 999rpx; padding: 4rpx 14rpx; }
.bottom-actions { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 18rpx; padding: 20rpx 24rpx 34rpx; background: rgba(248,248,248,.95); box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.06); }
.bottom-actions button { flex: 1; }
.btn-secondary { background: #fff; color: #667eea; border: 2rpx solid #dfe5ff; }
</style>
