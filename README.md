# 元素周期表查询应用 (PTable)

一个基于 Electron + React + TypeScript 的桌面应用程序，用于快速查询化学元素信息。

## 功能特性

- 🔍 **双向搜索**: 支持中文名称、英文名称、元素符号的双向查询
- 🎯 **实时搜索**: 输入时实时显示匹配结果
- 📱 **系统托盘**: 最小化到系统托盘，随时可用
- ⚙️ **个性化设置**: 可配置显示选项、快捷键等
- 🎨 **现代界面**: 基于 Tailwind CSS 的现代化界面设计
- 📊 **完整数据**: 包含118个化学元素的详细信息

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: React Hooks

## 开发环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd ptable
```

### 2. 安装依赖
```bash
npm install
```

### 3. 开发模式运行

#### 仅运行 React 应用（浏览器模式）
```bash
npm run dev
```
然后在浏览器中访问 http://localhost:3000

#### 运行 Electron 应用（桌面模式）
```bash
npm run electron-dev
```

### 4. 构建生产版本
```bash
npm run build
npm run electron-build
```

## 项目结构

```
ptable/
├── src/                    # React 源代码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义 Hooks
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型定义
│   ├── data/              # 元素数据
│   └── index.css          # 全局样式
├── electron/              # Electron 主进程代码
│   ├── main.js           # 主进程入口
│   └── preload.js        # 预加载脚本
├── public/               # 静态资源
├── dist/                 # 构建输出目录
└── assets/               # 应用资源（图标等）
```

## 使用说明

### 基本搜索
1. 在搜索框中输入元素名称、符号或原子序数
2. 系统会实时显示匹配的元素信息
3. 点击复制按钮可将结果复制到剪贴板

### 系统托盘功能
- 点击最小化按钮将应用最小化到系统托盘
- 双击托盘图标重新显示应用窗口
- 右键托盘图标显示上下文菜单

### 设置配置
- 点击设置按钮进入设置页面
- 可配置启动选项、显示选项、快捷键等
- 设置会自动保存到本地存储

## 支持的搜索方式

- **中文名称**: 氢、氦、锂、铍...
- **英文名称**: Hydrogen, Helium, Lithium, Beryllium...
- **元素符号**: H, He, Li, Be...
- **拉丁名称**: Hydrogenium, Helium, Lithium...
- **原子序数**: 1, 2, 3, 4...

## 元素信息包含

- 原子序数
- 元素符号
- 中文名称
- 英文名称
- 拉丁名称
- 原子量
- 元素类别
- 周期和族

## 开发说明

### 添加新元素
编辑 `src/data/elements.json` 文件，按照现有格式添加新的元素数据。

### 修改样式
项目使用 Tailwind CSS，可以直接在组件中使用 Tailwind 类名，或在 `src/index.css` 中添加自定义样式。

### 扩展功能
- 在 `src/components/` 中添加新组件
- 在 `src/utils/` 中添加工具函数
- 在 `src/types/` 中定义新的 TypeScript 类型

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的元素搜索功能
- 系统托盘集成
- 设置页面
- 包含常用化学元素数据