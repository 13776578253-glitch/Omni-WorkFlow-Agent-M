# 后端真实数据替换五步执行文档计划

## 1. 背景与现状

当前后端已经完成了基于前端接口文档的 mock-first 对齐，`/api` 下的 `auth`、`user/preferences`、`history`、`portal`、`workflow` 接口都已具备可联调的 HTTP 契约与统一响应格式：

- 成功：`{ code: "0", message: "ok", data: ... }`
- 失败：`{ code: "ERR_xxx", message: "...", data: null, details? }`

现阶段的核心问题不是“接口缺失”，而是“业务数据仍主要依赖 `mock_store`”，导致：

- 服务重启后 mock 数据不可持续积累
- 文件、音频、长任务等资源只存在于进程内内存
- 历史、工作流、门户月历等数据无法真正持久化
- 现有数据库底座没有接入当前已对齐完成的新接口

当前仓库已经具备一部分真实链路基础：

- 已存在 `Postgres + SQLAlchemy async` 连接能力
- 已存在 `users`、`user_preferences`、`conversations`、`messages`、`files`、`tasks` 模型
- 已存在基础的 `docker-compose` 本地数据库环境

但这些真实数据库能力还没有纳入当前 `/api` 接口主链路，当前 router 仍然直接依赖 `mock_store`。

因此，本次迁移目标不是推翻重做，而是在不改变前端契约的前提下，将当前 mock-first 后端拆成 5 个可逐步验收的阶段，逐段把真实数据链路接进去。

---

## 2. 总体原则

### 2.1 总体目标

将当前 mock-first 后端逐步替换为真实持久化链路，最终达到：

- 用户、偏好配置、历史会话、工作流、门户日历、任务状态可持久化
- 前端接口契约保持不变
- 每一步都有独立可验收结果
- 每一步失败都可以停留在当前阶段，不影响下一阶段计划

### 2.2 执行原则

- 不做一次性大规模重构
- 按模块逐步切流，不跨多步同时推进
- 每一步都以“接口不变、内部替换”为准
- 未通过当前步验收前，不进入下一步
- 当前阶段优先保证“可联调、可验证、可回退”

### 2.3 数据源策略

迁移期内部引入统一的数据源策略配置，按模块控制读取与写入来源：

- `mock_only`
- `db_preferred_with_mock_fallback`
- `db_only`

迁移顺序固定为：

1. `auth + preferences`
2. `history`
3. `workflow`
4. `portal`
5. `file/audio/task metadata`

### 2.4 当前明确边界

- 当前不做“大重构一次性完成”
- 当前不优先做真实文件内容存储
- 当前不优先做真实音频转写引擎
- 当前不改变前端接口契约
- 当前优先做真实数据库与状态持久化

---

## 3. 五步执行计划

### 第 1 步：打底，不切业务数据源

#### 目标

先把“未来能逐步切流”的基础设施补齐，但不替换现有 mock 行为。

#### 实施内容

- 收口配置来源：
  - 数据库连接字符串改为环境变量读取
  - 第三方密钥改为环境变量读取
  - 清理应用内硬编码敏感信息
- 保持本地开发数据库仍使用现有 `docker-compose` 中的 Postgres
- 增加统一的数据源策略配置：
  - 支持 `mock_only`
  - 支持 `db_preferred_with_mock_fallback`
  - 支持 `db_only`
- 在后端内部准备 service/repository 入口
- 当前 router 的对外接口契约不改
- 当前 router 仍允许继续走 mock 逻辑

#### 本步不做

- 不切换任何业务接口到真实数据库
- 不修改现有前端请求结构
- 不修改现有对外响应 JSON 结构

#### 验收标准

- 应用仍可在 `mock_only` 正常启动
- 现有 `phase3 / phase4 / phase5` API 测试不回退
- 配置来源改造完成，计划文档已落库

---

### 第 2 步：切 `auth + preferences`

#### 目标

先把最接近现有数据库模型的部分切到真实 DB。

#### 实施内容

- 使用现有 `users`、`user_preferences` 表承接真实读写
- 将以下接口切到数据库优先模式：
  - `POST /api/auth/code/send`
  - `POST /api/auth/login_1`
  - `POST /api/auth/login_2`
  - `POST /api/auth/register`
  - `POST /api/auth/password/reset`
  - `POST /api/auth/logout`
  - `GET /api/user/preferences`
  - `POST /api/user/preferences`
