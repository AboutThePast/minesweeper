# 扫雷 (Minesweeper)

基于 Vue 3 + Vite + Tailwind CSS v4 的扫雷游戏。

## 在线访问

http://localhost/minesweeper/

## 功能特性

- **三种难度模式**：初级 (9×9, 10 雷)、中级 (16×16, 40 雷)、高级 (30×16, 99 雷)
- **首次点击安全**：延迟布雷算法，确保首次点击不会触雷
- **可解性保证**：布雷后验证局面有逻辑解，无需猜测
- **智能提示**：直接标记一个未标记的雷（优先在已揭开数字格周围查找）
- **触摸板友好**：支持多种标记方式（右键、长按 500ms、旗帜模式切换）
- **响应式布局**：全屏应用式设计，适配不同屏幕尺寸

## 技术栈

- Vue 3.5+ (Composition API)
- Vite 6
- Tailwind CSS v4

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 操作说明

| 操作 | 说明 |
|------|------|
| 左键点击 | 揭开格子 |
| 右键点击 | 标记/取消旗帜 |
| 双击数字格 | 快速揭开周围格子（当旗帜数等于数字时） |
| 长按 500ms | 标记/取消旗帜（触摸板友好） |
| 旗帜模式 | 开启后点击格子直接标记旗帜 |

## 部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name localhost;

    root /path/to/your/www;  # 修改为你的网站根目录
    index index.html;

    location /minesweeper {
        location = /minesweeper {
            return 302 /minesweeper/;
        }
        location ~ ^/minesweeper/(.*)$ {
            try_files /minesweeper/$1 /minesweeper/index.html;
        }
    }
}
```

### 部署步骤

```bash
# 构建
npm run build

# 复制 dist 目录到你的网站根目录
cp -r dist/* /path/to/your/www/minesweeper/

# 重启 Nginx
brew services restart nginx
```

## 项目结构

```
src/
├── App.vue              # 主应用组件
├── main.js              # 入口文件
├── components/
│   ├── Cell.vue         # 格子组件
│   ├── GameBoard.vue    # 游戏面板
│   ├── GameHeader.vue   # 顶部控制栏
│   └── GameModal.vue    # 游戏结束弹窗
├── composables/
│   └── useMinesweeper.js  # 游戏核心逻辑
├── constants/
│   └── game.js          # 难度配置和颜色映射
└── utils/
    └── helpers.js       # 工具函数（布雷、洪水填充等）
```

## License

MIT
