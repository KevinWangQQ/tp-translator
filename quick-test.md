# 🚀 快速测试 MVP

## 一键测试步骤

### 1. 在 Figma 中加载插件
```
1. 打开 Figma (Desktop 或 Web)
2. 右键 → Plugins → Development → Import plugin from manifest
3. 选择项目根目录的 manifest.json
4. 点击 Plugins → Development → Advanced Translator
```

### 2. 5分钟基础测试
```
✅ 插件界面加载成功
✅ 创建文本框输入 "Hello World"
✅ 选择文本框，观察插件界面更新
✅ 点击 "Get Selection Info" 按钮
✅ 点击 "Translate Test" 按钮，等待模拟翻译结果
```

### 3. 检查控制台（F12）
```
应该看到：
- "Figma Translator Plugin loaded"
- "UI received message: plugin-ready"  
- "Received message: get-selection"
- "UI received message: selection-changed"
```

## 🎯 成功标准
- [ ] 插件正常加载显示界面
- [ ] 能检测文本节点选择
- [ ] 模拟翻译功能工作
- [ ] 控制台无红色错误

## 🐛 如果有问题
1. 重新构建：`npm run build`
2. 检查 dist/ 目录文件是否齐全
3. 查看 Figma 控制台错误信息
4. 重新导入 manifest.json

---
**测试愉快！如有问题请截图错误信息。**