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
  index: {
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

// 数字颜色 - 浅色系主题适配
const numberColors = {
  1: 'text-blue-600 font-bold',
  2: 'text-emerald-600 font-bold',
  3: 'text-red-600 font-bold',
  4: 'text-purple-600 font-bold',
  5: 'text-amber-600 font-bold',
  6: 'text-teal-600 font-bold',
  7: 'text-indigo-600 font-bold',
  8: 'text-pink-600 font-bold'
}

const cellClasses = computed(() => {
  // 根据难度调整格子大小
  const sizeClass = props.cols === 30
    ? 'w-7 h-7 text-sm'  // 高级
    : props.cols === 16
    ? 'w-8 h-8 text-base'  // 中级
    : 'w-10 h-10 text-lg'  // 初级

  const base = `${sizeClass} flex items-center justify-center font-bold select-none transition-all duration-150`

  if (props.cell.isRevealed) {
    if (props.cell.isMine) {
      return `${base} bg-gradient-to-br from-red-400 to-red-500 rounded-md shadow-inner`
    }
    return `${base} bg-white rounded-md border border-slate-200 shadow-inner`
  }

  if (props.cell.isFlagged) {
    return `${base} bg-gradient-to-br from-amber-400 to-orange-400 rounded-md shadow-md border border-amber-300`
  }

  // 未揭开 - 浅色渐变带立体感
  return `${base} bg-gradient-to-br from-slate-100 to-slate-200 rounded-md border border-slate-300 cursor-pointer hover:from-slate-50 hover:to-slate-100 shadow-md hover:shadow-lg transition-all`
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
    emit('flag', props.index)
    return
  }
  emit('click')
}

function handleRightClick(event) {
  event.preventDefault()
  emit('flag', props.index)
}

function handleDoubleClick() {
  emit('dblclick')
}

function handleTouchStart() {
  isLongPress.value = false
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    emit('flag', props.index)
  }, 500)
}

function handleTouchEnd() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  if (!isLongPress.value) {
    if (props.flagMode && !props.cell.isRevealed) {
      emit('flag', props.index)
      return
    }
    emit('click')
  }
}
</script>
