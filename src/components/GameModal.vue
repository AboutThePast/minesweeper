<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[9999] animate-fade-in cursor-pointer" @click="$emit('close')" style="pointer-events: auto;">
    <div class="relative mx-4 p-10 rounded-3xl shadow-2xl text-center max-w-md bg-white overflow-hidden transform animate-bounce-in border border-white/50" style="pointer-events: auto; z-index: 10000;" @click.stop>
      <!-- 装饰性背景 -->
      <div class="absolute inset-0 bg-gradient-to-br opacity-10" :class="isWin ? 'from-emerald-400 to-teal-500' : 'from-red-400 to-rose-500'"></div>

      <!-- 光晕效果 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20" :class="isWin ? 'bg-emerald-500' : 'bg-red-500'"></div>

      <!-- 图标 -->
      <div class="relative mb-8">
        <div :class="iconContainerClasses" class="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 shadow-2xl">
          <span class="text-7xl animate-bounce">{{ icon }}</span>
        </div>
      </div>

      <!-- 标题 -->
      <h2 :class="titleClasses" class="relative text-4xl font-black mb-4">{{ title }}</h2>

      <!-- 消息 -->
      <div class="relative mb-8 space-y-4">
        <p class="text-slate-600 text-base font-medium">{{ message }}</p>
        <div class="flex items-center justify-center gap-3 text-sm text-slate-500">
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 font-medium">{{ difficulty }}</span>
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 font-medium">{{ timer }} 秒</span>
        </div>
      </div>

      <!-- 按钮 -->
      <button
        @click="$emit('reset')"
        :class="buttonClasses"
        class="relative px-10 py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer text-lg"
      >
        <span class="flex items-center gap-3">
          <span class="text-xl">🔄</span>
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

defineEmits(['reset', 'close'])

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
    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-200'
    : 'bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 shadow-red-200'
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
