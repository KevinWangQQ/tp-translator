# 🚀 Cube Translator v1.1.5 - 快速安装指南

## 📦 下载和解压
1. 下载 `cube-translator-v1.1.5-自动重试版.zip`
2. 解压到任意本地文件夹
3. 记住解压后的文件夹位置

## 🎯 安装到Figma

### 第1步：打开Figma桌面版
⚠️ **重要**：必须使用Figma桌面应用，网页版不支持开发插件

### 第2步：导入插件
1. 菜单栏：`Plugins` → `Development` → `Import plugin from manifest...`
2. 浏览并选择解压文件夹中的 `manifest.json` 文件
3. 点击"Open"确认

### 第3步：启动插件
1. 菜单栏：`Plugins` → `Development` → `Advanced Translator`
2. 插件界面将在右侧打开

## ⚙️ 首次配置

### 获取API密钥
**选择任一服务商**：

#### OpenAI (推荐用于高质量翻译)
- 网址：https://platform.openai.com/api-keys
- 创建密钥后复制（以 `sk-` 开头）

#### Google Gemini (推荐用于大量翻译)
- 网址：https://makersuite.google.com/app/apikey  
- 创建密钥后复制（以 `AIza` 开头）

### 配置引擎
1. 点击插件右上角 ⚙️ 设置按钮
2. 启用OpenAI或Gemini引擎的开关
3. 输入对应的API密钥
4. 点击"Test Connection"验证
5. 保存设置

## ✅ 开始使用
1. 在Figma中选择文本图层
2. 在插件中选择翻译引擎和模型
3. 设置源语言和目标语言
4. 点击 🚀 Translate

## 🔄 v1.1.5 新增功能 - 自动重试机制
- **自动重试**: 翻译应用失败时自动重试3次，使用指数退避延迟
- **重试按钮**: 对于"⚠️ Not applied"的翻译，点击 "🔄 Retry" 手动重试
- **智能延迟**: 重试间隔递增(1s→1.5s→2.25s)，避免API限制
- **状态反馈**: 重试过程中实时显示状态和错误信息

## 🆘 需要帮助？
- 详细说明：查看 `USER_GUIDE.md`
- 问题反馈：GitHub Issues

**安装成功！享受更可靠的AI翻译体验！** 🎉