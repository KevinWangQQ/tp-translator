# TP Translator 版本迭代管理使用指南

## 🎯 系统概述

这是一个完整的自动化版本管理体系，支持版本规划、开发跟踪、发布管理和历史记录自动维护。

## 📋 管理工具概览

| 脚本 | 功能 | 主要用途 |
|------|------|----------|
| `plan.sh` | 📋 版本规划 | 创建版本计划、需求规划、路线图管理 |
| `release.sh` | 🚀 版本发布 | 自动化版本发布、打包、记录更新 |
| `version.sh` | 📊 版本管理 | 版本信息查看、状态管理、历史浏览 |

## 🔄 完整工作流程

### 1. 版本规划阶段
```bash
# 创建新版本规划
./tools/plan.sh plan 1.3.0 minor

# 查看规划状态
./tools/plan.sh status

# 列出所有计划版本
./tools/plan.sh list
```

**交互式规划向导**：
- 📋 输入版本描述
- 🎯 设置开发优先级
- 📅 计划发布日期
- ✨ 列出计划功能
- 🛠️ 定义技术要求
- ⚠️ 记录注意事项

### 2. 开发阶段
```bash
# 查看版本状态
./tools/version.sh status

# 查看版本路线图
./tools/version.sh roadmap

# 在 src/ 目录进行开发
cd src/
# 编辑 code.js, ui.html, manifest.json...
```

### 3. 版本发布阶段
```bash
# 发布稳定版本
./tools/release.sh 1.3.0

# 发布测试版本
./tools/release.sh 1.4.0 beta

# 发布修复版本
./tools/release.sh 1.3.1 hotfix
```

**自动化发布流程**：
- ✅ 复制源代码文件
- 📦 创建标准化目录结构
- 🗜️ 生成发布压缩包
- 📝 创建发布说明模板
- 🔗 更新latest符号链接
- 📊 自动更新版本历史记录

### 4. 版本管理和维护
```bash
# 查看所有版本
./tools/version.sh list

# 查看版本详情
./tools/version.sh info 1.3.0

# 查看最新版本
./tools/version.sh latest

# 打开版本历史
./tools/version.sh history
```

## 📊 自动化功能详解

### 版本历史自动维护
**版本规划时**：
- 📅 自动添加到规划表格
- 🎯 记录详细的规划信息
- 📋 生成功能清单模板

**版本发布时**：
- ✅ 状态从"计划中"更新为"已发布"
- 📦 自动记录包大小和文件位置
- 📅 更新实际发布日期
- 🎯 生成使用建议

### 版本状态跟踪
```
📅 Planned -> 🚧 Development -> ✅ Released -> 📦 Archived
```

## 📁 文档系统

### 核心文档
- **VERSION_HISTORY.md**: 完整的版本迭代记录
- **VERSION_MANAGEMENT.md**: 版本管理规范文档
- **PROJECT_STRUCTURE.md**: 项目结构说明

### 自动生成内容
- ✅ 版本状态概览表格
- 📋 详细版本记录
- 🎯 版本规划路线图
- 📊 开发统计信息

## 🎨 使用示例

### 示例1：规划新版本
```bash
# 规划v1.3.0撤销功能版本
./tools/plan.sh plan 1.3.0 minor

# 输入规划信息：
# 描述：撤销和批量编辑功能增强版
# 优先级：high
# 发布日期：2024-10-01
# 功能：一键撤销所有翻译、批量编辑相同文本
# 技术要求：基于v1.2.0、保持兼容性
```

### 示例2：发布版本
```bash
# 开发完成后，发布版本
./tools/release.sh 1.3.0

# 自动完成：
# ✅ 创建 releases/v1.3.0/ 目录
# ✅ 生成 tp-translator-v1.3.0.zip 包
# ✅ 更新 VERSION_HISTORY.md
# ✅ 创建发布说明模板
```

### 示例3：查看项目状态
```bash
# 查看总体状态
./tools/version.sh status
# 输出：已发布1个，计划1个，开发0个

# 查看路线图
./tools/version.sh roadmap
# 显示：版本概览表格 + 计划版本列表
```

## 🛠️ 高级功能

### 版本计划更新
```bash
# 修改已有版本计划
./tools/plan.sh update 1.3.0
# 将打开编辑器修改计划详情
```

### 版本归档
```bash
# 归档旧版本
./tools/version.sh archive 1.1.0
# 移动到 archives/versions/ 目录
```

### 项目清理
```bash
# 清理临时文件
./tools/version.sh cleanup
# 删除.DS_Store、备份文件等
```

## ⚡ 快速命令参考

### 常用命令组合
```bash
# 🚀 快速查看项目状态
./tools/version.sh status && ./tools/version.sh roadmap

# 📋 规划到发布的完整流程
./tools/plan.sh plan 1.4.0 minor    # 规划版本
# ... 开发过程 ...
./tools/release.sh 1.4.0            # 发布版本

# 📊 版本管理概览
./tools/plan.sh status               # 规划状态
./tools/version.sh list              # 版本列表
./tools/version.sh latest            # 最新版本
```

### 帮助命令
```bash
./tools/plan.sh --help               # 规划工具帮助
./tools/release.sh --help            # 发布工具帮助
./tools/version.sh --help            # 版本工具帮助
```

## 📈 最佳实践

### 版本规划建议
1. **提前规划**：至少提前一个迭代周期规划下个版本
2. **功能分组**：相关功能放在同一个版本
3. **优先级管理**：high/medium/low 合理分配
4. **时间缓冲**：预留20%的时间缓冲

### 发布管理建议
1. **测试优先**：发布前充分测试
2. **文档同步**：发布时更新相关文档
3. **版本标记**：使用清晰的版本说明
4. **回滚准备**：保持前一个稳定版本

### 版本命名规范
- **MAJOR.MINOR.PATCH** (如 1.3.0)
- **破坏性更新**：增加MAJOR版本 (1.0.0 → 2.0.0)
- **新功能**：增加MINOR版本 (1.2.0 → 1.3.0)
- **Bug修复**：增加PATCH版本 (1.3.0 → 1.3.1)

## 🔧 故障排除

### 常见问题
1. **权限问题**：确保脚本有执行权限 `chmod +x tools/*.sh`
2. **路径问题**：在项目根目录运行脚本
3. **格式问题**：版本号使用 MAJOR.MINOR.PATCH 格式

### 恢复功能
- **备份机制**：所有修改都会创建.backup文件
- **Git保护**：所有更改都通过Git版本控制
- **手动恢复**：可以手动编辑VERSION_HISTORY.md

---

## 🎉 总结

这个版本迭代管理系统提供了：

✅ **完整的工作流程**：从规划到发布的全流程支持  
✅ **自动化维护**：版本历史和文档自动更新  
✅ **标准化管理**：统一的版本管理规范  
✅ **可视化追踪**：清晰的版本状态和进度显示  
✅ **团队协作**：标准化的规划和发布流程  

现在你拥有了专业级的版本迭代管理能力！🚀

---

*本文档随版本管理工具更新，最后更新：2024-09-05*