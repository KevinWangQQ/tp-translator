# API密钥配置指南

本插件需要AI服务的API密钥才能工作。以下是获取和配置API密钥的详细步骤。

## OpenAI API配置

### 1. 获取OpenAI API密钥

1. 访问 [OpenAI平台](https://platform.openai.com/)
2. 注册或登录你的账号
3. 进入 [API Keys页面](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 为密钥起一个名字（如 "Figma Translator"）
6. 复制生成的API密钥（格式类似：`sk-...`）

### 2. OpenAI计费信息

- 新用户通常有免费额度
- 按使用量计费，具体费用请查看 [OpenAI定价页面](https://openai.com/pricing)
- 建议设置使用限制避免意外费用

### 3. 推荐模型

- **GPT-3.5 Turbo Instruct**: 成本低，速度快，适合大量翻译
- **GPT-4**: 质量高，适合重要内容翻译

## Google Gemini API配置

### 1. 获取Gemini API密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/)
2. 使用Google账号登录
3. 点击 "Get API key"
4. 选择或创建一个Google Cloud项目
5. 复制生成的API密钥

### 2. Gemini计费信息

- 提供免费配额
- 超出免费配额后按使用量计费
- 具体费用请查看 [Gemini定价页面](https://ai.google.dev/pricing)

### 3. 推荐模型

- **Gemini Pro**: 平衡性能和成本，适合通用翻译
- **Gemini Flash**: 快速响应，适合实时翻译需求

## 插件中的配置

### 1. 选择翻译引擎
在插件界面中选择你想使用的引擎：
- OpenAI GPT
- Google Gemini

### 2. 输入API密钥
1. 在"API密钥"输入框中粘贴你的密钥
2. 密钥会安全地存储在本地
3. 每次使用插件时无需重新输入

### 3. 测试连接
点击"测试引擎"按钮验证API密钥是否有效。

## 安全注意事项

⚠️ **重要提醒**：

1. **保护你的API密钥**
   - 不要与他人分享API密钥
   - 不要在公共场所或代码中泄露密钥
   - 如果密钥泄露，立即在服务商平台删除并重新生成

2. **监控使用量**
   - 定期检查API使用量和费用
   - 设置使用限制和预算警报
   - 合理使用，避免不必要的API调用

3. **网络安全**
   - 使用HTTPS网络连接
   - 避免在不安全的网络环境中使用
   - 某些地区可能需要VPN才能访问AI服务

## 常见问题

### Q: API密钥存储在哪里？
A: API密钥仅存储在你的本地Figma客户端中，不会上传到任何服务器。

### Q: 可以同时配置多个API密钥吗？
A: 当前版本每个引擎只能配置一个API密钥，但可以同时配置OpenAI和Gemini的密钥。

### Q: 如何知道我的API使用量？
A: 可以在对应的AI服务商平台查看详细的使用统计和账单信息。

### Q: 翻译失败怎么办？
A: 请检查：
- API密钥是否正确
- 网络连接是否正常
- 账户是否有足够余额
- 是否触及了API使用限制

### Q: 哪个引擎更好？
A: 两个引擎各有优势：
- **OpenAI**: 模型选择多，翻译质量稳定
- **Gemini**: 免费配额较大，性价比高

建议都试用一下，选择最适合你需求的引擎。

## 技术支持

如果在配置API密钥时遇到问题，请：
1. 检查本文档的步骤是否都正确执行
2. 查看浏览器控制台的错误信息
3. 联系插件开发者获取帮助