# Manifest.json 修复说明

## 🐛 问题描述
v1.2.1初次发布时，manifest.json包含了"version"字段，但Figma插件规范不支持这个字段，导致安装时出现错误：
```
Manifest error: Manifest has unexpected extra property: version
```

## ✅ 修复内容
1. **移除version字段**: 从manifest.json中移除了"version": "1.2.1"字段
2. **更新发布脚本**: 修改了release.sh，避免以后自动添加version字段
3. **重新打包**: 生成了修复版本的tp-translator-v1.2.1.zip

## 📦 修复后的文件
- **修复时间**: 2024-09-05 10:59
- **包大小**: 29KB (略微增加，但内容正确)
- **影响范围**: 仅manifest.json配置文件
- **功能影响**: 无，所有v1.2.1新功能保持不变

## ✅ 验证结果
- ✅ 包完整性测试通过
- ✅ Manifest.json格式符合Figma规范
- ✅ 所有插件功能文件完整
- ✅ 发布脚本已更新避免重复问题

## 📋 使用说明
现在可以正常安装tp-translator-v1.2.1.zip，不会再出现manifest错误。
所有v1.2.1的用户体验增强功能都可以正常使用。

---
修复完成时间: 2024-09-05 10:59