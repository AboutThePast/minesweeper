import { ref, computed, reactive } from 'vue'
import { DIFFICULTY, NUMBER_COLORS } from '../constants/game.js'
import {
  placeMines,
  calculateNeighborMines,
  floodFillReveal,
  checkWin,
  findCertainMine,
  getNeighborIndices
} from '../utils/helpers.js'

export function useMinesweeper() {
  // 游戏状态
  const board = ref([])
  const gameState = ref('ready') // 'ready' | 'playing' | 'won' | 'lost'
  const difficulty = ref('beginner')
  const timer = ref(0)
  const flagCount = ref(0)
  const firstClick = ref(true)
  const timerInterval = ref(null)

  // 计算属性
  const config = computed(() => DIFFICULTY[difficulty.value])
  const rows = computed(() => config.value.rows)
  const cols = computed(() => config.value.cols)
  const totalMines = computed(() => config.value.mines)
  const remainingMines = computed(() => totalMines.value - flagCount.value)

  // 初始化空面板
  function initEmptyBoard() {
    const size = rows.value * cols.value
    board.value = Array.from({ length: size }, () =>
      reactive({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      })
    )
  }

  // 开始游戏（首次点击后触发）
  function startGame(firstClickIndex) {
    // 生成地雷位置（排除首次点击区域）
    const minePositions = placeMines(rows.value, cols.value, totalMines.value, firstClickIndex)

    // 计算每个格子的邻居雷数
    calculateNeighborMines(board.value, rows.value, cols.value, minePositions)

    // 启动计时器
    startTimer()
  }

  // 启动计时器
  function startTimer() {
    timer.value = 0
    timerInterval.value = setInterval(() => {
      timer.value++
    }, 1000)
  }

  // 停止计时器
  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // 重置游戏
  function resetGame(newDifficulty = null) {
    stopTimer()
    if (newDifficulty) {
      difficulty.value = newDifficulty
    }
    gameState.value = 'ready'
    timer.value = 0
    flagCount.value = 0
    firstClick.value = true
    initEmptyBoard()
  }

  // 揭开格子
  function revealCell(index) {
    const cell = board.value[index]

    // 游戏结束或已插旗的格子不能点击
    if (gameState.value === 'won' || gameState.value === 'lost') return
    if (cell.isFlagged || cell.isRevealed) return

    // 首次点击 - 生成地雷并开始游戏
    if (firstClick.value) {
      firstClick.value = false
      gameState.value = 'playing'
      startGame(index)
    }

    // 踩雷 - 游戏失败
    if (cell.isMine) {
      cell.isRevealed = true
      gameState.value = 'lost'
      stopTimer()
      revealAllMines()
      return
    }

    // 揭开格子（包括洪水填充）
    floodFillReveal(board.value, index, rows.value, cols.value)

    // 检查胜利
    if (checkWin(board.value)) {
      gameState.value = 'won'
      stopTimer()
      autoFlagRemainingMines()
    }
  }

  // 切换旗帜状态
  function toggleFlag(index, event) {
    if (event) event.preventDefault()

    const cell = board.value[index]
    if (gameState.value === 'won' || gameState.value === 'lost') return
    if (cell.isRevealed) return

    // 首次点击：当成普通点击处理（揭开格子）
    if (firstClick.value) {
      revealCell(index)
      return
    }

    if (cell.isFlagged) {
      cell.isFlagged = false
      flagCount.value--
    } else {
      cell.isFlagged = true
      flagCount.value++
    }
  }

  // 显示所有地雷（游戏失败时）
  function revealAllMines() {
    board.value.forEach(cell => {
      if (cell.isMine) {
        cell.isRevealed = true
      }
    })
  }

  // 自动标记剩余雷（胜利时）
  function autoFlagRemainingMines() {
    board.value.forEach(cell => {
      if (cell.isMine && !cell.isFlagged) {
        cell.isFlagged = true
      }
    })
    flagCount.value = totalMines.value
  }

  // 智能提示 - 直接从数据中找一个未标记的雷并标记
  function hintCertainMine() {
    const result = findCertainMine(board.value, rows.value, cols.value)
    if (result !== null) {
      const cell = board.value[result.index]

      if (result.type === 'mine' && !cell.isFlagged) {
        // 标记为雷
        cell.isFlagged = true
        flagCount.value++
        return true
      } else if (result.type === 'safe' && !cell.isRevealed && !cell.isFlagged) {
        // 自动揭开安全格子
        revealCell(result.index)
        return true
      }
    }
    return false
  }

  // 双击已揭开的数字格 - 快速操作
  function quickAction(index) {
    const cell = board.value[index]
    if (!cell.isRevealed || cell.neighborMines === 0) return

    const neighbors = getNeighborIndices(index, rows.value, cols.value)
    const flaggedNeighbors = neighbors.filter(n => board.value[n].isFlagged)

    // 如果旗帜数等于数字，揭开周围未插旗的格子
    if (flaggedNeighbors.length === cell.neighborMines) {
      neighbors.forEach(n => {
        if (!board.value[n].isRevealed && !board.value[n].isFlagged) {
          revealCell(n)
        }
      })
    }
  }

  // 初始化
  initEmptyBoard()

  return {
    // 状态
    board,
    gameState,
    difficulty,
    timer,
    flagCount,
    rows,
    cols,
    totalMines,
    remainingMines,
    NUMBER_COLORS,
    // 方法
    resetGame,
    revealCell,
    toggleFlag,
    quickAction,
    hintCertainMine
  }
}
