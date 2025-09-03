# Figma 翻译插件系统架构文档

## 版本信息
- **文档版本**: v1.0
- **创建日期**: 2025-08-15
- **最后更新**: 2025-08-15
- **架构负责人**: Claude Code
- **技术栈版本**: React 18+ TypeScript 5+ Webpack 5+

## 1. 架构概览

### 1.1 系统整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Figma Desktop/Web                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Figma Plugin Runtime                     │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Plugin UI     │    │      Plugin Main Thread     │ │
│  │   (Iframe)      │    │      (Sandbox)             │ │
│  │                 │    │                             │ │
│  │  - React UI     │◄──►│  - Figma API 操作           │ │
│  │  - 用户交互      │    │  - 数据处理                 │ │
│  │  - 状态管理      │    │  - 业务逻辑                 │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                External APIs                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ OpenAI API  │  │ Gemini API  │  │ Other Services  │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心设计原则

#### 1.2.1 分层架构原则
- **表现层 (Presentation Layer)**: React 组件和用户界面
- **业务逻辑层 (Business Logic Layer)**: 翻译逻辑、字体映射、数据处理
- **数据访问层 (Data Access Layer)**: Figma API 封装、外部 API 调用
- **基础设施层 (Infrastructure Layer)**: 配置管理、存储、工具类

#### 1.2.2 模块化设计
- 高内聚、低耦合的模块设计
- 可插拔的翻译引擎架构
- 组件复用和代码共享
- 清晰的模块边界和接口定义

#### 1.2.3 可扩展性原则
- 支持新翻译引擎的快速接入
- 界面组件的灵活配置
- 功能模块的独立开发和部署

## 2. 技术栈架构

### 2.1 前端技术栈

#### 2.1.1 核心框架
```typescript
// 技术栈配置
{
  "framework": "React 18+",
  "language": "TypeScript 5+",
  "bundler": "Webpack 5+",
  "styling": "CSS Modules + PostCSS",
  "state": "React Context + useReducer",
  "routing": "React Router v6"
}
```

#### 2.1.2 开发工具链
```typescript
// 开发环境配置
{
  "linter": "ESLint + TypeScript ESLint",
  "formatter": "Prettier",
  "testing": "Jest + React Testing Library",
  "bundling": "Webpack + TypeScript",
  "hot-reload": "Webpack Dev Server"
}
```

### 2.2 Figma Plugin 架构

#### 2.2.1 Plugin Manifest
```json
{
  "name": "Advanced Figma Translator",
  "id": "figma-translator-advanced",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": ["figma"],
  "documentAccess": "dynamic-page",
  "networkAccess": {
    "allowedDomains": [
      "https://api.openai.com",
      "https://generativelanguage.googleapis.com"
    ]
  }
}
```

#### 2.2.2 双线程架构
```typescript
// Main Thread (Sandbox)
interface MainThreadAPI {
  getSelectedNodes(): SceneNode[];
  updateTextNode(nodeId: string, content: string): void;
  createNewFrame(name: string): FrameNode;
  duplicateToNewPage(nodes: SceneNode[]): void;
}

// UI Thread (Iframe)
interface UIThreadAPI {
  showUI(options: ShowUIOptions): void;
  postMessage(message: any): void;
  closePlugin(): void;
}
```

## 3. 模块架构设计

### 3.1 核心模块划分

```
src/
├── components/          # UI 组件模块
├── services/           # 业务服务模块  
├── engines/            # 翻译引擎模块
├── utils/              # 工具类模块
├── types/              # 类型定义模块
├── stores/             # 状态管理模块
├── config/             # 配置管理模块
└── main/               # 主线程代码模块
```

### 3.2 组件架构设计

#### 3.2.1 组件层次结构
```typescript
// 组件架构
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── SettingsButton
│   ├── Main
│   │   ├── TranslatePage
│   │   │   ├── SelectionPanel
│   │   │   ├── LanguageSelector
│   │   │   ├── ResultOptions
│   │   │   └── TranslateButton
│   │   ├── SettingsPage
│   │   │   ├── CommonSettings
│   │   │   └── TranslationMemories
│   │   └── FontMappingModal
│   └── StatusBar
└── ErrorBoundary
```

