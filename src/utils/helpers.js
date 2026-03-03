import { DIFFICULTY } from '../constants/game.js'

/**
 * 将一维索引转换为行列坐标
 */
export function indexToRowCol(index, cols) {
  return {
    row: Math.floor(index / cols),
    col: index % cols
  }
}

/**
 * 将行列坐标转换为一维索引
 */
export function rowColToIndex(row, col, cols) {
  return row * cols + col
}

/**
 * 获取周围 8 个格子的索引
 */
export function getNeighborIndices(index, rows, cols) {
  const { row, col } = indexToRowCol(index, cols)
  const neighbors = []

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue

      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push(rowColToIndex(nr, nc, cols))
      }
    }
  }

  return neighbors
}

/**
 * 获取需要排除的格子（首次点击位置 + 周围 8 格）
 * 确保首次点击不仅不是雷，而且能打开一片区域
 */
export function getExcludedCells(index, rows, cols) {
  const excluded = new Set([index])
  const neighbors = getNeighborIndices(index, rows, cols)
  neighbors.forEach(n => excluded.add(n))
  return excluded
}

/**
 * 数组随机打乱（Fisher-Yates 洗牌算法）
 */
export function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 生成地雷位置 - 排除首次点击的格子及其邻居
 * 并保证局面有逻辑解（不需要猜测）
 */
export function placeMines(rows, cols, mineCount, firstClickIndex) {
  const excluded = getExcludedCells(firstClickIndex, rows, cols)
  const available = []

  // 收集所有可放置雷的位置
  for (let i = 0; i < rows * cols; i++) {
    if (!excluded.has(i)) {
      available.push(i)
    }
  }

  // 尝试最多 50 次，找到一个有逻辑解的布雷方案
  for (let attempt = 0; attempt < 50; attempt++) {
    const minePositionsSet = new Set(shuffle(available).slice(0, mineCount))

    // 创建临时 board 验证可解性
    const board = createBoard(rows, cols, minePositionsSet)

    // 模拟揭示首次点击区域
    const revealed = new Set()
    floodFillRevealSimulated(board, firstClickIndex, rows, cols, revealed)

    // 检查是否有逻辑解（不需要猜测）
    if (isSolvable(board, rows, cols, revealed, minePositionsSet)) {
      return minePositionsSet
    }
  }

  // 如果 50 次都没找到，返回一个随机布局（至少有首次点击保护）
  return new Set(shuffle(available).slice(0, mineCount))
}

/**
 * 创建临时 board 用于验证
 */
function createBoard(rows, cols, minePositions) {
  const board = []
  for (let i = 0; i < rows * cols; i++) {
    board.push({
      isMine: minePositions.has(i),
      neighborMines: 0
    })
  }

  // 计算每个格子的邻居雷数
  for (let i = 0; i < rows * cols; i++) {
    if (minePositions.has(i)) continue
    const neighbors = getNeighborIndices(i, rows, cols)
    for (const n of neighbors) {
      if (minePositions.has(n)) {
        board[i].neighborMines++
      }
    }
  }

  return board
}

/**
 * 模拟揭示（不修改原 board）
 */
function floodFillRevealSimulated(board, startIndex, rows, cols, revealed) {
  const stack = [startIndex]

  while (stack.length > 0) {
    const idx = stack.pop()
    if (revealed.has(idx)) continue

    const cell = board[idx]
    if (cell.isMine) continue

    revealed.add(idx)

    // 如果是空白格（0），继续展开
    if (cell.neighborMines === 0) {
      const neighbors = getNeighborIndices(idx, rows, cols)
      for (const n of neighbors) {
        if (!revealed.has(n)) {
          stack.push(n)
        }
      }
    }
  }
}

/**
 * 检查局面是否有逻辑解（不需要猜测）
 */
