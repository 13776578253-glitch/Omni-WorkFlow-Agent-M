# 接口文档 V2

### 核心文件与功能划分
| 功能模块 | 文件路径 | 核心说明 |
|----------|----------|----------|
| 认证总入口 | [auth.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/user/auth.tsx) | 通过 `authMode` 切换 login/register/forgot，使用 `AsyncStorage` 持久化认证状态 |
| 登录表单 | [login.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/login.tsx) | 支持 phone+code / nickname+code 两种登录方式；提交 payload：`{ variant, phone, nickname, code }` |
| 注册表单 | [register.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/register.tsx) | 提交 payload：`{ nickname, password, phone, code }` |
| 忘记密码 | [forgot.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/forgot.tsx) | 两步式 UI（校验验证码→重置密码）；最终提交 payload：`{ phone, code, newPassword }` |
| 个性化设置 | [personal.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/user/personal.tsx) | 数据模型来自 `UserDataState`；包含 presetMode/presetPrompts 等字段；支持本地 AsyncStorage 和后端 API 双向同步 |
| 历史记录 | [history.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/(main)/history.tsx) | 历史会话列表页面，支持搜索、置顶、重命名、删除；本地 AsyncStorage 和后端 API 双向同步 |
| Workflow 主页面 | [workflow.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/(main)/workflow.tsx) | 基于 `sessionId` 组织块序列、录音预览、消息输入、AI 生成与历史恢复 |
| 首页门户 | [Home_Portal.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/home/Home_Portal.tsx) | 日历门户页面，展示每日待办、工作流标记和倒计时卡片；本地 AsyncStorage 和后端 API 双向同步 |


## 接口文档
### 基础配置
- 基础路径：`/api`
- 统一响应格式：
  - 成功：`{ code: "0", message: "ok", data: ... }`
  - 失败：`{ code: "ERR_xxx", message: "...", details?: {...} }`

### 字段兼容约定
- `history` 域中已有的 `id` 字段继续保留。
- `workflow` / `audio` 域中使用的 `sessionId` 表示同一个会话主键。
- 后端实现可兼容接受：
  - `id`
  - `sessionId`
- 如果请求中同时出现 `id` 与 `sessionId`：
  - 要求二者值一致
  - 若不一致，返回参数错误
- 文档中的统一语义：
  - `id/sessionId`：会话唯一标识，二者兼容，建议后端内部统一映射到同一个 session 主键
- 旧接口中 `id` 与 `userId` 的写法继续兼容：
  - 现有已实现接口保持原字段名
  - 新增接口优先使用 `userId` 和 `sessionId`

### 接口详情
#### 1. 登录 1
- 接口地址：`POST /auth/login_1`
- 用途：用户验证码登录
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | phone | string | 手机号 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | user | object | 用户信息：`{ id, name }` |

#### 2. 登录 2
- 接口地址：`POST /auth/login_2`
- 用途：用户密码登录
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | phone | string | 手机号 |
  | password | string | 密码 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | user | object | 用户信息：`{ id, name }` |

#### 3. 注册
- 接口地址：`POST /auth/register`
- 用途：用户注册
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | name | string | 昵称 |
  | password | string | 密码 |
  | phone | string | 手机号 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok", data: "id" }` |

#### 4. 重置密码
- 接口地址：`POST /auth/password/reset`
- 用途：密码重置
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | phone | string | 手机号 |
  | newPassword | string | 新密码 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok", data: "id" }` |

#### 5. 退出登录
- 接口地址：`POST /auth/logout`
- 用途：用户退出登录
- 请求参数：空
- 响应参数：`{ success: true }`

#### 6. 发送验证码
- 接口地址：`POST /auth/code/send`
- 用途：登录 / 注册 / 重置密码场景的验证码发送
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | phone | string | 手机号 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | requestId | string | 验证码请求 ID |

#### 7. 获取用户个性化配置
- 接口地址：`GET /user/preferences`
- 用途：个性化页面加载数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | id | string | 用户 id |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | presetMode | string | 取值：`custom` / `concise` / `formal` |
  | presetPrompts | object | `{ custom, concise, formal }` |
  | quickActionNames | object | `{ solt1, solt2, solt3, solt4 }` |
  | quickActionPrompts | object | `{ solt1, solt2, solt3, solt4 }` |
  | memoryContent | string | 记忆内容 |