#### 3.2.2 组件设计规范
```typescript
// 组件接口设计
interface ComponentProps {
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

// 业务组件接口
interface TranslateButtonProps extends ComponentProps {
  onTranslate: (options: TranslateOptions) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

// 组件状态管理
interface ComponentState {
  loading: boolean;
  error: string | null;
  data: any;
}
```

### 3.3 服务层架构

#### 3.3.1 翻译服务抽象
```typescript
// 翻译服务接口
interface TranslationService {
  name: string;
  models: string[];
  translate(request: TranslateRequest): Promise<TranslateResponse>;
  validateConfig(config: ServiceConfig): boolean;
  estimateCost(request: TranslateRequest): number;
}

// 具体实现
class OpenAITranslationService implements TranslationService {
  // OpenAI 具体实现
}

class GeminiTranslationService implements TranslationService {
  // Gemini 具体实现  
}

// 服务工厂
class TranslationServiceFactory {
  static create(type: ServiceType): TranslationService;
}
```

#### 3.3.2 Figma API 服务封装
```typescript
// Figma 操作服务
interface FigmaService {
  getSelectedTextNodes(): TextNode[];
  updateTextContent(nodeId: string, content: string): void;
  preserveTextStyles(sourceNode: TextNode, targetNode: TextNode): void;
  createBesideDisplay(originalNode: TextNode, translatedText: string): void;
  createNewFrameDisplay(nodes: TextNode[], translations: Translation[]): void;
  createNewPageDisplay(nodes: TextNode[], translations: Translation[]): void;
}

// 字体管理服务
interface FontService {
  getFontMappings(): FontMapping[];
  saveFontMapping(mapping: FontMapping): void;
  applyFontMapping(textNode: TextNode, targetLang: string): void;
  getSupportedFonts(): FontInfo[];
}
```

## 4. 数据架构设计

### 4.1 数据模型定义

#### 4.1.1 核心数据类型
```typescript
// 翻译请求
interface TranslateRequest {
  texts: TextInfo[];
  sourceLang: string;
  targetLang: string;
  engine: TranslationEngine;
  model: string;
  options: TranslateOptions;
}

// 文本信息
interface TextInfo {
  nodeId: string;
  content: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: string;
  fills: Paint[];
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// 翻译结果
interface TranslateResponse {
  translations: Translation[];
  engine: string;
  model: string;
  cost: number;
  duration: number;
  error?: string;
}

// 单个翻译
interface Translation {
  nodeId: string;
  originalText: string;
  translatedText: string;
  confidence: number;
  alternatives?: string[];
}
```

#### 4.1.2 配置数据模型
```typescript
// 用户配置
interface UserConfig {
  defaultEngine: TranslationEngine;
  defaultModel: string;
  defaultTargetLang: string;
  apiKeys: Record<TranslationEngine, string>;
  fontMappings: FontMapping[];
  resultMode: ResultMode;
  autoSave: boolean;
}

// 字体映射
interface FontMapping {
  id: string;
  sourceLang: string;
  targetLang: string;
  mappings: {
    [fontWeight: string]: {
      sourceFont: string;
      targetFont: string;
    };
  };
}

// 翻译记忆
interface TranslationMemory {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  engine: string;
  model: string;
  createdAt: Date;
  lastUsedAt: Date;
  useCount: number;
}
```

### 4.2 状态管理架构

#### 4.2.1 全局状态设计
```typescript
// 全局状态类型
interface AppState {
  ui: UIState;
  translation: TranslationState;
  config: ConfigState;
  cache: CacheState;
}

// UI 状态
interface UIState {
  currentPage: PageType;
  isLoading: boolean;
  selectedNodes: string[];
  error: string | null;
  modals: {
    fontMapping: boolean;
    settings: boolean;
  };
}

// 翻译状态  
interface TranslationState {
  currentRequest: TranslateRequest | null;
  results: TranslateResponse | null;
  history: TranslationMemory[];
  progress: {
    current: number;
    total: number;
    status: TranslationStatus;
  };
}
```