function isSolvable(board, rows, cols, revealed, minePositions) {
  const flagged = new Set()
  const solved = new Set(revealed)
  const totalSafe = rows * cols - minePositions.size

  // 模拟玩家推理过程，看能否解开所有格子
  while (true) {
    let madeProgress = false

    // 检查每个已揭示的数字格
    for (let i = 0; i < board.length; i++) {
      const cell = board[i]
      if (!revealed.has(i) || cell.neighborMines === 0) continue

      const neighbors = getNeighborIndices(i, rows, cols)
      const hiddenNeighbors = neighbors.filter(n => !solved.has(n) && !flagged.has(n))
      const flaggedNeighbors = neighbors.filter(n => flagged.has(n))
      const remainingMines = cell.neighborMines - flaggedNeighbors.length

      // 推理 1: 剩余隐藏格 = 剩余雷数 → 都是雷
      if (hiddenNeighbors.length === remainingMines && remainingMines > 0) {
        for (const n of hiddenNeighbors) {
          if (!flagged.has(n)) {
            flagged.add(n)
            madeProgress = true
          }
        }
      }

      // 推理 2: 剩余雷数 = 0 → 都是安全的
      if (remainingMines === 0 && hiddenNeighbors.length > 0) {
        for (const n of hiddenNeighbors) {
          if (!solved.has(n)) {
            solved.add(n)
            madeProgress = true
          }
        }
      }
    }

    // 检查是否完成
    if (solved.size >= totalSafe) {
      return true
    }

    // 如果没有进展，说明卡住了
    if (!madeProgress) {
      return false
    }
  }
}

/**
 * 计算每个格子周围的雷数
 */
export function calculateNeighborMines(board, rows, cols, minePositions) {
  for (let i = 0; i < rows * cols; i++) {
    if (minePositions.has(i)) {
      board[i].isMine = true
      continue
    }

    const neighbors = getNeighborIndices(i, rows, cols)
    board[i].neighborMines = neighbors.reduce((count, idx) => {
      return count + (minePositions.has(idx) ? 1 : 0)
    }, 0)
  }
}

/**
 * 洪水填充算法 - 递归揭开空白区域
 */
export function floodFillReveal(board, index, rows, cols) {
  const stack = [index]
  const revealed = new Set()

  while (stack.length > 0) {
    const current = stack.pop()
    if (revealed.has(current)) continue
    if (board[current].isRevealed || board[current].isFlagged) continue

    board[current].isRevealed = true
    revealed.add(current)

    // 如果是空白格（周围无雷），继续展开
    if (board[current].neighborMines === 0) {
      const neighbors = getNeighborIndices(current, rows, cols)
      neighbors.forEach(n => {
        if (!board[n].isRevealed && !board[n].isFlagged) {
          stack.push(n)
        }
      })
    }
  }

  return revealed
}

/**
 * 检查是否胜利：所有非雷格子都被揭开
 */
export function checkWin(board) {
  return board.every(cell => cell.isMine || cell.isRevealed)
}

/**
 * 智能提示算法 - 优先在已揭开的数字格周围找雷
 * 返回：{ index, type: 'mine' | 'safe' } 或 null
 */
export function findCertainMine(board, rows, cols) {
  // 第一步：遍历所有已揭开的数字格，在它们的邻居中找未标记的雷
  for (let i = 0; i < board.length; i++) {
    const cell = board[i]
    // 只检查已揭开的数字格
    if (!cell.isRevealed || cell.neighborMines === 0) continue

    // 获取周围 8 个格子
    const neighbors = getNeighborIndices(i, rows, cols)

    // 在邻居中找未标记的雷
    for (const idx of neighbors) {
      const neighbor = board[idx]
      if (neighbor.isMine && !neighbor.isFlagged && !neighbor.isRevealed) {
        return { index: idx, type: 'mine' }
      }
    }
  }

  // 第二步：如果数字格周围没有可标记的雷，找一个未揭开的非雷格子
  for (let i = 0; i < board.length; i++) {
    const cell = board[i]
    if (!cell.isMine && !cell.isRevealed && !cell.isFlagged) {
      return { index: i, type: 'safe' }
    }
  }

  return null
}
