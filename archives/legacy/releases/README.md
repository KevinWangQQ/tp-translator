# Figma翻译插件 - 版本发布管理

## 📁 目录结构

```
releases/
├── README.md           # 本文档 - 版本管理指南
├── latest/            # 当前最新版本（用户下载）
│   └── tp-translator-v1.1.8.zip
└── archives/          # 历史版本存档
    ├── cube-translator-v1.0.0.zip
    ├── cube-translator-v1.1.0.zip
    ├── cube-translator-v1.1.1.zip
    ├── cube-translator-v1.1.2.zip
    ├── cube-translator-v1.1.3.zip
    ├── cube-translator-v1.1.4.zip
    ├── cube-translator-v1.1.5.zip
    ├── cube-translator-v1.1.6.zip
    ├── tp-translator-v1.1.7.zip
    └── tp-translator-v1.1.8.zip
```

## 🏷️ 版本历史

### 当前版本：TP Translator v1.1.8
- **发布日期**: 2024-09-03
- **状态**: 功能确认版本
- **主要特性**:
  - 🎯 智能节点定位功能
  - 🤖 默认Gemini引擎设置
  - 🔌 品牌更新 (Cube → TP Translator)
  - 📖 详细用户使用指南

### 历史版本演进

#### v1.1.7 (TP Translator首版)
- 品牌重塑：Cube Translator → TP Translator
- 新增节点定位功能
- 默认引擎设置为Gemini
- 完整功能实现版本

#### v1.1.5-1.1.6 (Cube Translator最终版)
- 完善翻译引擎支持
- 优化用户界面体验
- 修复已知问题

#### v1.1.0-1.1.4 (功能完善期)
- 多引擎支持 (OpenAI + Gemini)
- 字体映射功能
- 翻译模式选择
- 用户配置持久化

#### v1.0.0 (初始版本)
- 基础翻译功能
- Figma API集成
- 简单UI界面

## 📦 发布管理规范

### 命名约定
```bash
# 格式：{plugin-name}-v{version}.zip
# 示例：
tp-translator-v1.1.8.zip
cube-translator-v1.1.5.zip
```

### 文件夹管理规则

#### `/latest/` 目录
- **用途**: 存放当前推荐给用户的最新稳定版本
- **规则**: 
  - 只保留一个版本包
  - 新版本发布时替换旧版本
  - 用户下载的主要来源

#### `/archives/` 目录
- **用途**: 完整的版本历史存档
- **规则**:
  - 保留所有历史版本包
  - 按版本号升序排列
  - 永不删除，用于版本回退和历史追踪

### 新版本发布流程

#### 1. 代码准备
```bash
# 构建生产版本
npm run build

# 运行质量检查
npm run lint
npm run type-check
npm test

# 创建发布包
npm run package
```

#### 2. 版本标记
```bash
# 创建git标签
git tag -a v1.1.9 -m "Release version 1.1.9"

# 推送标签到远程
git push origin v1.1.9
```

#### 3. 包文件管理
```bash
# 1. 将新版本包放入archives/
cp tp-translator-v1.1.9.zip releases/archives/

# 2. 更新latest/目录
rm releases/latest/*.zip
cp tp-translator-v1.1.9.zip releases/latest/

# 3. 更新版本文档
# 编辑 releases/README.md 中的版本历史
```

#### 4. 发布记录
- 更新 `RELEASE_NOTES_v{version}.md`
- 更新本文档的版本历史部分
- 提交所有changes到git仓库

## 🔄 版本回退指南

### 快速回退到指定版本
```bash
# 从archives/目录复制指定版本到latest/
cp releases/archives/tp-translator-v1.1.7.zip releases/latest/

# 重命名为当前版本（可选）
cd releases/latest/
mv tp-translator-v1.1.7.zip tp-translator-current.zip
```

### 代码回退
```bash
# 查看所有标签
git tag -l

# 回退到指定标签
git checkout v1.1.7

# 创建新分支继续开发（推荐）
git checkout -b hotfix-from-v1.1.7
```

## 📊 版本统计

- **总版本数**: 10个版本
- **品牌变更**: v1.1.7 (Cube → TP Translator)
- **主要功能节点**: 
  - v1.0.0: 基础功能
  - v1.1.0: 多引擎支持
  - v1.1.5: 功能稳定版
  - v1.1.7: 品牌重塑
  - v1.1.8: 功能确认版

## 🛠️ 维护建议

### 定期清理
- archives/ 目录不建议删除文件
- latest/ 目录只保留一个最新版本
- 定期检查包文件完整性

### 备份策略
- archives/ 目录应纳入版本控制
- 重要版本额外备份到云存储
- 建议每月检查一次文件完整性

### 自动化建议
可考虑添加自动化脚本：
```bash
#!/bin/bash
# release.sh - 自动化发布脚本
VERSION=$1
PLUGIN_NAME="tp-translator"

# 构建和测试
npm run build && npm run test

# 创建发布包
npm run package

# 更新版本文件
./update-version.sh $VERSION

# 移动文件到正确位置
cp ${PLUGIN_NAME}-v${VERSION}.zip releases/archives/
cp ${PLUGIN_NAME}-v${VERSION}.zip releases/latest/

echo "✅ Version $VERSION released successfully!"
```

---

**维护人员**: Claude Code  
**最后更新**: 2024-09-03  
**文档版本**: v1.0