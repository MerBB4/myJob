# 考编笔记系统 — 设计文档

> 2026-06-02 · 版本 v1

## 一、项目概述

面向考编备考的本地笔记系统。核心能力：从视频截图自动提取知识 → 结构化存储 → 横向知识图谱展示 → AI 辅助复习。

## 二、核心功能

### 2.1 知识图谱（核心）

横向 4 层递进展开：

```
章节 → 知识名词 → 考点/出题方式 → 真题例题
```

- 左侧选择学科/章节
- 中间横向滚动展示 4 层卡片
- 点击任意节点展开详情

### 2.2 双路径录入

**路径一：手动录入**
- 选章节 → 填表单（动态字段，可增删）
- 适合有提纲时快速记录

**路径二：OCR + AI 校验**
- 拖入/粘贴视频截图
- OCR 自动提取文字
- AI 校验错别字 + 补充考点
- 用户确认/修改后保存

### 2.3 动态字段（7 类）

每个知识点可包含以下字段，全部可动态增减：

| 字段 | 类型 | 说明 |
|------|------|------|
| 知识点名称 | 文本 | 必填 |
| 核心口诀 | 文本 | 一句话记忆法 |
| 详细解释 | 富文本 | 展开说明 |
| 辨析/分类 | 列表 | "时间区分 / 比字区分" 等 |
| 公式列表 | 公式块 | 每个考点可能有 0~N 个公式 |
| 思维导图 | 图片 | 截图或手绘导图 |
| 例题列表 | 图片+标注 | 真题截图，可标注正确答案 |

### 2.4 AI 双通道

| 通道 | 实现 | 场景 |
|------|------|------|
| API Key 模式 | 配置第三方 API Key | OCR 自动校验、补充考点 |
| 终端模式 | xterm.js 内嵌 CMD | Claude Code 深度分析、批量处理 |

### 2.5 复习模式

- 图谱模式：横向展开 4 层关联
- 列表模式：传统笔记列表
- 刷题模式：随机抽取真题练习

## 三、UI 设计

### 3.1 整体布局

**三栏布局（A 方案）**：
- 左栏 (190px)：学科导航 + 快捷入口
- 中栏 (flex-1)：知识图谱主区域（图谱/列表/刷题 切换）
- 右栏 (260px)：AI 助手 / 内嵌终端（可切换）

### 3.2 视觉风格

**Notion 风格（方案 3）**：
- 白底 + 细线分隔
- 顶部信息条（学科 + 统计）
- 彩色小圆点区分层级：
  - 灰色 `#475569` — 容器/结构
  - 深蓝 `#0369a1` — 知识名词
  - 深金 `#a16207` — 考点
  - 深红 `#b91c1c` — 真题
- 组件库：shadcn/ui (Tailwind CSS)

## 四、技术架构

### 4.1 技术栈

```
前端：Next.js 14 (App Router) + TypeScript
UI：  shadcn/ui + Tailwind CSS
状态：Zustand + React Query
终端：xterm.js + node-pty (WebSocket)
ORM： Prisma
数据库：MySQL 5.7.35 (本地)
图片：sharp
```

### 4.2 项目结构（规划）

```
exam-note/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 三栏布局
│   ├── page.tsx            # 知识图谱主页
│   ├── api/
│   │   ├── chapters/       # 章节 CRUD
│   │   ├── knowledge/      # 知识点 CRUD
│   │   ├── exams/          # 真题 CRUD
│   │   ├── ocr/            # OCR 识别接口
│   │   └── terminal/       # WebSocket 终端
│   └── settings/           # 设置页
├── components/
│   ├── layout/             # 三栏布局组件
│   ├── knowledge-graph/    # 知识图谱组件
│   ├── input-form/         # 动态表单组件
│   ├── ocr-panel/          # OCR 录入面板
│   ├── ai-chat/            # AI 对话面板
│   ├── terminal/           # xterm.js 终端面板
│   └── ui/                 # shadcn/ui 组件
├── lib/
│   ├── db.ts               # Prisma 客户端
│   ├── ocr.ts              # OCR 服务
│   ├── ai.ts               # AI API 调用
│   └── terminal.ts         # node-pty 管理
├── prisma/
│   └── schema.prisma       # 数据库模型
└── .env                    # 数据库连接、API Keys
```

