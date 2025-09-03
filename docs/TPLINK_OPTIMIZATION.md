# TP-Link专用翻译优化版本

## 优化内容概述

本版本专门针对TP-Link网络设备和智能家居产品进行了翻译prompt优化，解决了翻译质量和格式问题。

### 1. 核心优化

#### 修复Gemini引号问题 ✅
- **问题**: Gemini会在翻译结果中添加不必要的引号
- **解决方案**:
  - 在prompt中明确禁止添加引号和额外格式化
  - 降低generation温度到0.05减少随机性
  - 添加stopSequences防止生成引号
  - 后处理过滤移除可能的格式化标记

#### TP-Link专业术语库 ✅
- **网络设备术语**:
  - Router → 路由器
  - Switch → 交换机
  - Access Point → 接入点
  - WiFi → WiFi（保持原样）
  - Ethernet → 以太网
  - Bandwidth → 带宽
  - Firewall → 防火墙
  - Port → 端口
  - Signal → 信号

- **智能家居术语**:
  - Smart Plug → 智能插座
  - Smart Camera → 智能摄像头
  - Smart Switch → 智能开关
  - Motion Detection → 动作检测
  - Night Vision → 夜视功能
  - Remote Control → 远程控制

#### 品牌和产品名称保护 ✅
- 保持"TP-Link"、"Archer"、"Deco"、"Tapo"为英文
- 保持型号代码不变（如"AC1900"、"AX6000"）
- 保护技术缩写（WiFi、USB、LED等）

### 2. 技术实现

#### Prompt分离和配置化
- **文件**: `/src/config/prompts.ts` - 独立的prompt配置文件
- **优势**: 
  - 便于查看和调整翻译prompt
  - 支持不同引擎的专门优化
  - 便于后续维护和版本控制

#### 双引擎优化策略
- **OpenAI**: 使用Chat Completions API配合系统提示
- **Gemini**: 专用prompt模板配合低温度参数

#### 后处理优化
```typescript
// Gemini翻译结果后处理
translatedText = translatedText
  .replace(/^["'`]+|["'`]+$/g, '') // 移除开头和结尾的引号
  .replace(/^\*\*|\*\*$/g, '') // 移除粗体标记
  .replace(/^\*|\*$/g, '') // 移除斜体标记
  .replace(/^```[\w]*\n?|\n?```$/g, '') // 移除代码块标记
  .trim();
```

### 3. 使用场景适配

本版本专门针对以下TP-Link产品UI翻译场景优化：

#### 产品范围
- 路由器（Router）系列
- 交换机（Switch）系列
- 接入点（Access Point）系列
- 智能插座（Smart Plug）系列
- 智能摄像头（Smart Camera）系列
- 其他IoT设备

#### 界面场景
- 移动应用界面
- Web管理界面
- 设备显示面板
- 设置菜单和选项
- 状态提示和错误信息

### 4. 质量保证

#### 格式保护机制
- 货币符号保持不变（¥ → ¥, $ → $）
- IP地址和MAC地址保持原样
- 型号和序列号保持不变
- 标点符号和空格保持一致

#### 一致性保证
- 统一的专业术语翻译
- 品牌名称的统一处理
- 技术缩写的标准化处理

### 5. 性能优化

#### 已实现的优化
- 并行翻译处理（3倍速度提升）
- 自动应用翻译结果
- 智能批处理避免API限制
- 优化的token配置

#### API参数调优
- **OpenAI**: temperature: 0.1, max_tokens: 500
- **Gemini**: temperature: 0.05, topP: 0.8, topK: 10

### 6. 使用指南

#### 推荐设置
- **主要引擎**: Gemini (经过特殊优化，解决引号问题)
- **备用引擎**: OpenAI (高质量翻译保障)
- **目标语言**: 简体中文 (zh-CN)

#### 最佳实践
1. 选择文本后直接开始翻译
2. 使用"replace"模式进行原地替换
3. 大批量翻译时使用"Select All Text"功能
4. 定期检查翻译记忆减少重复翻译

### 7. 测试验证

#### 测试场景
- [ ] 路由器设置界面词条翻译
- [ ] 智能设备状态信息翻译
- [ ] 错误提示和帮助文档翻译
- [ ] 产品型号和技术参数翻译

#### 预期结果
- Gemini不再添加多余引号
- 专业术语翻译一致性
- 品牌名称正确保护
- 格式和符号完整保持

---

**版本**: v1.1.0-tplink  
**更新时间**: 2024年度  
**适用场景**: TP-Link产品UI翻译