#### 8. 上传用户个性化配置
- 接口地址：`POST /user/preferences`
- 用途：保存用户个性化设置到服务器
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | id | string | 用户 id |
  | presetMode | string | 取值：`custom` / `concise` / `formal` |
  | presetPrompts | object | `{ custom, concise, formal }` |
  | quickActionNames | object | `{ solt1, solt2, solt3, solt4 }` |
  | quickActionPrompts | object | `{ solt1, solt2, solt3, solt4 }` |
  | memoryContent | string | 记忆内容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 9. 获取历史会话列表
- 接口地址：`GET /history/sessions`
- 用途：获取用户的所有历史会话摘要
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | id | string | 用户 id |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | sessions | array | 会话摘要数组，每个元素包含 `{ id, title, createdAt, updatedAt?, isPinned, previewText }` |
- 说明：
  - 返回对象中的 `id` 可直接作为 workflow / audio 场景中的 `sessionId`
  - 该接口只返回摘要，不返回完整 workflow blocks

#### 10. 创建历史会话
- 接口地址：`POST /history/sessions`
- 用途：创建新的历史会话摘要
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id |
  | title | string | 会话标题 |
  | previewText | string | 预览文本（可选） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | session | object | 创建的会话对象：`{ id, title, createdAt, updatedAt?, isPinned, previewText }` |
- 说明：
  - `session.id` 与 workflow 的 `sessionId` 兼容，是同一个会话主键
  - 推荐触发时机为“用户在 workflow 内首次真正提交内容后”，而不是点击“新建”按钮瞬间
  - 若用户仅进入空白 workflow 但未输入内容，可不创建 history 摘要
  - 若后端希望进一步收敛，也可由 `POST /workflow/input` 在首次提交时内部自动创建 history 摘要，本接口继续作为兼容入口保留

#### 11. 删除历史会话
- 接口地址：`DELETE /history/sessions/{sessionId}`
- 用途：删除指定会话
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id（body） |
  | sessionId | string | 会话 id（path） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |
- 说明：
  - 删除的是整条会话，包括对应 workflow 数据

#### 12. 重命名历史会话
- 接口地址：`PUT /history/sessions/{sessionId}/title`
- 用途：修改会话标题
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id |
  | sessionId | string | 会话 id（path） |
  | newTitle | string | 新标题 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 13. 切换置顶状态
- 接口地址：`PUT /history/sessions/{sessionId}/pin`
- 用途：切换会话的置顶状态
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id |
  | sessionId | string | 会话 id（path） |
  | isPinned | boolean | 置顶状态 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 14. 获取日历数据（整月）
- 接口地址：`GET /portal/calendar`
- 用途：获取用户指定月份的完整日历数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id |
  | year | number | 年份 |
  | month | number | 月份（1-12） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | monthData | object | 月度数据，格式为 `{ [day: number]: PortalDayData }`，其中 `PortalDayData` 包含 `{ keys, todoKeys, workflowKeys, detailBodyText, countdownCards }` |

#### 15. 更新单日数据
- 接口地址：`POST /portal/day`
- 用途：更新或创建指定日期的数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id |
  | year | number | 年份 |
  | month | number | 月份（1-12） |
  | day | number | 日期（1-31） |
  | dayData | object | 日期数据：`{ keys, todoKeys, workflowKeys, detailBodyText, countdownCards }` |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 16. 删除单日数据
- 接口地址：`DELETE /portal/day`
- 用途：删除指定日期的数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户 id |
  | year | number | 年份 |
  | month | number | 月份（1-12） |
  | day | number | 日期（1-31） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 17. 获取 Workflow 会话详情（新增）
