# TP Translator 项目结构说明

## 📁 标准化目录结构

```
figma-translator/
├── src/                          # 📝 源代码目录
│   ├── code.js                   # 主线程代码 (Figma API操作)
│   ├── ui.html                   # UI界面文件
│   ├── ui.js                     # UI逻辑代码 (如果分离)
│   └── manifest.json             # 插件配置文件
├── releases/                     # 🚀 版本发布目录
│   ├── v1.2.0/                   # 特定版本目录
│   │   ├── tp-translator-v1.2.0/ # 插件文件
│   │   ├── tp-translator-v1.2.0.zip # 发布包
│   │   └── RELEASE_NOTES_v1.2.0.md # 发布说明
│   └── latest -> v1.2.0/         # 指向最新稳定版的软链接
├── archives/                     # 📦 归档目录
│   ├── legacy/                   # 旧版本目录结构
│   ├── versions/                 # 已归档的版本
│   └── legacy-packages/          # 旧的压缩包
├── tools/                        # 🛠️ 管理工具
│   ├── release.sh                # 发布管理脚本
│   ├── version.sh                # 版本管理脚本
│   └── cleanup.sh                # 清理整理脚本
├── docs/                         # 📚 文档目录
└── README.md                     # 项目说明
```

## 🎯 版本管理流程

### 1. 开发阶段
- 在 `src/` 目录中进行开发
- 修改 `code.js`, `ui.html`, `manifest.json`
- 使用 git 管理代码变更

### 2. 发布新版本
```bash
# 发布稳定版本
./tools/release.sh 1.2.1

# 发布测试版本
./tools/release.sh 1.3.0 beta

# 发布修复版本
./tools/release.sh 1.2.1 hotfix
```

### 3. 版本管理
```bash
# 查看所有版本
./tools/version.sh list

# 查看特定版本信息
./tools/version.sh info 1.2.0

# 查看最新版本
./tools/version.sh latest

# 归档旧版本
./tools/version.sh archive 1.1.0
```

## 📋 文件命名规范

### 插件目录
- 格式: `tp-translator-v{版本号}`
- 示例: `tp-translator-v1.2.0`

### 发布包
- 格式: `tp-translator-v{版本号}.zip`
- 示例: `tp-translator-v1.2.0.zip`

### 发布说明
- 格式: `RELEASE_NOTES_v{版本号}.md`
- 示例: `RELEASE_NOTES_v1.2.0.md`

## 🔄 版本号规范

采用语义化版本 (Semantic Versioning):

- **MAJOR.MINOR.PATCH** (例: 1.2.0)
- **主版本.次版本.修订版**

### 版本递增规则
- **MAJOR**: 不兼容的重大更新 (1.0.0 → 2.0.0)
- **MINOR**: 向后兼容的新功能 (1.0.0 → 1.1.0)  
- **PATCH**: 向后兼容的bug修复 (1.1.0 → 1.1.1)

### 预发布版本
- Alpha: `1.1.0-alpha.1` (内部测试)
- Beta: `1.1.0-beta.1` (公开测试)
- RC: `1.1.0-rc.1` (发布候选)

## 🎛️ 工具脚本说明

### release.sh - 发布脚本
自动化版本发布流程:
- 创建版本目录
- 复制源文件
- 生成压缩包
- 更新版本信息
- 创建发布说明模板

### version.sh - 版本管理
版本信息查看和管理:
- 列出所有版本
- 显示版本详情
- 管理最新版本链接
- 归档旧版本

### cleanup.sh - 项目清理
整理项目结构:
- 清理临时文件
- 归档旧目录结构
- 整理源文件位置
- 标准化目录结构

## 📊 当前状态

### 稳定版本
- **v1.2.0**: 当前推荐的稳定版本
- 包含完整的翻译功能
- 支持 OpenAI 和 Gemini 引擎
- 词库和字体映射功能

### 开发版本
- 可在 `src/` 目录继续开发新功能
- 如需添加撤销和批量编辑功能

## 🚀 使用建议

1. **日常开发**: 在 `src/` 目录工作
2. **版本发布**: 使用 `./tools/release.sh`
3. **版本管理**: 使用 `./tools/version.sh`
4. **项目清理**: 定期运行 `./tools/cleanup.sh`

## 📞 支持

遇到问题时：
1. 查看相关版本的 `RELEASE_NOTES_*.md`
2. 检查 `VERSION_MANAGEMENT.md` 了解详细规范
3. 使用工具脚本的 `--help` 参数获取帮助

---
这个标准化结构将使项目管理更加清晰和专业。