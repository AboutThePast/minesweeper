<template>
  <div
    :class="boardClasses"
    :style="boardStyle"
  >
    <Cell
      v-for="(cell, index) in board"
      :key="index"
      :cell="cell"
      :game-state="gameState"
      :flag-mode="flagMode"
      :rows="rows"
      :cols="cols"
      @click="$emit('reveal', index)"
      @contextmenu="$emit('flag', index, $event)"
      @dblclick="$emit('quick-action', index)"
      @flag="$emit('flag', index)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Cell from './Cell.vue'

const props = defineProps({
  board: {
    type: Array,
    required: true
  },
  gameState: {
    type: String,
    default: 'ready'
  },
  cols: {
    type: Number,
    required: true
  },
  rows: {
    type: Number,
    required: true
  },
  flagMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['reveal', 'flag', 'quick-action'])

const boardClasses = computed(() => {
  return 'grid gap-[2px] bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner'
})

const boardStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${props.cols}, minmax(0, 1fr))`
  }
})
</script>
