<template>
  <button
    :class="cellClasses"
    :disabled="disabled"
    @click="handleClick"
    @contextmenu="handleRightClick"
    @dblclick="handleDoubleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <span v-if="showContent" :class="contentClasses">
      <template v-if="cell.isFlagged">🚩</template>
      <template v-else-if="cell.isMine">💣</template>
      <template v-else-if="cell.neighborMines > 0">
        {{ cell.neighborMines }}
      </template>
    </span>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  cell: {
    type: Object,
    required: true
  },
  gameState: {
    type: String,
    default: 'ready'
  },
  flagMode: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    required: true
  },
  cols: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['click', 'contextmenu', 'dblclick', 'flag'])

const longPressTimer = ref(null)
const isLongPress = ref(false)

// 数字颜色 - 柔和鲜艳风格
const numberColors = {
  1: 'text-blue-500 font-black',
  2: 'text-emerald-500 font-black',
  3: 'text-red-500 font-black',
  4: 'text-purple-600 font-black',
  5: 'text-amber-600 font-black',
  6: 'text-teal-500 font-black',
  7: 'text-indigo-600 font-black',
  8: 'text-pink-600 font-black'
}

const cellClasses = computed(() => {
  // 根据难度调整格子大小
  const sizeClass = props.cols === 30
    ? 'w-7 h-7 text-sm'  // 高级
    : props.cols === 16
    ? 'w-8 h-8 text-base'  // 中级
    : 'w-10 h-10 text-lg'  // 初级

  const base = `${sizeClass} flex items-center justify-center font-bold select-none rounded-md shadow-sm`

  if (props.cell.isRevealed) {
    if (props.cell.isMine) {
      return `${base} bg-gradient-to-br from-red-400 to-red-600`
    }
    return `${base} bg-gradient-to-br from-white to-slate-100`
  }

  if (props.cell.isFlagged) {
    return `${base} bg-gradient-to-br from-amber-400 to-orange-500 shadow-md`
  }

  // 未揭开 - 柔和渐变带立体感
  return `${base} bg-gradient-to-br from-slate-300 to-slate-400 border-t border-l border-white/50 cursor-pointer hover:from-slate-200 hover:to-slate-300 transition-colors`
})

const showContent = computed(() => {
  return props.cell.isRevealed || props.cell.isFlagged
})

const contentClasses = computed(() => {
  if (props.cell.isFlagged || props.cell.isMine) {
    return 'text-sm'
  }
  if (props.cell.neighborMines > 0 && props.cell.neighborMines <= 8) {
    return numberColors[props.cell.neighborMines] || ''
  }
  return ''
})

const disabled = computed(() => {
  return props.gameState === 'won' || props.gameState === 'lost'
})

function handleClick() {
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }
  if (props.flagMode && !props.cell.isRevealed) {
    emit('flag', props.cell)
    return
  }
  emit('click')
}

function handleRightClick(event) {
  event.preventDefault()
  emit('flag', props.cell)
}

function handleDoubleClick() {
  emit('dblclick')
}

function handleTouchStart() {
  isLongPress.value = false
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    emit('flag', props.cell)
  }, 500)
}

function handleTouchEnd() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  if (!isLongPress.value) {
    if (props.flagMode && !props.cell.isRevealed) {
      emit('flag', props.cell)
      return
    }
    emit('click')
  }
}
</script>
