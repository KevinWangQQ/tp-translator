# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开发命令

### 核心命令
```bash
# 安装依赖
npm install

# 开发模式（文件监听和热重载）
npm run dev

# 构建生产版本
npm run build

# 运行所有测试
npm test

# 测试监听模式
npm run test:watch

# 代码质量检查
npm run lint
npm run lint:fix

# TypeScript 类型检查
npm run type-check

# 完整的预发布检查流程
npm run package

# 清理构建产物
npm run clean

# 准备发布
npm run prepare
```

### 单个测试运行
```bash
# 运行特定测试文件
npm test -- Button.test.tsx

# 运行包含特定模式的测试
npm test -- --testNamePattern="should render correctly"

# 运行特定目录的所有测试
npm test -- services/translation/

# 自定义测试运行器
node test-runner.js
```

## 系统架构

### 整体架构原则
这是一个企业级 Figma 翻译插件，采用分层架构和模块化设计：

#### 双线程架构模式
- **主线程 (Sandbox)**: `src/main/` - Figma API 操作和业务逻辑
- **UI线程 (Iframe)**: `src/ui/` - 用户界面和交互处理
- **消息通信**: 基于 postMessage 的类型安全通信协议

#### 分层架构设计
```
Presentation Layer (表现层)
├── UI Components (src/ui/, src/components/)
├── Page Components (src/ui/pages/)
└── Layout Components (src/components/Layout/)

Business Logic Layer (业务逻辑层)
├── Translation Services (src/services/translation/)
├── Engine Management (src/services/engine-management/)
├── Text Selection (src/services/text-selection/)
└── Result Processing (src/services/result-processing/)

Data Access Layer (数据访问层)
├── Figma API Service (src/main/figma-service.ts)
├── Translation Engines (src/services/translation/engines/)
└── Storage Service (src/services/storage.ts)

Infrastructure Layer (基础设施层)
├── Configuration (src/config/)
├── Error Handling (src/services/error-handler.ts)
├── Logging (src/services/logger.ts)
└── Type Definitions (src/types/)
```

### 核心服务架构

#### 翻译服务生态系统
```typescript
// 翻译服务主入口
TranslationService (src/services/translation/translation-service.ts)
├── TranslationManager - 统一翻译管理
├── EngineManager - 引擎选择和切换
├── ResultProcessor - 结果处理和格式化
└── TranslationMemory - 翻译记忆管理

// 引擎实现
Translation Engines
├── OpenAIClient - GPT 系列模型集成
├── GeminiClient - Google Gemini 模型集成
└── EngineFactory - 引擎工厂模式
```

#### Figma API 服务架构
```typescript
// Figma 操作服务
FigmaService (src/main/figma-service.ts)
├── 文本节点选择和识别
├── 样式属性提取和保持
├── 字体映射和应用
├── 翻译结果渲染 (4种模式)
└── 页面和框架管理

// 支持的翻译输出模式
TranslationModes:
1. replace - 替换原文本
2. beside - 原文本旁边显示
3. newFrame - 新框架中显示  
4. newPage - 新页面中显示
```

## 开发约定和规范

### TypeScript 配置
项目使用严格的 TypeScript 配置，包含：
- 路径别名映射 (@/components, @/services, @/types 等)
- 严格的类型检查 (noImplicitAny, strictNullChecks)
- 模块解析配置
- Figma Plugin API 类型集成

### 路径别名系统
```typescript
// 配置的路径别名
"@/*": ["*"]                    // 根目录
"@/components/*": ["components/*"]
"@/services/*": ["services/*"]
"@/engines/*": ["engines/*"]
"@/utils/*": ["utils/*"]
"@/types/*": ["types/*"]
"@/stores/*": ["stores/*"]
"@/config/*": ["config/*"]
"@/main/*": ["main/*"]
```

### 组件架构规范
```
组件目录结构:
ComponentName/
├── ComponentName.tsx        // 主组件实现
├── ComponentName.module.css // CSS Modules 样式
├── index.ts                // 导出文件
└── __tests__/
    └── ComponentName.test.tsx
```

### 代码组织原则
1. **单一职责原则**: 每个服务类只负责一个明确的业务领域
2. **依赖注入**: 通过构造函数注入依赖，便于测试和模块化
3. **接口隔离**: 使用 TypeScript 接口定义清晰的契约
4. **错误处理**: 统一的错误处理和日志记录机制

## 翻译引擎系统

### 引擎抽象接口
所有翻译引擎实现统一的 `TranslationEngine` 接口：
```typescript
interface TranslationEngine {
  name: string;
  models: string[];
  translate(request: TranslateRequest): Promise<TranslateResponse>;
  validateConfig(config: ServiceConfig): boolean;
  estimateCost(request: TranslateRequest): number;
}
```

### 支持的引擎和模型
#### OpenAI 引擎
- gpt-3.5-turbo-instruct (快速、成本低)
- gpt-4 (高质量翻译)
- gpt-4-turbo (平衡性能和质量)

#### Google Gemini 引擎
- gemini-pro (标准模型)
- gemini-1.5-pro (增强版)
- gemini-1.5-flash (快速响应)

### 引擎切换策略
- 运行时引擎切换
- 智能模型推荐
- 成本优化建议
- 失败自动降级

## 数据流和状态管理

### 消息通信协议
```typescript
// UI -> Main 消息类型
UIToMainMessage:
├── translate-request      // 翻译请求
├── get-selection         // 获取选择
├── save-settings        // 保存设置
└── get-available-fonts  // 获取字体

// Main -> UI 消息类型  
MainToUIMessage:
├── translation-result   // 翻译结果
├── selection-changed   // 选择变化
├── progress-update     // 进度更新
└── error-occurred      // 错误事件
```