- 接口地址：`GET /workflow/sessions/{sessionId}`
- 用途：根据会话标识获取完整 workflow 数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | sessionId | string | 会话主键，可直接使用 history 返回的 `id` |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | sessionId | string | 会话主键 |
  | blocks | array | 完整 block 列表；其中 AI block 可包含 `attachments` |
  | lastModified | number | 最后修改时间 |
  | recordedAudio | object | 可选；长时录音预览信息：`{ audioResourceId?, audioUri?, durationMs }` |
- block 内文件相关字段：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | fileRef | object | 可选；单文件引用：`{ url?, path?, mimeType?, fileName }` |
  | attachments | array | 可选；附件数组，元素可包含 `{ id, type, fileName, mimeType, thumbnailUri?, fileRef? }` |
- 说明：
  - `GET /history/sessions` 负责返回会话摘要；`GET /workflow/sessions/{sessionId}` 负责返回完整会话内容
  - 用户在 history 页点击某条记录后，应使用该条 history 的 `id` 作为这里的 `sessionId` 获取完整详情
  - 文件信息、附件信息、长时录音预览信息应放在该接口中返回，不放在 history 摘要列表中
- 响应示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "sessionId": "session-20260403-001",
    "blocks": [
      {
        "id": "user-20260403-001",
        "role": "user",
        "content": "请整理这段长音频并输出重点",
        "createdAt": 1775203200000
      },
      {
        "id": "ai-20260403-001",
        "role": "ai",
        "content": "我已完成整理，见下方附件。",
        "createdAt": 1775203205000,
        "sourceBlockId": "user-20260403-001",
        "status": "done",
        "attachments": [
          {
            "id": "att-20260403-001",
            "type": "file",
            "fileName": "会议总结.pdf",
            "mimeType": "application/pdf",
            "fileRef": {
              "url": "https://api.example.com/files/att-20260403-001/download",
              "path": "/generated/2026/04/03/meeting-summary.pdf",
              "fileName": "会议总结.pdf",
              "mimeType": "application/pdf"
            }
          }
        ]
      }
    ],
    "lastModified": 1775203206000,
    "recordedAudio": {
      "audioResourceId": "audio-20260403-001",
      "audioUri": "https://api.example.com/audio/audio-20260403-001/play",
      "durationMs": 98321
    }
  }
}
```

#### 18. 提交 Workflow 输入（新增）
- 接口地址：`POST /workflow/input`
- 用途：提交一条新的 workflow 输入，支持纯文本或文件引用
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | text | string | 纯文本输入（可选） |
  | fileRef | object | 上传后的文件引用（可选） |
  | blocks | array | 当前完整 blocks，用于上下文 |
  | sessionId | string | 可选；与 history `id` 等价 |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userBlockId | string | 新 user block 标识 |
  | aiBlock | object | 可选；若后端同步生成，则返回第一条 AI block，结构与 `POST /workflow/generate` 返回一致，可包含 `attachments` |
- 请求示例：
```json
{
  "text": "请根据附件内容输出一份总结",
  "fileRef": {
    "url": "https://api.example.com/files/file-20260403-001/download",
    "path": "/uploads/2026/04/03/report.pdf",
    "fileName": "report.pdf",
    "mimeType": "application/pdf"
  },
  "blocks": [],
  "sessionId": "session-20260403-001",
  "id": "session-20260403-001"
}
```
- 响应示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "userBlockId": "user-20260403-002",
    "aiBlock": {
      "blockId": "ai-20260403-002",
      "content": "我已阅读附件并整理出概要，附件见下方。",
      "sourceBlockId": "user-20260403-002",
      "status": "done",
      "attachments": [
        {
          "id": "att-20260403-002",
          "type": "file",
          "fileName": "分析结果.docx",
          "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "fileRef": {
            "url": "https://api.example.com/files/att-20260403-002/download",
            "path": "/generated/2026/04/03/result.docx",
            "fileName": "分析结果.docx",
            "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          }
        }
      ]
    }
  }
}
```

