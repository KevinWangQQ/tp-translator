# Advanced Figma Translator - 发布指南

## 📦 发布包内容

### 文件结构
```
Advanced-Figma-Translator-v1.0.0/
├── manifest.json          # Figma插件清单文件 (必需)
├── code.js               # 主线程代码 (必需)
├── ui.html               # 用户界面 (必需)
├── README.md             # 用户使用指南
├── API-SETUP.md          # API配置详细教程
└── CHANGELOG.md          # 版本更新日志
```

### 文件说明

**核心文件（必需）:**
- `manifest.json` - Figma插件配置文件，定义插件名称、权限等
- `code.js` - 压缩后的主线程代码，包含翻译引擎和Figma API交互逻辑
- `ui.html` - 完整的用户界面，包含所有样式和JavaScript代码

**文档文件:**
- `README.md` - 完整的用户使用指南和安装说明
- `API-SETUP.md` - 详细的API密钥配置教程
- `CHANGELOG.md` - 版本历史和功能说明

## 📥 用户安装方法

### 方法1: 开发者模式安装（推荐）

1. **下载插件包**
   - 解压 `Advanced-Figma-Translator-v1.0.0.zip`
   - 保持所有文件在同一文件夹中

2. **在Figma中安装**
   - 打开Figma桌面应用
   - 菜单: `Plugins` → `Development` → `Import plugin from manifest...`
   - 选择解压后文件夹中的 `manifest.json` 文件
   - 插件自动安装完成

3. **开始使用**
   - 菜单: `Plugins` → `Advanced Figma Translator` → `🌍 Advanced Translator`

### 方法2: 拖拽安装

1. 解压插件包到本地文件夹
2. 将整个文件夹拖拽到Figma界面
3. Figma自动识别并安装插件

## 🔧 技术规格

### 构建信息
- **构建工具**: Webpack 5
- **TypeScript**: 5.1.0
- **压缩**: 生产模式，已优化
- **兼容性**: Figma Plugin API 1.0.0

### 文件大小
- `code.js`: 8.7KB (已压缩)
- `ui.html`: 15.5KB (包含所有资源)
- 总大小: ~25KB

### 权限要求
- `currentuser`: 访问当前用户信息
- `documentAccess`: 动态页面访问
- `networkAccess`: 访问OpenAI和Google AI服务

## 🌐 网络要求

### 外部API访问
插件需要访问以下域名：
- `https://api.openai.com` - OpenAI GPT服务
- `https://generativelanguage.googleapis.com` - Google Gemini服务

### 防火墙配置
企业用户可能需要在防火墙中允许访问上述域名。

## 🔒 安全性说明

### 数据安全
- ✅ API密钥仅存储在用户本地
- ✅ 使用HTTPS加密传输
- ✅ 不保存用户翻译内容
- ✅ 符合Figma插件安全标准

### 隐私保护
- 翻译内容通过加密连接发送到AI服务
- 不收集用户个人信息
- 不向第三方分享数据

## 📋 系统要求

### Figma版本
- Figma桌面应用 (Windows/Mac/Linux)
- 不支持Figma网页版

### 操作系统
- Windows 10/11
- macOS 10.14+
- Linux (Ubuntu 18.04+)

### 网络环境
- 稳定的互联网连接
- 某些地区可能需要VPN访问AI服务

## ⚠️ 使用注意事项

### API费用
- OpenAI和Google AI按使用量计费
- 建议设置API使用限制
- 监控月度账单避免超支

### 使用限制
- 遵守各AI服务商的使用条款
- 不用于生成有害或违法内容
- 商业使用请查看相关许可证

## 🆘 故障排除

### 常见问题
1. **插件无法加载**
   - 确认使用Figma桌面版
   - 检查所有文件是否完整
   - 重新导入manifest.json

2. **翻译失败**
   - 验证API密钥是否正确
   - 检查网络连接
   - 确认API账户余额

3. **界面显示异常**
   - 刷新插件界面
   - 重启Figma应用
   - 检查浏览器控制台错误

### 获取帮助
- 查看README.md获取详细使用说明
- 检查API-SETUP.md配置API密钥
- 联系开发者获取技术支持

## 📈 版本管理

### 当前版本
- **版本号**: 1.0.0
- **发布日期**: 2024-09-02
- **构建标识**: advanced-figma-translator-v1

### 更新检查
插件目前不支持自动更新，新版本发布时需要：
1. 下载新版本插件包
2. 重新导入manifest.json文件
3. 旧版本会自动替换

---

**开发者**: Kevin  
**技术支持**: kevin@example.com  
**项目地址**: https://github.com/kevin/figma-translator