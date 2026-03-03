<template>
  <div class="h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col">
    <!-- 顶部控制栏 -->
    <header class="h-16 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between px-6 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💎</span>
          <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">扫雷</h1>
        </div>
        <select
          v-model="selectedDifficulty"
          class="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
          :disabled="gameState === 'playing'"
        >
          <option v-for="(config, key) in DIFFICULTY" :key="key" :value="key">
            {{ config.label }}
          </option>
        </select>
        <button
          @click="toggleFlagMode"
          :class="flagMode ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'"
          class="px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>🚩</span>
          <span class="font-medium">{{ flagMode ? '旗帜模式' : '普通模式' }}</span>
        </button>
      </div>

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
          <span class="text-lg">💣</span>
          <span class="font-mono font-bold text-red-600">{{ String(remainingMines).padStart(3, '0') }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <span class="text-lg">⏱️</span>
          <span class="font-mono font-bold text-emerald-600">{{ String(Math.min(timer, 999)).padStart(3, '0') }}</span>
        </div>
        <button
          @click="handleReset"
          :class="resetButtonClass"
          class="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 shadow-md"
        >
          {{ resetButtonIcon }}
        </button>
        <button
          v-if="gameState === 'playing' || gameState === 'ready'"
          @click="handleHint"
          class="px-4 py-2 text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all shadow-md flex items-center gap-1.5"
        >
          <span>💡</span>
          <span class="font-medium">提示</span>
        </button>
      </div>
    </header>

    <!-- 游戏主区域 -->
    <main class="flex-1 overflow-auto p-4">
      <div class="min-h-full flex items-center justify-center">
        <div class="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/50">
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
      </div>
    </main>

    <!-- 底部状态栏 -->
    <footer class="h-10 bg-white/60 backdrop-blur-md border-t border-white/50 flex items-center justify-between px-6 shrink-0">
      <div class="flex items-center gap-2 text-sm">
        <span :class="statusIndicatorClass" class="w-2.5 h-2.5 rounded-full shadow-sm"></span>
        <span class="font-medium text-gray-600">{{ statusText }}</span>
      </div>
      <div class="flex items-center gap-6 text-sm text-gray-500 font-medium">
        <span>网格：{{ cols }}×{{ rows }}</span>
        <span>地雷：{{ totalMines }}</span>
      </div>
    </footer>

    <!-- 游戏结束弹窗 -->
    <GameModal
      :show="gameState === 'won' || gameState === 'lost'"
      :is-win="gameState === 'won'"
      :difficulty="DIFFICULTY[difficulty].label"
      :timer="timer"
      @reset="handleReset"
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
  if (gameState.value === 'won') return '🎉 恭喜获胜！'
  if (gameState.value === 'lost') return '💥 游戏结束'
  if (gameState.value === 'playing') return '游戏中...'
  return '准备开始'
})

const statusIndicatorClass = computed(() => {
  if (gameState.value === 'won') return 'bg-emerald-500 shadow-emerald-200'
  if (gameState.value === 'lost') return 'bg-red-500 shadow-red-200'
  if (gameState.value === 'playing') return 'bg-amber-400 shadow-amber-200'
  return 'bg-gray-400'
})

const resetButtonIcon = computed(() => {
  if (gameState.value === 'won') return '🎉'
  if (gameState.value === 'lost') return '😵'
  return '🔄'
})

const resetButtonClass = computed(() => {
  if (gameState.value === 'won') return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200'
  if (gameState.value === 'lost') return 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-200'
  return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
})

function handleReset() {
  resetGame()
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
</script>