#### 4.2.2 状态管理实现
```typescript
// Context Provider
const AppStateContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case 'SET_TRANSLATION_RESULTS':
      return { ...state, translation: { ...state.translation, results: action.payload } };
    // 其他 action 处理
    default:
      return state;
  }
}

// Custom Hooks
function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}
```

### 4.3 数据持久化架构

#### 4.3.1 存储策略
```typescript
// 存储接口
interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Figma Plugin Storage 实现
class FigmaPluginStorage implements StorageService {
  async get<T>(key: string): Promise<T | null> {
    return await figma.clientStorage.getAsync(key);
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    await figma.clientStorage.setAsync(key, value);
  }
}

// 缓存策略
class CacheManager {
  private cache: Map<string, CacheItem> = new Map();
  
  set(key: string, value: any, ttl: number): void;
  get(key: string): any | null;
  invalidate(pattern: string): void;
  clear(): void;
}
```

## 5. API 集成架构

### 5.1 翻译 API 集成

#### 5.1.1 OpenAI API 集成
```typescript
class OpenAIClient {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';
  
  async translate(request: OpenAITranslateRequest): Promise<OpenAITranslateResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(request.targetLang),
          },
          {
            role: 'user',
            content: request.text,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });
    
    return this.parseResponse(response);
  }
}
```

#### 5.1.2 Gemini API 集成
```typescript
class GeminiClient {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  
  async translate(request: GeminiTranslateRequest): Promise<GeminiTranslateResponse> {
    const response = await fetch(
      `${this.baseURL}/models/${request.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: this.buildPrompt(request.text, request.targetLang),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000,
          },
        }),
      }
    );
    
    return this.parseResponse(response);
  }
}
```

### 5.2 API 错误处理和重试

#### 5.2.1 错误处理策略
```typescript
// 错误类型定义
enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVER_ERROR = 'SERVER_ERROR',
}

// 错误处理器
class APIErrorHandler {
  handle(error: APIError): APIErrorResponse {
    switch (error.type) {
      case APIErrorType.RATE_LIMIT:
        return { retry: true, delay: 5000, message: '请求频率过快，请稍后重试' };
      case APIErrorType.AUTH_ERROR:
        return { retry: false, message: 'API 密钥无效，请检查配置' };
      case APIErrorType.QUOTA_EXCEEDED:
        return { retry: false, message: 'API 配额已用完，请检查账户余额' };
      default:
        return { retry: true, delay: 1000, message: '网络错误，正在重试' };
    }
  }
}

// 重试机制
class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
}
```

## 6. 安全架构

### 6.1 数据安全

#### 6.1.1 API 密钥安全存储
```typescript
// 加密存储服务
class SecureStorage {
  private encryptionKey: string;
  
  async storeAPIKey(service: string, apiKey: string): Promise<void> {
    const encrypted = await this.encrypt(apiKey);
    await figma.clientStorage.setAsync(`apikey_${service}`, encrypted);
  }
  
  async getAPIKey(service: string): Promise<string | null> {
    const encrypted = await figma.clientStorage.getAsync(`apikey_${service}`);
    if (!encrypted) return null;
    return await this.decrypt(encrypted);
  }
  
  private async encrypt(text: string): Promise<string> {
    // 实现加密逻辑
  }
  
  private async decrypt(encryptedText: string): Promise<string> {
    // 实现解密逻辑
  }
}
```

#### 6.1.2 数据隐私保护
```typescript
// 数据清理策略
class DataPrivacyManager {
  async cleanSensitiveData(): Promise<void> {
    // 清理临时翻译数据
    await this.clearTranslationCache();
    
    // 清理过期的翻译记忆
    await this.cleanExpiredMemories();
    
    // 清理调试日志
    await this.clearDebugLogs();
  }
  