#### 19. Workflow 生成（新增）
- 接口地址：`POST /workflow/generate`
- 用途：执行 AI 生成，支持从首块重跑或指定块后追加
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | blocks | array | 当前完整 blocks |
  | action | string | `regenerate_from_first` / `append_after` |
  | afterBlockId | string | 当 `action=append_after` 时必填 |
  | sessionId | string | 可选；与 history `id` 等价 |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | blockId | string | 新 AI block 标识 |
  | content | string | 生成内容 |
  | sourceBlockId | string | 源块标识 |
  | status | string | `done` |
  | attachments | array | 可选；AI 输出附带的文件列表，元素可包含 `{ id, type, fileName, mimeType, fileRef/url/thumbnailUri }` |
- AI 生成附件返回示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "blockId": "ai-20260403-001",
    "content": "我已根据本次内容整理出总结文件，见下方附件。",
    "sourceBlockId": "user-20260403-001",
    "status": "done",
    "attachments": [
      {
        "id": "att-20260403-001",
        "type": "file",
        "fileName": "会议总结.pdf",
        "mimeType": "application/pdf",
        "fileRef": {
          "url": "https://api.example.com/files/att-20260403-001/download",
          "path": "/generated/2026/04/03/meeting-summary.pdf",
          "fileName": "会议总结.pdf",
          "mimeType": "application/pdf"
        }
      }
    ]
  }
}
```
- 图片附件示例：
```json
{
  "id": "att-20260403-002",
  "type": "image",
  "fileName": "流程图.png",
  "mimeType": "image/png",
  "thumbnailUri": "https://api.example.com/files/att-20260403-002/thumb",
  "fileRef": {
    "url": "https://api.example.com/files/att-20260403-002/download",
    "path": "/generated/2026/04/03/diagram.png",
    "fileName": "流程图.png",
    "mimeType": "image/png"
  }
}
```
- 说明：
  - workflow JSON 接口不直接返回文件二进制内容
  - 后端生成文件后，应先保存到可访问的文件服务、对象存储或静态资源目录
  - 前端只接收附件元数据与 `fileRef.url`
  - 用户点击附件时，前端通过 `fileRef.url` 进行预览、下载或外部打开
- 请求示例：
```json
{
  "blocks": [
    {
      "id": "user-20260403-003",
      "role": "user",
      "content": "请基于当前上下文继续输出正式版本",
      "createdAt": 1775203300000
    }
  ],
  "action": "append_after",
  "afterBlockId": "user-20260403-003",
  "sessionId": "session-20260403-001",
  "id": "session-20260403-001"
}
```

#### 20. Workflow 文件上传（新增）
- 接口地址：`POST /workflow/file/upload`
- 用途：上传 workflow 附件文件，返回 `fileRef`
- 请求类型：`multipart/form-data`
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | file | multipart/form-data | 文件二进制表单项；前端会以 `{ uri, name, type }` 形式组装上传 |
  | sessionId | string | 可选；与 history `id` 等价 |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | fileRef | object | `{ url?, path?, mimeType?, fileName }` |
- 后端解析说明：
  - 接口上传标准 `multipart/form-data` 文件。
  - 前端传入的 `uri/name/type` 只是客户端构造表单文件项时使用的元信息：
    - `uri`：客户端本地文件路径，仅前端可见，后端不会直接收到这个路径
    - `name`：上传文件名，例如 `report.pdf`
    - `type`：MIME 类型，例如 `application/pdf`、`image/jpeg`
  - 后端收到 multipart 请求中的 `file` 文件字段，需从该字段读取：
    - 文件二进制流 / bytes
    - 文件名 `fileName`
    - MIME 类型 `mimeType`
  - 后端处理流程建议：
    1. 从 `file` 字段读取二进制流
    2. 结合 `name` 和 `type` 识别文件类型，按普通文档/图片文件处理
    3. 保存到本地磁盘、对象存储或文件服务
    4. 生成统一文件引用 `fileRef`
- `fileRef` 约定：
  - `url`：后端返回的下载 / 预览地址
  - `path`：后端内部存储路径或资源路径
  - `mimeType`：最终识别后的 MIME 类型
  - `fileName`：最终保存的文件名
- 说明：
  - `POST /workflow/file/upload` 的职责只是上传并返回 `fileRef`
  - 若要把文件作为一次用户输入参与 workflow，需要再调用 `POST /workflow/input`，并把该 `fileRef` 放入请求体
- 请求示例（multipart/form-data 语义）：
```text
POST /workflow/file/upload
Content-Type: multipart/form-data

