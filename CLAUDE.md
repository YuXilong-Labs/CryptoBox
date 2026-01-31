# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CryptoBox（密码工具箱）— 纯前端加解密工具集，30+ 算法，浏览器本地计算，无后端依赖。
线上地址：https://yuxilong-labs.github.io/CryptoBox/

## Tech Stack

- Vue 3 (Composition API, `<script setup>`) + Vue Router 4 (hash mode) + Pinia
- Vite 5 构建，Tailwind CSS 4 样式
- crypto-js 加密库，highlight.js 代码高亮
- 部署到 GitHub Pages，Vite base path: `/CryptoBox/`

## Development Commands

```bash
cd vue-app
npm install
npm run dev        # 启动开发服务器
npm run build      # 生产构建到 dist/
npm run preview    # 预览构建产物
```

无 ESLint/Prettier/外部测试框架。浏览器内置 27+ 单元测试，控制台执行 `runAllTests()`。

## Architecture

主代码在 `vue-app/src/` 下：

- **main.js** — 路由定义（19 条路由）和应用初始化
- **pages/** — 每个加密算法/工具一个页面组件（`FeaturePage.vue`）
- **components/** — 复用组件：IOPanel（输入输出双面板，所有加密页面共用）、CopyBtn、PillGroup、JsonTree、CodeHighlight、CodeEditor
- **composables/** — useHistory（localStorage 历史记录，50 条上限）、useJsonToCode（JSON 转 13 种语言代码）
- **assets/main.css** — 全局样式、CSS 变量（暗色主题）、设计 tokens

## Code Conventions

- 页面命名：`XxxPage.vue`，组件命名：`XxxName.vue`，路由路径：kebab-case
- 组合式函数：`useXxx.js`
- UI 文案使用中文，代码注释中英混用
- 暗色主题为默认，通过 CSS 变量控制
- Tailwind 工具类为主，不使用 scoped CSS
