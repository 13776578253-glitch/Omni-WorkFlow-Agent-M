# 接口文档V2

### 核心文件与功能划分
| 功能模块 | 文件路径 | 核心说明 |
|----------|----------|----------|
| 认证总入口 | [auth.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/user/auth.tsx) | 通过 `authMode` 切换 login/register/forgot，使用 `AsyncStorage` 持久化认证状态 |
| 登录表单 | [login.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/login.tsx) | 支持 phone+code / nickname+code 两种登录方式；提交 payload：`{ variant, phone, nickname, code }` |
| 注册表单 | [register.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/register.tsx) | 提交 payload：`{ nickname, password, phone, code }` |
| 忘记密码 | [forgot.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/forgot.tsx) | 两步式 UI（校验验证码→重置密码）；最终提交 payload：`{ phone, code, newPassword }` |
| 个性化设置 | [personal.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/user/personal.tsx) | 数据模型来自 `UserDataState`；包含 presetMode/presetPrompts 等字段；支持本地 AsyncStorage 和后端 API 双向同步 |
| 历史记录 | [history.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/(main)/history.tsx) | 历史会话列表页面，支持搜索、置顶、重命名、删除；本地 AsyncStorage 和后端 API 双向同步 |
| 首页门户 | [Home_Portal.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/home/Home_Portal.tsx) | 日历门户页面，展示每日待办、工作流标记和倒计时卡片；本地 AsyncStorage 和后端 API 双向同步 |


## 接口文档
### 基础配置
- 基础路径：`/api `
- 统一响应格式：
  - 成功：`{ code: "0", message: "ok", data: ... }`
  - 失败：`{ code: "ERR_xxx", message: "...", details?: {...} }`

### 接口详情
#### 1. 登录1
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

#### 2. 登录2
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
  | message | json | `{ code: "0", message: "ok", data: "id" `|

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
  | message | json | `{ code: "0", message: "ok", data: "id" `|

#### 5. 退出登录
- 接口地址：`POST /auth/logout`
- 用途：用户退出登录
- 请求参数：空
- 响应参数：`{ success: true }`

#### 6. 发送验证码
- 接口地址：`POST /auth/code/send`
- 用途：登录/注册/重置密码场景的验证码发送
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | phone | string | 手机号 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | requestId | string | 验证码请求ID |

#### 7. 获取用户个性化配置
- 接口地址：`GET /user/preferences`
- 用途：个性化页面加载数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | id | string | 用户id |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | presetMode | string | 取值：`custom`/`concise`/`formal` |
  | presetPrompts | object | `{ custom, concise, formal }` |
  | quickActionNames | object | `{ solt1, solt2, solt3, solt4 }` |
  | quickActionPrompts | object | `{ solt1, solt2, solt3, solt4 }` |
  | memoryContent | string | 记忆内容 |

#### 8. 上传用户个性化配置（新增）
- 接口地址：`POST /user/preferences`
- 用途：保存用户个性化设置到服务器
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | id | string | 用户id |
  | presetMode | string | 取值：`custom`/`concise`/`formal` |
  | presetPrompts | object | `{ custom, concise, formal }` |
  | quickActionNames | object | `{ solt1, solt2, solt3, solt4 }` |
  | quickActionPrompts | object | `{ solt1, solt2, solt3, solt4 }` |
  | memoryContent | string | 记忆内容 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 9. 获取历史会话列表（新增）
- 接口地址：`GET /history/sessions`
- 用途：获取用户的所有历史会话
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | id | string | 用户id |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | sessions | array | 会话数组，每个元素包含 `{ id, title, createdAt, isPinned, previewText }` |

#### 10. 创建“历史”会话（新增）（存疑，需要和workflow联动）（待处理）
- 接口地址：`POST /history/sessions`
- 用途：创建新的历史会话
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id |
  | title | string | 会话标题 |
  | previewText | string | 预览文本（可选） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | session | object | 创建的会话对象：`{ id, title, createdAt, isPinned, previewText }` |

#### 11. 删除历史会话（新增）
- 接口地址：`DELETE /history/sessions/{sessionId}`
- 用途：删除指定会话
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id（body） |
  | sessionId | string | 会话id（path） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 12. 重命名历史会话（新增）
- 接口地址：`PUT /history/sessions/{sessionId}/title`
- 用途：修改会话标题
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id |
  | sessionId | string | 会话id（path） |
  | newTitle | string | 新标题 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 13. 切换置顶状态（新增）
- 接口地址：`PUT /history/sessions/{sessionId}/pin`
- 用途：切换会话的置顶状态
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id |
  | sessionId | string | 会话id（path） |
  | isPinned | boolean | 置顶状态 |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 14. 获取日历数据（整月）(新增)
- 接口地址：`GET /portal/calendar`
- 用途：获取用户指定月份的完整日历数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id |
  | year | number | 年份 |
  | month | number | 月份（1-12） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | monthData | object | 月度数据，格式为 `{ [day: number]: PortalDayData }`，其中 `PortalDayData` 包含 `{ keys, todoKeys, workflowKeys, detailBodyText, countdownCards }` |

#### 15. 更新单日数据（新增）
- 接口地址：`POST /portal/day`
- 用途：更新或创建指定日期的数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id |
  | year | number | 年份 |
  | month | number | 月份（1-12） |
  | day | number | 日期（1-31） |
  | dayData | object | 日期数据：`{ keys, todoKeys, workflowKeys, detailBodyText, countdownCards }` |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |

#### 16. 删除单日数据（新增）
- 接口地址：`DELETE /portal/day`
- 用途：删除指定日期的数据
- 请求参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | userId | string | 用户id |
  | year | number | 年份 |
  | month | number | 月份（1-12） |
  | day | number | 日期（1-31） |
- 响应参数：
  | 字段 | 类型 | 说明 |
  |------|------|------|
  | message | json | `{ code: "0", message: "ok" }` |