file = { uri: "file:///local/report.pdf", name: "report.pdf", type: "application/pdf" }
sessionId = "session-20260403-001"
id = "session-20260403-001"
```
- 响应示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "fileRef": {
      "url": "https://api.example.com/files/file-20260403-001/download",
      "path": "/uploads/2026/04/03/report.pdf",
      "fileName": "report.pdf",
      "mimeType": "application/pdf"
    }
  }
}
```

#### 21. 音频上传（新增）
- 接口地址：`POST /workflow/audio/upload`
- 用途：上传录音文件，供短录音转写或长时录音任务使用
- 请求类型：`multipart/form-data`
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | file | multipart/form-data | 音频二进制表单项；前端会以 `{ uri, name, type }` 形式组装上传 |
  | durationMs | number | 音频时长（可选） |
  | sessionId | string | 可选；与 history `id` 等价 |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | remoteAudioId | string | 音频资源标识 |
  | url | string | 可选；可下载 / 预览 URL |
- 后端解析说明：
  - 该接口同样是标准 `multipart/form-data` 上传，后端从 `file` 文件字段读取音频二进制流。
  - 前端不会把“音频内容转成 JSON”发送；后端接收到的就是原始音频文件，例如 `m4a`、`mp3`、`wav`。
  - 后端处理流程建议：
    1. 从 multipart 的 `file` 字段读取音频文件流或临时文件
    2. 按文件名和 MIME 类型识别音频格式，例如 `audio/m4a`、`audio/mpeg`、`audio/wav`
    3. 原样保存为标准音频文件，不要求前端额外转码
    4. 若转写引擎只支持固定格式，可在后端保存后统一转码
    5. 为该音频资源生成唯一 `remoteAudioId`
    6. 可选返回可播放的远程 `url`
  - `durationMs` 为前端采集得到的时长，仅作为辅助元数据；后端也可以在保存后自行重新计算真实时长。
  - “转成标准音频文件”的职责在后端：
    - 若上传的原文件已是可接受格式，可直接保存
    - 若业务链路要求统一为 `wav`/`mp3`/`m4a`，应由后端在落盘后转码
- 说明：
  - `POST /workflow/audio/upload` 只负责上传并返回音频资源引用
  - 短录音后续应调用 `POST /workflow/audio/transcript`
  - 长时录音后续应调用 `POST /workflow/audio/long-form`
- 请求示例（multipart/form-data 语义）：
```text
POST /workflow/audio/upload
Content-Type: multipart/form-data

file = { uri: "file:///local/meeting.m4a", name: "meeting.m4a", type: "audio/m4a" }
durationMs = 98321
sessionId = "session-20260403-001"
id = "session-20260403-001"
```
- 响应示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "remoteAudioId": "audio-20260403-001",
    "url": "https://api.example.com/audio/audio-20260403-001/play"
  }
}
```

#### 22. 短录音转写（新增）
- 接口地址：`POST /workflow/audio/transcript`
- 用途：将短录音音频转成文本
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | audioResourceId | string | 上传后返回的音频资源标识 |
  | audioUri | string | 可选；本地或远端音频地址 |
  | sessionId | string | 可选；与 history `id` 等价 |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | segments | array | 时间片段数组：`[{ startTime, endTime, text }]` |
  | fullText | string | 可选；完整文本 |
- 说明：
  - 该接口主要服务短录音 / 长按录音场景
- 请求示例：
```json
{
  "audioResourceId": "audio-20260403-002",
  "sessionId": "session-20260403-001",
  "id": "session-20260403-001"
}
```
- 响应示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "segments": [
      { "startTime": 0, "endTime": 1620, "text": "今天先确认需求范围。" },
      { "startTime": 1620, "endTime": 3510, "text": "然后安排后续开发节点。" }
    ],
    "fullText": "今天先确认需求范围。然后安排后续开发节点。"
  }
}
```

