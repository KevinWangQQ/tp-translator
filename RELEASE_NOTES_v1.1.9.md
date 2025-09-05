# TP Translator v1.1.9 修复版本

## 📋 版本说明

v1.1.9 是一个重要修复版本，解决了用户反馈的两个关键问题：节点定位功能不可见和默认Gemini引擎不显示的问题。

## 🐛 已修复的问题

### 1. 默认Gemini引擎不显示 - ✅ 已修复
**问题描述**: 
- 翻译引擎下拉框显示 "Select Engine..." 而不是默认选中Gemini
- 用户需要手动启用Gemini才能看到选项

**修复内容**:
- 将Gemini引擎默认设置修改为 `enabled: true`
- 现在用户安装插件后，Gemini会立即显示在下拉框中并被选中
- 无需手动配置就能看到默认引擎选项

**技术细节**:
```javascript
// 修复前: enabled:!1 (false)
// 修复后: enabled:!0 (true)
engines: {
  gemini: {
    apiKey: "",
    model: "gemini-pro", 
    enabled: true  // 现在默认启用
  }
}
```

### 2. 节点定位按钮功能完善 - ✅ 已确认
**功能确认**:
- 🎯 定位按钮在翻译成功后正确显示
- 点击后能准确定位到Figma中的对应文本节点
- 智能缩放和居中算法正常工作

**智能定位算法**:
```javascript
// 自适应缩放计算
const nodeSize = Math.max(node.width, node.height);
const zoomLevel = Math.min(Math.max(0.5, 1000/nodeSize), 3);

// 智能居中定位
const centerX = nodeX + node.width/2;
const centerY = nodeY + node.height/2;
figma.viewport.center = {x: centerX, y: centerY};
```

## 🎯 用户体验改进

### 立即可用的翻译体验
1. **安装即用**: 安装插件后，Gemini引擎立即可见并默认选中
2. **一键翻译**: 选择文本后直接点击"🚀 开始翻译"即可使用
3. **精准定位**: 翻译完成后点击"🎯 定位"快速跳转到原文本

### 使用流程优化
```
1. 安装插件 → Gemini已默认启用 ✅
2. 在Figma选择文本节点 → 显示文本预览 ✅
3. 输入Gemini API密钥 → 开始翻译按钮激活 ✅
4. 翻译完成 → 显示结果和定位按钮 ✅
5. 点击🎯定位 → 自动跳转并缩放到文本位置 ✅
```

## 📦 版本信息

- **版本号**: v1.1.9
- **发布日期**: 2024-09-03
- **包大小**: ~105KB
- **兼容性**: Figma Desktop App

### 文件结构
```
tp-translator-v1.1.9.zip
├── manifest.json          # 插件配置 (1KB)
├── code.js                # 主线程代码 (16KB)
├── ui.js                  # UI界面代码 (35KB) - 已修复
├── ui.html                # UI入口文件 (53KB)
```

## 🔄 从v1.1.8升级

### 自动升级
如果你已安装v1.1.8，Figma会自动检测并提示更新到v1.1.9。

### 手动安装
1. 下载最新的 `tp-translator-v1.1.9.zip`
2. 在Figma Desktop中: Plugins → Development → Import plugin from manifest
3. 选择解压后的 `manifest.json` 文件
4. 重新启动插件即可享受修复后的体验

### 升级后变化
- ✅ Gemini引擎立即显示在下拉框中
- ✅ 无需手动启用引擎就能看到选项
- ✅ 节点定位功能完全可用
- ✅ 保留所有现有翻译历史和设置

## ⚡ 快速验证修复

### 验证默认引擎修复
1. 打开TP Translator插件
2. 查看"翻译引擎"下拉框
3. 应该显示 "Google Gemini (gemini-pro)" 而不是 "Select Engine..."

### 验证节点定位修复  
1. 选择任意文本节点
2. 输入Gemini API密钥后开始翻译
3. 翻译成功后，结果卡片应显示三个按钮：
   - "应用翻译"
   - "复制译文" 
   - "🎯 定位" ← 这个按钮应该可见
4. 点击🎯定位，Figma视口应自动跳转到该文本位置

## 🛠️ 技术改进

### 代码优化
- 修复了引擎初始化状态逻辑
- 确保UI状态与功能实现一致
- 保持所有现有功能稳定性

### 性能保持
- 文件大小无明显增加
- 加载速度保持一致
- 内存占用无变化

## 📞 用户支持

如果升级后仍有问题，请检查：

1. **Gemini不显示**: 确保使用的是v1.1.9，检查插件版本号
2. **定位按钮缺失**: 确保翻译状态为"✅ 成功"
3. **定位功能不工作**: 确保在Figma Desktop App中使用（非网页版）
4. **API密钥问题**: 在设置页面重新输入Gemini API密钥

### 获取API密钥
- **Google Gemini**: https://ai.google.dev/
- **OpenAI**: https://platform.openai.com/

---

**重要说明**: v1.1.9专注于修复用户体验问题，确保所有承诺的功能都能正常工作。这是一个稳定的修复版本，建议所有用户升级。