- 保留验证码发送的 mock/内存实现，不强制落库
- 增加数据库实体到接口 payload 的映射层
- 模块默认模式切为 `db_preferred_with_mock_fallback`

#### 必须锁定的字段映射

- `phone -> users.phone_number`
- `password -> users.password_hash`
- `name -> users.name`
- `presetMode -> user_preferences.preset_mode`
- `presetPrompts.custom -> preset_custom`
- `presetPrompts.concise -> preset_concise`
- `presetPrompts.formal -> preset_formal`
- `quickActionNames.solt1..4 -> quick_name_solt1..4`
- `quickActionPrompts.solt1..4 -> quick_prompt_solt1..4`
- `memoryContent -> memory_content`

#### 本步不做

- 不切 `history`
- 不切 `workflow`
- 不切 `portal`
- 不接真实文件和音频处理

#### 验收标准

- 6 个 auth 接口 + 2 个 preferences 接口在 DB 模式可跑通
- 注册后自动创建 preferences
- 重置密码后旧密码失效、新密码生效
- 对外响应 JSON 完全保持现状

---

### 第 3 步：切 `history`

#### 目标

把历史会话摘要从 mock 切到真实持久化。

#### 实施内容

- 使用 `conversations` 作为 history 主表
- 对 `conversations` 做最小 schema 扩展：
  - `is_pinned`
  - `preview_text`
- `history.id` 继续等于 `conversation.id`
- 对外仍统一返回字符串形式的 `id`
- 将以下接口切到真实 DB：
  - `GET /api/history/sessions`
  - `POST /api/history/sessions`
  - `DELETE /api/history/sessions/{sessionId}`
  - `PUT /api/history/sessions/{sessionId}/title`
  - `PUT /api/history/sessions/{sessionId}/pin`
- 删除 history 时继续联动删除该会话的：
  - workflow/message
  - file metadata
  - task metadata
- 保留 mock fallback，但默认切到 `db_preferred_with_mock_fallback`

#### 本步不做

- 不切 workflow blocks 持久化
- 不切 portal
- 不做真实文件内容存储

#### 验收标准

- history 5 个接口在 DB 模式可跑通
- 创建后刷新列表仍能读到
- 重命名、置顶、删除都能真实持久化
- 删除后对应 workflow 数据也一并不可读

---

### 第 4 步：切 `workflow`

#### 目标

把会话详情和核心 block 数据切到真实 DB，但先不引入真实文件存储和真实音频引擎。

#### 实施内容

- 使用 `messages` 承接 workflow blocks
- 对 `messages` 做最小扩展：
  - `client_block_id`
  - `source_block_id`
  - `status`
  - `block_meta JSONB`
- `GET /api/workflow/sessions/{sessionId}` 通过：
  - `conversations`
  - `messages`
  - `files metadata`
  聚合返回
- `POST /api/workflow/input`：
  - 先写 user block
  - 再写 mock 或现有生成逻辑产生的 ai block
  - 同步刷新 `conversation.preview_text`
  - 同步刷新 `conversation.updated_at`
- `POST /api/workflow/generate`：
  - 写一条新的 ai block
- 长音频完成后写回 session 的逻辑改成真实 DB 写入
- 第一阶段允许 AI 内容继续 mock 或沿用当前函数层，不要求真实 LLM 全接通

#### 优先切换的 workflow 接口

- `GET /api/workflow/sessions/{sessionId}`
- `POST /api/workflow/input`
- `POST /api/workflow/generate`
- `POST /api/workflow/audio/long-form`
- `GET /api/workflow/audio/tasks/{taskId}`

#### 本步不做

- 不要求真实文件内容落盘
- 不要求真实音频可回放
- 不要求真实转写引擎接入

#### 验收标准

- 上述 5 个 workflow 核心接口在 DB 模式可跑通
- 前端刷新后 workflow blocks 不丢
- history 与 workflow 的 `sessionId` 继续完全打通

---

### 第 5 步：切 `portal + 文件/音频元数据`

#### 目标

补齐剩余没有真实承接表的部分，完成“业务数据真实化第一阶段”。

#### 实施内容