#### 23. 长时录音任务创建（新增）（存在耦合  移除了 audioUri，改为仅接收 audioResourceId）
- 接口地址：`POST /workflow/audio/long-form`
- 用途：提交长时录音处理任务，大文件场景采用异步任务模式
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | audioResourceId | string | 上传后返回的音频资源标识 |
  | prompt | string | 固定提示词或后端任务提示词 |
  | durationMs | number | 音频时长 |
  | sessionId | string | 会话主键；与 history `id` 等价 |
  | id | string | 可选；与 `sessionId` 双兼容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | accepted | boolean | 是否受理成功 |
  | taskId | string | 长任务标识 |
  | sessionId | string | 会话主键 |
- 说明：
  - 该接口不复用短录音 transcript 主链路
  - 前端必须先调用 `POST /workflow/audio/upload` 获取 `audioResourceId`
  - 本接口只负责基于 `audioResourceId` 创建长时录音异步任务
  - 本接口不再接收 `audioUri` 或原始音频文件
  - 推荐后端采用“上传文件 -> 建任务 -> 轮询状态”模型
- 请求示例：
```json
{
  "audioResourceId": "audio-20260403-001",
  "prompt": "请整理这段长时录音的完整内容，提取重点并生成后续工作流结果。",
  "durationMs": 98321,
  "sessionId": "session-20260403-001",
  "id": "session-20260403-001"
}
```
- 响应示例：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "accepted": true,
    "taskId": "long-task-20260403-001",
    "sessionId": "session-20260403-001"
  }
}
```

#### 24. 查询长时录音任务状态（新增）（可选）
- 接口地址：`GET /workflow/audio/tasks/{taskId}`
- 用途：轮询大文件长录音任务状态
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | taskId | string | 长任务标识 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | taskId | string | 长任务标识 |
  | status | string | `pending` / `processing` / `completed` / `failed` |
  | sessionId | string | 对应会话主键 |
  | result | object | 可选；任务完成后的结果摘要 |
  | errorMessage | string | 可选；失败原因 |
- 完成态约束：
  - 当前前端在 `status=completed` 后，会继续调用 `GET /workflow/sessions/{sessionId}` 拉取完整 blocks
  - 因此后端在返回 `completed` 时，应保证对应 `sessionId` 的 workflow 数据已经落库并可被该接口读取
- 响应示例（处理中）：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "taskId": "long-task-20260403-001",
    "status": "processing",
    "sessionId": "session-20260403-001"
  }
}
```
- 响应示例（已完成）：
```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "taskId": "long-task-20260403-001",
    "status": "completed",
    "sessionId": "session-20260403-001",
    "result": {
      "summary": "长音频任务已处理完成，结果已写入 workflow session。"
    }
  }
}
```

## 前端缓存与服务端 session 的映射
### 本地缓存现状
- history 列表共用一个单 key：
  - `@omni_history_sessions_v1`
- workflow 消息按 sessionId 拆成多个 key：
  - `@omni_workflow_chat_history_v1_${sessionId}`
- 当前激活会话单独用一个 key：
  - `current_session_id`

### 服务端推荐映射
- 服务端统一维护一个会话主键：
  - `id/sessionId`
- `history` 负责会话摘要：
  - 标题
  - 置顶
  - 预览文本
  - 创建时间 / 更新时间
- `workflow` 负责会话完整内容：
  - blocks
  - 文件引用
  - 长时录音预览信息
  - 生成状态
 - 推荐前后端对接方式：
   - 前端本地缓存继续保留，作为首屏恢复、离线兜底和写入缓冲
   - 服务端作为权威数据源
   - 读取时可采用“先本地回显，再请求后端覆盖”的策略
   - 写入时可采用“先更新本地，再同步后端”的策略

### 兼容关系结论
- 前端本地虽然使用多个 key，但都围绕同一个会话主键组织
- `history.id`
- `workflow.sessionId`
- `audio.sessionId`
  在当前文档中视为同一个值的兼容表达
 - `@omni_history_sessions_v1` 对应 history 摘要缓存
 - `@omni_workflow_chat_history_v1_${sessionId}` 对应 workflow 完整内容缓存
 - `current_session_id` 仅对应当前激活会话指针，不需要单独服务端资源
