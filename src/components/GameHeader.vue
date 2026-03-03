<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
    <!-- 难度选择器 + 旗帜模式 -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">难度</span>
        <select
          v-model="selectedDifficulty"
          class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="gameState === 'playing'"
        >
          <option v-for="(config, key) in difficulties" :key="key" :value="key">
            {{ config.label }}
          </option>
        </select>
      </div>

      <!-- 旗帜模式切换按钮 -->
      <button
        @click="$emit('toggle-flag-mode')"
        :class="flagModeButtonClasses"
        class="px-3 py-1.5 rounded text-sm font-medium transition-colors border"
        :title="flagMode ? '点击格子直接标记旗帜' : '点击格子直接揭开'"
      >
        <span class="text-base">🚩</span>
        <span class="ml-1">{{ flagModeText }}</span>
      </button>
    </div>

    <!-- 状态显示 -->
    <div class="flex items-center gap-4">
      <!-- 剩余雷数 -->
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded border border-gray-200">
        <span class="text-lg">💣</span>
        <span class="font-mono text-xl font-bold text-gray-700 min-w-[50px] text-center">{{ formattedRemainingMines }}</span>
      </div>

      <!-- 重置按钮 -->
      <button
        @click="$emit('reset')"
        :class="resetButtonClasses"
        class="w-12 h-12 rounded-lg font-medium transition-colors text-2xl flex items-center justify-center"
      >
        {{ resetButtonIcon }}
      </button>

      <!-- 计时器 -->
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded border border-gray-200">
        <span class="text-lg">⏱️</span>
        <span class="font-mono text-xl font-bold text-gray-700 min-w-[50px] text-center">{{ formattedTime }}</span>
      </div>

      <!-- 智能提示按钮 -->
      <button
        v-if="showHintButton"
        @click="$emit('hint')"
        :disabled="gameState !== 'playing' && gameState !== 'ready'"
        class="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-amber-700 disabled:text-gray-400 font-medium text-sm rounded border border-amber-300 disabled:border-gray-200 transition-colors"
      >
        <span class="flex items-center gap-1">
          <span class="text-lg">💡</span>
          <span>提示</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { DIFFICULTY } from '../constants/game.js'

const props = defineProps({
  difficulty: {
    type: String,
    required: true
  },
  remainingMines: {
    type: Number,
    required: true
  },
  timer: {
    type: Number,
    required: true
  },
  gameState: {
    type: String,
    default: 'ready'
  },
  flagMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reset', 'difficulty-change', 'hint', 'toggle-flag-mode'])

const difficulties = DIFFICULTY
const selectedDifficulty = ref(props.difficulty)

watch(selectedDifficulty, (newVal) => {
  if (newVal !== props.difficulty) {
    emit('difficulty-change', newVal)
  }
})

watch(() => props.difficulty, (newVal) => {
  selectedDifficulty.value = newVal
})

const formattedRemainingMines = computed(() => {
  return String(props.remainingMines).padStart(3, '0')
})

const formattedTime = computed(() => {
  return String(Math.min(props.timer, 999)).padStart(3, '0')
})

const resetButtonIcon = computed(() => {
  if (props.gameState === 'won') return '🎉'
  if (props.gameState === 'lost') return '😵'
  return '🔄'
})

const resetButtonClasses = computed(() => {
  const base = 'w-12 h-12 rounded-lg font-medium transition-colors text-2xl flex items-center justify-center'
  if (props.gameState === 'won') return `${base} bg-green-500 text-white`
  if (props.gameState === 'lost') return `${base} bg-red-500 text-white`
  return `${base} bg-gray-200 hover:bg-gray-300`
})

const showHintButton = computed(() => {
  return props.gameState === 'playing' || props.gameState === 'ready'
})

const flagModeText = computed(() => {
  return props.flagMode ? '开' : '关'
})

const flagModeButtonClasses = computed(() => {
  const base = 'px-3 py-1.5 rounded text-sm font-medium transition-colors border'
  if (props.flagMode) {
    return `${base} bg-amber-400 border-amber-500 text-white`
  }
  return `${base} bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200`
})
</script>