  shouldStoreTranslation(text: string): boolean {
    // 检查是否包含敏感信息
    return !this.containsSensitiveInfo(text);
  }
  
  private containsSensitiveInfo(text: string): boolean {
    // 实现敏感信息检测逻辑
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // 信用卡号
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // 邮箱
      /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(text));
  }
}
```

## 7. 性能优化架构

### 7.1 前端性能优化

#### 7.1.1 组件优化策略
```typescript
// 组件懒加载
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const FontMappingModal = lazy(() => import('./components/FontMappingModal'));

// 组件记忆化
const TranslateButton = memo<TranslateButtonProps>(({ onTranslate, isLoading }) => {
  return (
    <Button onClick={onTranslate} disabled={isLoading}>
      {isLoading ? 'Translating...' : 'Translate'}
    </Button>
  );
});

// 计算结果缓存
const useTranslationCost = (request: TranslateRequest) => {
  return useMemo(() => {
    return calculateCost(request);
  }, [request.texts.length, request.engine, request.model]);
};
```

#### 7.1.2 数据优化策略
```typescript
// 虚拟化长列表
import { FixedSizeList as List } from 'react-window';

const TranslationHistory: React.FC = () => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TranslationHistoryItem item={historyItems[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={historyItems.length}
      itemSize={60}
    >
      {Row}
    </List>
  );
};

// 防抖处理
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### 7.2 API 调用优化

#### 7.2.1 批量处理策略
```typescript
// 批量翻译管理器
class BatchTranslationManager {
  private batchSize = 10;
  private concurrentLimit = 3;
  
  async translateBatch(texts: TextInfo[], options: TranslateOptions): Promise<Translation[]> {
    const batches = this.splitIntoBatches(texts, this.batchSize);
    const results: Translation[] = [];
    
    // 使用信号量控制并发
    const semaphore = new Semaphore(this.concurrentLimit);
    
    const promises = batches.map(async (batch) => {
      await semaphore.acquire();
      try {
        const batchResults = await this.translateSingleBatch(batch, options);
        results.push(...batchResults);
      } finally {
        semaphore.release();
      }
    });
    
    await Promise.all(promises);
    return results;
  }
}

// 信号量实现
class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];
  
  constructor(permits: number) {
    this.permits = permits;
  }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }
  
  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}
```

## 8. 测试架构

### 8.1 测试策略

#### 8.1.1 单元测试
```typescript
// 组件测试示例
describe('TranslateButton', () => {
  it('should call onTranslate when clicked', async () => {
    const mockOnTranslate = jest.fn();
    render(<TranslateButton onTranslate={mockOnTranslate} isLoading={false} />);
    
    const button = screen.getByText('Translate');
    fireEvent.click(button);
    
    expect(mockOnTranslate).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when loading', () => {
    render(<TranslateButton onTranslate={jest.fn()} isLoading={true} />);
    
    const button = screen.getByText('Translating...');
    expect(button).toBeDisabled();
  });
});

// 服务测试示例
describe('OpenAITranslationService', () => {
  let service: OpenAITranslationService;
  
  beforeEach(() => {
    service = new OpenAITranslationService('test-api-key');
  });
  
  it('should translate text correctly', async () => {
    const mockResponse = { translatedText: 'Hola mundo' };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);
    
    const result = await service.translate({
      text: 'Hello world',
      targetLang: 'es',
      model: 'gpt-3.5-turbo-instruct',
    });
    
    expect(result.translatedText).toBe('Hola mundo');
  });
});
```

#### 8.1.2 集成测试
```typescript
// Figma API 集成测试
describe('FigmaService Integration', () => {
  let figmaService: FigmaService;
  
  beforeEach(() => {
    // 模拟 Figma API
    global.figma = {
      currentPage: {
        selection: [],
        children: [],
      },
      createText: jest.fn(),
      // 其他 Figma API 模拟
    };
    
    figmaService = new FigmaService();
  });
  
  it('should get selected text nodes', () => {
    const mockTextNode = createMockTextNode('Hello world');
    global.figma.currentPage.selection = [mockTextNode];
    
    const textNodes = figmaService.getSelectedTextNodes();
    expect(textNodes).toHaveLength(1);
    expect(textNodes[0].characters).toBe('Hello world');
  });
});
```

