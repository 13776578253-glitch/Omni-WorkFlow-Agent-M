# 接口文档V1

## 范围内结构分析
### 核心文件与功能划分
| 功能模块 | 文件路径 | 核心说明 |
|----------|----------|----------|
| 认证总入口 | [auth.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/user/auth.tsx) | 通过 `authMode` 切换 login/register/forgot，使用 `AsyncStorage` 持久化认证状态 |
| 登录表单 | [login.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/login.tsx) | 支持 phone+code / nickname+code 两种登录方式；提交 payload：`{ variant, phone, nickname, code }` |
| 注册表单 | [register.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/register.tsx) | 提交 payload：`{ nickname, password, phone, code }` |
| 忘记密码 | [forgot.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/components/user/auth/forgot.tsx) | 两步式 UI（校验验证码→重置密码）；最终提交 payload：`{ phone, code, newPassword }` |
| 个性化设置 | [personal.tsx](d:/code/Omni-WorkFlow-Agent-M/front_end/omni-workflow-agent-m/app/user/personal.tsx) | 数据模型来自 `UserDataState`；包含 presetMode/presetPrompts 等字段；仅本地 AsyncStorage 保存，未接后端 |
| 空文件 | language.tsx / module.tsx / islogin.tsx | 目前无业务逻辑实现 |

## 接口文档（建议稿）
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

#### 5. 退出登录 ( 暂保留 )
- 接口地址：`POST /auth/logout`
- 用途：用户退出登录
- 请求参数：空
- 响应参数：`{ success: true }`

#### 6. 获取用户个性化配置
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

#### 7. 发送验证码
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

