<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] animate-fade-in" style="pointer-events: auto;">
    <div class="relative mx-4 p-8 rounded-3xl shadow-2xl text-center max-w-sm bg-white overflow-hidden transform animate-bounce-in" style="pointer-events: auto; z-index: 10000;">
      <!-- 装饰性背景 -->
      <div class="absolute inset-0 bg-gradient-to-br opacity-5" :class="isWin ? 'from-emerald-400 to-teal-500' : 'from-red-400 to-rose-500'" style="pointer-events: none;"></div>

      <!-- 图标 -->
      <div class="relative mb-6">
        <div :class="iconContainerClasses" class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 shadow-lg">
          <span class="text-6xl animate-bounce">{{ icon }}</span>
        </div>
      </div>

      <!-- 标题 -->
      <h2 :class="titleClasses" class="text-3xl font-black mb-3">{{ title }}</h2>

      <!-- 消息 -->
      <div class="relative mb-6 space-y-2">
        <p class="text-gray-600 text-sm font-medium">{{ message }}</p>
        <div class="flex items-center justify-center gap-3 text-xs text-gray-400 font-medium">
          <span class="px-2 py-1 bg-gray-100 rounded">{{ difficulty }}</span>
          <span class="px-2 py-1 bg-gray-100 rounded">{{ timer }}秒</span>
        </div>
      </div>

      <!-- 按钮 -->
      <button
        @click="$emit('reset')"
        :class="buttonClasses"
        class="px-8 py-3.5 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
        style="pointer-events: auto; position: relative; z-index: 10001;"
      >
        <span class="flex items-center gap-2">
          <span>🔄</span>
          <span>再来一局</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isWin: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    required: true
  },
  timer: {
    type: Number,
    required: true
  }
})

defineEmits(['reset'])

const icon = computed(() => props.isWin ? '🏆' : '💥')
const title = computed(() => props.isWin ? '恭喜获胜！' : '游戏结束')
const message = computed(() => {
  if (props.isWin) {
    return '所有地雷已成功标记，太棒了！'
  }
  return '不小心触雷了，再接再厉！'
})

const iconContainerClasses = computed(() => {
  return props.isWin
    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200'
    : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-200'
})

const titleClasses = computed(() => {
  return props.isWin
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent'
})

const buttonClasses = computed(() => {
  return props.isWin
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
