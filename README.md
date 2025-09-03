# TP Translator

> 智能Figma翻译插件，支持多AI引擎和节点定位功能

[![Version](https://img.shields.io/badge/version-1.1.7-blue.svg)](https://github.com/your-username/tp-translator/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Figma](https://img.shields.io/badge/platform-Figma-orange.svg)](https://www.figma.com/)

## ✨ 功能特性

### 🌍 多引擎翻译
- **OpenAI GPT 系列**: gpt-3.5-turbo-instruct, gpt-4, gpt-4-turbo
- **Google Gemini 系列**: gemini-pro, gemini-1.5-pro, gemini-1.5-flash
- 智能引擎选择和自动重试机制

### 🎯 智能节点定位
- 一键定位翻译结果对应的Figma节点
- 智能视口缩放和居中显示
- 自适应缩放算法确保最佳视觉效果

### 🎨 多种输出模式
- **替换模式**: 直接替换原文本
- **并排模式**: 在原文本旁显示翻译
- **新框架**: 创建新框架显示翻译结果
- **新页面**: 在新页面中展示翻译内容

### ⚡ 高效体验
- 批量文本处理
- 实时翻译进度显示
- 翻译历史记录
- 设置导入导出

## 🚀 快速开始

### 安装方法

#### 方法1: 从GitHub Releases安装
1. 访问 [Releases](https://github.com/your-username/tp-translator/releases) 页面
2. 下载最新版本的 `tp-translator-v1.1.7.zip`
3. 解压到本地文件夹
4. 在Figma中导入插件

#### 方法2: 开发者安装
```bash
git clone https://github.com/your-username/tp-translator.git
cd tp-translator
```

### Figma中导入插件
1. 打开 **Figma桌面应用** (必须使用桌面版)
2. 选择 `Plugins` → `Development` → `Import plugin from manifest...`
3. 选择解压后的 `manifest.json` 文件
4. 安装完成！

## 🔧 使用指南

### 基础使用
1. **选择文本**: 在Figma中选择包含文本的节点
2. **打开插件**: `Plugins` → `Development` → `TP Translator`
3. **配置API**: 在设置中添加OpenAI或Gemini API密钥
4. **选择语言**: 设置源语言和目标语言
5. **开始翻译**: 点击"开始翻译"按钮

### 高级功能
- **🎯 节点定位**: 在翻译结果中点击定位按钮快速跳转到原节点
- **📚 历史管理**: 查看和重用之前的翻译设置
- **💾 设置同步**: 导出/导入配置文件实现设置同步

## 🛠️ 技术规格

### 文件结构
```
tp-translator/
├── manifest.json          # Figma插件配置
├── code.js                # 主线程代码(16KB)
├── ui.html               # UI界面入口(54KB)
├── ui.js                 # UI逻辑和样式(35KB)
├── README.md             # 项目说明
└── RELEASE_NOTES_v1.1.7.md # 版本说明
```

## 🔄 版本历史

### v1.1.7 (2024-09-02) - 当前版本
- ✅ 品牌更新为TP Translator
- ✅ 新增智能节点定位功能
- ✅ 默认引擎改为Google Gemini
- ✅ 智能视口控制算法
- ✅ 优化用户体验

### v1.1.5 (历史版本)
- 基础翻译功能
- 多引擎支持
- 自动重试机制

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork** 本仓库
2. **创建** 特性分支: `git checkout -b feature/amazing-feature`
3. **提交** 更改: `git commit -m 'Add amazing feature'`
4. **推送** 分支: `git push origin feature/amazing-feature`
5. **创建** Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🐛 问题反馈

遇到问题或有建议？欢迎：

- 🐛 [提交Issue](https://github.com/your-username/tp-translator/issues)
- 💡 [功能建议](https://github.com/your-username/tp-translator/issues/new?template=feature_request.md)
- 📧 发送邮件到: your-email@example.com

---

**TP Translator** - 让Figma翻译更智能、更高效！

⭐ 如果这个项目对你有帮助，别忘了给个Star！