- 为 portal 新增专用表，例如 `portal_day_entries`
  - `user_id`
  - `year`
  - `month`
  - `day`
  - `payload JSONB`
- 将以下接口切到真实 DB：
  - `GET /api/portal/calendar`
  - `POST /api/portal/day`
  - `DELETE /api/portal/day`
- 文件上传、音频上传第一阶段只做：
  - 解析 multipart
  - 生成资源 id
  - 元数据入库
  - 返回稳定 `fileRef / remoteAudioId`
- 不要求文件内容真实落盘
- 不要求音频真实可回放
- 长任务状态从内存改到 `tasks` 表记录
- `POST /api/workflow/audio/transcript` 第一阶段仍可返回 mock 文本
- 但 transcript 请求和结果摘要应可落库

#### 本步不做

- 不做对象存储接入
- 不做真实音频识别引擎
- 不做离线任务系统

#### 验收标准

- portal 3 个接口在 DB 模式可跑通
- workflow file/audio/task 元数据能真实持久化
- 长任务轮询状态来自 DB，而不是进程内内存
- 现有前端联调路径不变

---

## 4. 当前状态追踪

### 已完成

- 基于前端接口文档完成 mock-first 接口对齐
- `/api` 前缀已统一
- 统一响应包装已落地
- `auth`、`user/preferences`、`history`、`portal`、`workflow` 接口均已可联调
- `workflow` 长音频轮询 mock 状态机已打通
- phase3 / phase4 / phase5 测试已存在
- 第 1 步已完成基础配置收口与数据源策略入口准备

### 当前真实链路底座现状

- 已有 Postgres docker 环境
- 已有 SQLAlchemy async 连接
- 已有数据库模型：
  - `users`
  - `user_preferences`
  - `conversations`
  - `messages`
  - `files`
  - `tasks`
- 当前 router 仍然直接依赖 `mock_store`

### 当前主要缺口

- 配置项仍有硬编码
- 数据源切换机制未建立
- 真实 DB 仓储层不足以承接当前已对齐接口
- `history / workflow / portal / file/audio/task` 未切到真实持久化

---

## 5. 每步验收记录

> 使用方式：每完成一步，在对应小节中记录验收日期、验收结果、阻塞点和是否允许进入下一步。

### Step 1 验收记录

- 状态：已完成，待你验收
- 验收日期：2026-04-07
- 验收人：
- 验收结果：
- 备注：
  - 配置已改为环境变量优先读取，保留现有默认值，避免当前联调环境回退
  - 新增 `.env.example`，明确数据库与模块级数据源策略配置项
  - 已增加模块级数据源策略入口，当前默认仍为 `mock_only`
  - 应用启动时会记录各模块当前数据源策略，便于后续逐段切流

### Step 2 验收记录

- 状态：进行中
- 验收日期：
- 验收人：
- 验收结果：
- 备注：
  - `auth_router` 与 `user_router` 已切到统一 service 入口
  - 当前默认数据源策略仍为 `mock_only`，所以现有联调行为不变
  - 已预留 `auth/preferences` 的 DB 优先路径与 mock fallback 逻辑
  - 已补 `auth + preferences` 的数据库初始化工具与 DB 模式测试文件
  - 当前机器未检测到可用 Postgres，DB 模式测试会明确跳过而不是伪通过

### Step 3 验收记录

- 状态：未开始
- 验收日期：
- 验收人：
- 验收结果：
- 备注：

### Step 4 验收记录

- 状态：未开始
- 验收日期：
- 验收人：
- 验收结果：
- 备注：

### Step 5 验收记录

- 状态：未开始
- 验收日期：
- 验收人：
- 验收结果：
- 备注：

---

## 附：统一测试要求

每一步都必须满足以下测试约束：

- 保留现有 `phase3 / phase4 / phase5` API 回归测试
- 从第 2 步开始，每一步新增对应 DB 模式测试集
- 每一步至少覆盖：
  - 正常路径
  - 关键错误路径
  - 重启服务后的持久化验证

五步全部完成后，需要补一轮全链路冒烟：

1. 注册
2. 登录
3. 保存 preferences
4. 创建 history
5. workflow input/generate
6. portal 写入并读取
7. 上传 file/audio 元数据
8. 长任务轮询并回写 session