### 4.3 数据库模型（初版）

```prisma
model Subject {
  id        Int       @id @default(autoincrement())
  name      String                    // 学科名：行政法、刑法...
  chapters  Chapter[]
  createdAt DateTime  @default(now())
}

model Chapter {
  id          Int       @id @default(autoincrement())
  subjectId   Int
  subject     Subject   @relation(fields: [subjectId], references: [id])
  title       String                    // 章节标题
  order       Int                       // 排序
  knowledge   Knowledge[]
  createdAt   DateTime  @default(now())
}

model Knowledge {
  id          Int       @id @default(autoincrement())
  chapterId   Int
  chapter     Chapter   @relation(fields: [chapterId], references: [id])
  name        String                    // 知识点名称
  mnemonic    String?                   // 核心口诀
  detail      String?   @db.Text       // 详细解释（富文本）
  distinctions Json?                   // 辨析分类 [{title, content}]
  formulas    Json?                    // 公式列表 [{name, formula}]
  mindMap     String?                   // 思维导图图片路径
  createdAt   DateTime  @default(now())
}

model ExamQuestion {
  id          Int       @id @default(autoincrement())
  knowledgeId Int
  knowledge   Knowledge @relation(fields: [knowledgeId], references: [id])
  type        String                    // 单选/多选/判断
  image       String                    // 真题截图路径
  answer      String?                   // 正确答案
  analysis    String?   @db.Text       // 解析
  createdAt   DateTime  @default(now())
}

model ExamPoint {
  id          Int       @id @default(autoincrement())
  knowledgeId Int
  knowledge   Knowledge @relation(fields: [knowledgeId], references: [id])
  description String                    // 考点描述
  category    String?                   // 考点分类：辨析类/层级类/程序类...
  examQuestions ExamQuestion[]         // 关联真题
  createdAt   DateTime  @default(now())
}
```

## 五、关键交互流程

### 5.1 OCR 录入流程

```
用户截图/拖入图片 → 前端预览
  → POST /api/ocr (图片) → OCR 识别 → 返回文本
  → AI 校验（API 或终端 Claude Code）→ 修正错别字 + 补充考点
  → 前端展示校对结果（颜色区分 OCR 原文 vs AI 修正）
  → 用户确认或手动修改
  → POST /api/knowledge → 写入 MySQL
```

**OCR vs AI 颜色标注规范：**

| 标记 | 颜色 | 含义 | 示例 |
|------|------|------|------|
| 默认文本 | 黑色/深灰 | OCR 原始识别，未改动 | 行政处罚的 |
| 删除线 + 红色 | `#ef4444` 红 + 删除线 | OCR 识别错误，AI 建议删除 | ~~种关~~ |
| 下划线 + 绿色 | `#16a34a` 绿 + 下划线 | AI 修正后的文字 | <ins>种类</ins> |
| 左侧绿色边框 | `#16a34a` 浅绿背景 | AI 补充的内容（OCR 没有的） | 💡 常见混淆：... |

**交互规则：**
- 用户可点击每一处 AI 修改 → 弹出「接受 / 拒绝 / 自行编辑」
- 用户可批量「全部接受」或「全部拒绝」
- 最终保存的是用户确认后的版本，非 AI 直接覆盖

### 5.2 终端集成流程

```
用户点击"打开终端"
  → 前端建立 WebSocket 连接
  → 后端 node-pty 生成 Windows CMD 进程
  → xterm.js 渲染终端界面
  → 用户键入 claude → 启动 Claude Code
  → Claude Code 可读写项目所有文件
```

## 六、非功能需求

- **本地优先**：所有数据存本地 MySQL，不依赖云服务
- **离线可用**：除 AI 调用外，核心功能无需网络
- **TypeScript 严格模式**：全栈类型安全
- **80%+ 测试覆盖**：TDD 流程

## 七、待定事项

- **OCR 引擎**：本地 Tesseract.js（chi_sim 中文），配合 AI 二次校验兜底，无需云端 OCR 的额外费用和网络依赖
- **视频截图**：用户自行截图保存本地 → 上传导入（拖拽/粘贴）
- **暂不实现**：背诵记忆曲线、PDF 导出/打印（后续版本评估）
