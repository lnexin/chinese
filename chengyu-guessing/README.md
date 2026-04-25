# 成语猜词助手

一个基于 Vite 的前端小工具，用拼音字母和声调线索快速过滤四字成语词库。

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:3000`

`npm run dev` 会同时启动前端 Vite 和后端识别 API。前端请求 `/api/recognize`，Vite 会代理到后端。

## 自动识别 API 配置

OpenAI 兼容接口在后端配置，不会暴露到前端页面或浏览器包里。默认配置位于 `server/ai-config.js`，也可以通过环境变量覆盖：

```bash
OPENAI_API_HOST=http://127.0.0.1:23333
OPENAI_API_PATH=/v1/chat/completions
OPENAI_API_KEY=cs-sk-...
OPENAI_MODEL=gpt-5.4
API_PORT=3003
```

后端会使用 Chat Completions 多模态格式调用 `/v1/chat/completions`，前端只负责上传图片并接收筛选条件。

## 生产构建

```bash
npm run build
npm run preview
```

## 项目结构

- `index.html`：Vite 入口页面
- `src/main.js`：应用启动、事件绑定、初始化
- `src/lib/template.js`：页面模板和 DOM 绑定
- `src/lib/pinyin.js`：拼音拆分、声调归一化、词库预处理
- `src/lib/search.js`：输入清洗、索引建立、候选打分和排序
- `src/lib/render.js`：结果渲染和高亮逻辑
- `src/styles.css`：页面样式
- `data/idiom.json`：成语词库，作为静态资源公开访问

## 筛选规则

页面共有 9 个输入框：

- 第 1 行 1 个输入框：匹配四个字任意一个拼音里包含的字母片段
- 第 2 行 4 个输入框：分别对应第 1 到第 4 个字的声调，支持 `0-4`，其中 `0` 表示轻声
- 第 3 行 4 个输入框：分别对应第 1 到第 4 个字拼音中包含的字母片段

结果排序规则：

- 采用“命中字段越多越靠前”
- 若分数相同，则按成语字面顺序排序
- 当前最多展示前 `200` 条候选，状态栏会显示总候选数

## 数据说明

- 词库文件使用 `data/idiom.json`
- 开发和构建时由 Vite 直接作为静态资源提供，前端通过 `/idiom.json` 读取
