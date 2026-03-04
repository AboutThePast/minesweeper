<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
    <!-- 顶部控制栏 -->
    <header class="h-16 bg-white/70 backdrop-blur-md border-b border-white/60 shadow-sm flex items-center justify-between px-6 shrink-0">
      <div class="flex items-center gap-4">
        <!-- 标题 -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span class="text-xl">💎</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-700">扫雷</h1>
            <p class="text-xs text-slate-400">Minesweeper</p>
          </div>
        </div>

        <!-- 难度选择器 -->
        <select
          v-model="selectedDifficulty"
          class="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          :disabled="gameState === 'playing'"
        >
          <option v-for="(config, key) in DIFFICULTY" :key="key" :value="key">
            {{ config.label }}
          </option>
        </select>

        <!-- 旗帜模式切换 -->
        <button
          @click="toggleFlagMode"
          :class="flagMode ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'"
          class="px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 border border-slate-200"
        >
          <span>🚩</span>
          <span class="font-medium">{{ flagMode ? '旗帜模式' : '普通模式' }}</span>
        </button>
      </div>

      <!-- 右侧状态区 -->
      <div class="flex items-center gap-4">
        <!-- 剩余雷数 -->
        <div class="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-100">
          <span class="text-lg">💣</span>
          <span class="font-mono font-bold text-red-500 min-w-[40px] text-center">{{ String(remainingMines).padStart(3, '0') }}</span>
        </div>

        <!-- 重置按钮 -->
        <button
          @click="handleReset"
          :class="resetButtonClass"
          class="w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-105"
        >
          {{ resetButtonIcon }}
        </button>

        <!-- 计时器 -->
        <div class="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
          <span class="text-lg">⏱️</span>
          <span class="font-mono font-bold text-emerald-600 min-w-[40px] text-center">{{ String(Math.min(timer, 999)).padStart(3, '0') }}</span>
        </div>

        <!-- 智能提示按钮 -->
        <button
          v-if="gameState === 'playing' || gameState === 'ready'"
          @click="handleHint"
          class="px-4 py-2 text-sm bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-md flex items-center gap-1.5"
        >
          <span>💡</span>
          <span class="font-medium">提示</span>
        </button>
      </div>
    </header>

    <!-- 游戏主区域 -->
    <main class="flex-1 flex items-center justify-center p-4">
      <div class="relative">
        <!-- 游戏板容器 -->
        <div class="p-2 rounded-xl bg-white/60 backdrop-blur-md shadow-lg border border-white/70">
          <GameBoard
            :board="board"
            :game-state="gameState"
            :cols="cols"
            :rows="rows"
            :flag-mode="flagMode"
            @reveal="handleReveal"
            @flag="handleFlag"
            @quick-action="handleQuickAction"
          />
        </div>

        <!-- 底部状态条 -->
        <div class="mt-4 flex items-center justify-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <span :class="statusIndicatorClass" class="w-2 h-2 rounded-full"></span>
            <span class="text-slate-500 font-medium">{{ statusText }}</span>
          </div>
          <div class="text-slate-400">
            <span>{{ cols }}×{{ rows }}</span>
            <span class="mx-2">•</span>
            <span>{{ totalMines }} 颗地雷</span>
          </div>
        </div>
      </div>
    </main>

    <!-- 游戏结束弹窗 -->
    <GameModal
      :show="showModal"
      :is-win="gameState === 'won'"
      :difficulty="DIFFICULTY[difficulty].label"
      :timer="timer"
      @reset="handleReset"
      @close="handleCloseModal"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useMinesweeper } from './composables/useMinesweeper.js'
import GameBoard from './components/GameBoard.vue'
import GameModal from './components/GameModal.vue'
import { DIFFICULTY } from './constants/game.js'

const {
  board,
  gameState,
  difficulty,
  timer,
  rows,
  cols,
  totalMines,
  remainingMines,
  resetGame,
  revealCell,
  toggleFlag,
  quickAction,
  hintCertainMine
} = useMinesweeper()

const flagMode = ref(false)
const selectedDifficulty = ref(difficulty.value)
const showModal = ref(false)

// 监听游戏状态变化，自动显示弹窗
watch(gameState, (newVal) => {
  if (newVal === 'won' || newVal === 'lost') {
    showModal.value = true
  }
})

watch(selectedDifficulty, (newVal) => {
  if (newVal !== difficulty.value) {
    resetGame(newVal)
  }
})

watch(difficulty, (newVal) => {
  selectedDifficulty.value = newVal
})

function toggleFlagMode() {
  flagMode.value = !flagMode.value
}

const statusText = computed(() => {
  if (gameState.value === 'won') return '恭喜获胜'
  if (gameState.value === 'lost') return '游戏结束'
  if (gameState.value === 'playing') return '游戏中'
  return '准备开始'
})

const statusIndicatorClass = computed(() => {
  if (gameState.value === 'won') return 'bg-emerald-500'
  if (gameState.value === 'lost') return 'bg-red-500'
  if (gameState.value === 'playing') return 'bg-amber-400'
  return 'bg-slate-400'
})

const resetButtonIcon = computed(() => {
  if (gameState.value === 'won') return '🎉'
  if (gameState.value === 'lost') return '😵'
  return '🔄'
})

const resetButtonClass = computed(() => {
  if (gameState.value === 'won') return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md'
  if (gameState.value === 'lost') return 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md'
  return 'bg-slate-100 text-slate-600 hover:bg-slate-200'
})

function handleReset() {
  resetGame()
  showModal.value = false
}

function handleReveal(index) {
  revealCell(index)
}

function handleFlag(index, event) {
  toggleFlag(index, event)
}

function handleQuickAction(index) {
  quickAction(index)
}

function handleHint() {
  const found = hintCertainMine()
  if (!found) {
    console.log('当前没有可以确定的雷位置')
  }
}

function handleCloseModal() {
  // 关闭弹窗，但保持游戏结束状态，让用户可以查看复盘
  showModal.value = false
}
</script>