### 8.2 E2E 测试架构

#### 8.2.1 Figma Plugin E2E 测试
```typescript
// E2E 测试框架
class FigmaPluginE2ETest {
  async loadPlugin(): Promise<void> {
    // 加载插件到 Figma 环境
  }
  
  async selectTextNode(nodeId: string): Promise<void> {
    // 选择文本节点
  }
  
  async openPlugin(): Promise<void> {
    // 打开插件界面
  }
  
  async translate(targetLang: string): Promise<void> {
    // 执行翻译操作
  }
  
  async verifyTranslation(expectedText: string): Promise<void> {
    // 验证翻译结果
  }
}

// E2E 测试用例
describe('Translation E2E Flow', () => {
  let e2eTest: FigmaPluginE2ETest;
  
  beforeEach(async () => {
    e2eTest = new FigmaPluginE2ETest();
    await e2eTest.loadPlugin();
  });
  
  it('should complete full translation flow', async () => {
    // 1. 选择文本节点
    await e2eTest.selectTextNode('text-node-1');
    
    // 2. 打开插件
    await e2eTest.openPlugin();
    
    // 3. 选择目标语言并翻译
    await e2eTest.translate('spanish');
    
    // 4. 验证结果
    await e2eTest.verifyTranslation('Hola mundo');
  });
});
```

## 9. 部署和发布架构

### 9.1 构建流程

#### 9.1.1 Webpack 配置
```typescript
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    code: './src/main/code.ts',
    ui: './src/ui/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

#### 9.1.2 发布流程
```typescript
// 发布脚本
{
  "scripts": {
    "build": "webpack --mode=production",
    "dev": "webpack --mode=development --watch",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "type-check": "tsc --noEmit",
    "package": "npm run build && npm run test && npm run lint",
    "publish": "figma-plugin publish"
  }
}
```

### 9.2 版本管理

#### 9.2.1 语义化版本控制
```json
{
  "version": "1.0.0",
  "releases": {
    "1.0.0": "初始版本发布",
    "1.1.0": "新增 Gemini 引擎支持",
    "1.2.0": "新增字体映射功能",
    "2.0.0": "重大架构升级"
  }
}
```

## 10. 监控和维护

### 10.1 错误监控

#### 10.1.1 错误收集和报告
```typescript
// 错误监控服务
class ErrorMonitor {
  static reportError(error: Error, context?: any): void {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      pluginVersion: process.env.PLUGIN_VERSION,
      context,
    };
    
    // 发送错误报告到监控服务
    this.sendErrorReport(errorReport);
  }
  
  private static async sendErrorReport(report: ErrorReport): Promise<void> {
    try {
      // 实现错误报告发送逻辑
    } catch (e) {
      // 静默处理监控服务错误
      console.warn('Failed to send error report:', e);
    }
  }
}

// 全局错误处理
window.addEventListener('error', (event) => {
  ErrorMonitor.reportError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorMonitor.reportError(new Error(event.reason), {
    type: 'unhandledrejection',
  });
});
```

### 10.2 性能监控

#### 10.2.1 性能指标收集
```typescript
// 性能监控服务
class PerformanceMonitor {
  static trackTranslationPerformance(
    engine: string,
    textCount: number,
    duration: number
  ): void {
    const metrics = {
      engine,
      textCount,
      duration,
      throughput: textCount / duration * 1000, // texts per second
      timestamp: Date.now(),
    };
    
    this.sendMetrics('translation_performance', metrics);
  }
  
  static trackUIPerformance(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: this.getFirstPaintTime(),
      };
      
      this.sendMetrics('ui_performance', metrics);
    }
  }
}
```

---

**文档维护说明**：
本架构文档将随着项目的发展持续更新，每次架构调整都会记录变更历史和影响分析。所有开发人员都应该遵循本文档定义的架构规范进行开发。