### 状态管理架构
使用 React Context + useReducer 模式：
```typescript
AppState:
├── ui: UIState              // 界面状态
├── translation: TranslationState  // 翻译状态
├── config: ConfigState      // 配置状态
└── cache: CacheState        // 缓存状态
```

## 构建和部署

### Webpack 配置要点
- 双入口配置 (code.ts, ui/index.tsx)
- CSS Modules 支持
- TypeScript 编译
- 生产环境优化
- 源码映射生成

### 构建产物
```
dist/
├── code.js      // 主线程代码 (Figma API 操作)
├── ui.html      // UI 界面入口
├── ui.js        // UI 线程代码 (React 应用)
└── *.map        // 源码映射文件
```

### Figma Plugin 配置
```json
{
  "name": "Advanced Figma Translator",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "networkAccess": {
    "allowedDomains": [
      "https://api.openai.com",
      "https://generativelanguage.googleapis.com"
    ]
  }
}
```

## 测试框架

### 测试技术栈
- **单元测试**: Jest + React Testing Library
- **集成测试**: 自定义 Figma API 模拟
- **E2E测试**: 插件运行时测试

### 测试配置
```typescript
Jest 配置:
├── 测试环境: jsdom
├── TypeScript 支持: ts-jest
├── CSS Modules 模拟: identity-obj-proxy
├── 设置文件: src/test/setup.ts
└── 测试工具: src/test/test-utils.tsx
```

### 模拟服务
- Figma API 模拟: `src/test/mocks/figma-api.ts`
- 翻译 API 模拟: `src/test/mocks/translation-api.ts`
- 完整的插件运行时环境模拟

## 关键约束和限制

### Figma Plugin API 约束
1. **沙箱限制**: 主线程无法访问 DOM、localStorage 等 Web API
2. **网络限制**: 只能访问 manifest 中声明的域名
3. **存储限制**: 使用 figma.clientStorage API 进行数据持久化
4. **线程通信**: 只能通过 postMessage 进行 UI 和主线程通信

### 性能和资源约束
- API 调用频率限制
- 内存使用优化
- 批量处理策略
- 错误重试机制

### 安全约束
- API 密钥加密存储
- 用户数据隐私保护
- 敏感信息过滤
- 网络请求安全

## 字体映射系统

### 字体映射架构
```typescript
FontMapping System:
├── FontDetection - 自动检测源字体
├── FontSuggestion - 智能字体推荐
├── MappingStorage - 映射规则持久化
└── FontApplication - 字体应用和渲染
```

### 字体映射策略
- 按语言自动推荐字体
- 字重级别独立映射
- 用户自定义映射规则
- 字体兼容性检查

## 错误处理和监控

### 分层错误处理
```typescript
Error Handling:
├── UI层错误 - ErrorBoundary + 用户友好提示
├── 服务层错误 - 统一错误分类和处理
├── API层错误 - 重试机制和降级策略
└── 系统错误 - 全局捕获和报告
```

### 日志系统
- 分级日志记录 (Debug, Info, Warn, Error)
- 结构化日志格式
- 开发环境详细日志
- 生产环境错误监控

## 开发最佳实践

### 代码质量
1. **类型安全**: 充分利用 TypeScript 类型系统
2. **错误处理**: 所有异步操作都要有错误处理
3. **测试覆盖**: 核心业务逻辑 100% 测试覆盖
4. **代码审查**: 遵循项目编码规范

### 性能优化
1. **懒加载**: 非核心组件按需加载
2. **缓存策略**: 合理缓存翻译结果和配置
3. **批量处理**: 大量文本的批量翻译处理
4. **内存管理**: 及时清理不需要的数据

### 用户体验
1. **加载状态**: 所有异步操作提供加载反馈
2. **错误恢复**: 提供错误后的恢复机制
3. **操作反馈**: 操作结果的清晰反馈
4. **快捷操作**: 支持键盘快捷键

## 当前项目状态

### 开发阶段
项目目前处于架构搭建和核心开发阶段，存在以下已知问题：

#### TypeScript 类型问题
1. **Figma API 类型缺失**: 需要正确配置 @figma/plugin-typings
2. **CSS Modules 类型声明**: 需要添加 CSS Modules 的类型声明文件
3. **类型导出问题**: isolatedModules 要求使用 `export type` 进行类型导出
4. **接口不匹配**: 部分接口定义与实现不匹配

#### 模块依赖问题
- 组件模块导入路径需要修正
- 服务类之间的依赖关系需要整理
- 类型定义文件需要完善

### 优先修复任务
运行 `npm run type-check` 当前会显示类型错误，这些是开发过程中的正常现象。修复优先级：
1. 配置 Figma Plugin API 类型
2. 添加 CSS Modules 类型声明
3. 修复类型导出语法
4. 完善核心接口定义

## 故障排除

### 常见问题解决
1. **构建失败**: 检查 TypeScript 类型错误和路径问题
2. **测试失败**: 确认模拟设置正确性
3. **API 调用失败**: 验证 API 密钥和网络配置
4. **字体问题**: 检查字体映射配置和可用性
5. **类型错误**: 当前处于开发阶段，类型错误是已知问题

### 调试工具
- Chrome DevTools 集成
- Figma Plugin 开发者控制台
- 自定义日志系统
- 错误边界组件

### 开发工作流建议
1. 使用 `npm run dev` 进行开发，忽略类型检查错误
2. 定期运行 `npm run type-check` 了解类型问题
3. 优先完成功能实现，后续统一修复类型问题
4. 使用 `npm run lint` 确保代码风格一致性
- 每个生成的安装包应该放在./releases/latest文件夹下以便于统一管理。
- 每次打包都对版本号进行升级。