# TP Translator 版本管理规范

## 🎯 版本管理目标

建立清晰、一致、可维护的版本管理体系，解决当前目录结构混乱、版本命名不规范的问题。

## 📋 语义化版本规范 (Semantic Versioning)

采用标准的 `MAJOR.MINOR.PATCH` 格式：

### 版本号含义
- **MAJOR** (主版本): 不兼容的重大更新
  - 例：1.0.0 → 2.0.0 (UI架构重构、API breaking changes)
  
- **MINOR** (次版本): 向后兼容的新功能
  - 例：1.0.0 → 1.1.0 (新增撤销功能、批量编辑)
  
- **PATCH** (修订版): 向后兼容的bug修复
  - 例：1.1.0 → 1.1.1 (修复JavaScript兼容性)

### 预发布版本
- **Alpha**: `1.1.0-alpha.1` - 内部测试版本
- **Beta**: `1.1.0-beta.1` - 公开测试版本
- **RC**: `1.1.0-rc.1` - 发布候选版本

## 📁 标准化目录结构

```
figma-translator/
├── src/                          # 源代码
│   ├── code.js                   # 主线程代码
│   ├── ui.html                   # UI界面
│   └── manifest.json             # 插件配置
├── dist/                         # 构建输出
├── releases/                     # 版本发布目录
│   ├── v1.2.0/                   # 特定版本
│   │   ├── tp-translator-v1.2.0/
│   │   │   ├── code.js
│   │   │   ├── ui.html
│   │   │   ├── manifest.json
│   │   │   └── README.md
│   │   ├── tp-translator-v1.2.0.zip
│   │   └── RELEASE_NOTES_v1.2.0.md
│   ├── v1.2.1/                   # 修复版本
│   └── latest -> v1.2.1/         # 软链接到最新稳定版
├── archives/                     # 历史存档
│   ├── legacy-versions/
│   └── deprecated/
└── tools/                        # 版本管理工具
    ├── release.sh
    ├── build.sh
    └── version.sh
```

## 🏷️ 文件命名规范

### 插件目录命名
- 格式: `tp-translator-v{MAJOR.MINOR.PATCH}`
- 示例: `tp-translator-v1.2.0`

### 压缩包命名
- 格式: `tp-translator-v{MAJOR.MINOR.PATCH}.zip`
- 示例: `tp-translator-v1.2.0.zip`

### 发布说明命名
- 格式: `RELEASE_NOTES_v{MAJOR.MINOR.PATCH}.md`
- 示例: `RELEASE_NOTES_v1.2.0.md`

### 特殊版本标记
- 稳定版: `tp-translator-v1.2.0-stable`
- 修复版: `tp-translator-v1.2.1-hotfix`
- 测试版: `tp-translator-v1.3.0-beta.1`

## 🔄 版本迭代流程

### 1. 开发阶段
- 在 `src/` 目录开发
- 使用 `git` 管理代码变更
- 版本号在 `manifest.json` 中更新

### 2. 构建阶段
```bash
npm run build
# 或使用自定义构建脚本
./tools/build.sh
```

### 3. 发布阶段
```bash
./tools/release.sh 1.2.1
```
自动执行：
- 创建版本目录
- 复制构建文件
- 生成压缩包
- 更新 latest 链接
- 创建 git tag

### 4. 归档阶段
- 老版本移动到 `archives/`
- 保留最近 3 个主要版本

## 🎛️ 版本状态管理

### 版本状态标记
- **Stable**: 稳定版，推荐生产使用
- **Beta**: 测试版，功能完整但可能有bug
- **Alpha**: 预览版，功能未完成
- **Deprecated**: 废弃版，不再维护
- **Archived**: 归档版，仅作历史记录

### 状态转换流程
```
Development → Alpha → Beta → RC → Stable
                               ↓
                          Deprecated → Archived
```

## 📝 发布说明规范

每个版本必须包含 `RELEASE_NOTES_v{version}.md`：

```markdown
# TP Translator v1.2.1 Release Notes

## 📊 版本信息
- **版本号**: 1.2.1
- **发布日期**: 2024-09-05
- **版本类型**: Hotfix
- **兼容性**: 向后兼容

## ✨ 新增功能
- [功能列表]

## 🐛 问题修复
- [修复列表]

## ⚠️ 破坏性变更
- [如有]

## 📋 升级说明
- [升级指南]

## 🔍 已知问题
- [如有]
```

## 🛠️ 自动化工具

将提供以下自动化脚本：

1. **build.sh** - 构建脚本
2. **release.sh** - 发布脚本
3. **version.sh** - 版本管理脚本
4. **cleanup.sh** - 清理脚本

## 📈 版本策略

### 当前版本规划
- **v1.2.x**: 稳定维护版本
- **v1.3.x**: 新功能开发版本
- **v2.0.x**: 重大架构更新

### 支持策略
- 最新稳定版: 完全支持
- 前一个主版本: 安全更新
- 更老版本: 仅归档存储

---

这个规范将使版本管理更加清晰和专业化。