# 容器内文本识别修复

## 问题描述
之前的版本在选中组合（Group）、框架（Frame）或其他容器时，无法识别其中包含的文本节点，导致翻译功能无法正常工作。

## 修复方案

### 1. 递归文本查找
```typescript
// 新增递归查找函数
private findTextNodesInNode(node: any): any[] {
  const textNodes: any[] = [];
  
  if (node.type === 'TEXT') {
    textNodes.push(node);
  } else if ('children' in node) {
    // 递归查找子节点中的文本
    for (const child of node.children) {
      textNodes.push(...this.findTextNodesInNode(child));
    }
  }
  
  return textNodes;
}
```

### 2. 增强的文本节点获取
```typescript
getSelectedTextNodes() {
  const allTextNodes: any[] = [];
  
  // 遍历所有选中的节点
  for (const selectedNode of figma.currentPage.selection) {
    if (selectedNode.type === 'TEXT') {
      // 直接选中的文本节点
      allTextNodes.push(selectedNode);
    } else {
      // 在容器节点中查找文本节点
      const containerTextNodes = this.findTextNodesInNode(selectedNode);
      allTextNodes.push(...containerTextNodes);
    }
  }
  
  // 去重（防止重复选中）
  const uniqueTextNodes = allTextNodes.filter((node, index, arr) => 
    arr.findIndex(n => n.id === node.id) === index
  );
  
  return uniqueTextNodes;
}
```

### 3. 调试信息增强
新增了容器信息显示，便于调试：
```typescript
containerInfo: selection.map(node => ({
  id: node.id,
  type: node.type,
  name: node.name,
  hasChildren: 'children' in node ? (node as any).children.length : 0
}))
```

## 支持的容器类型

现在插件能够识别以下容器内的文本：

- **Frame** (框架)
- **Group** (组合) 
- **Component** (组件)
- **Instance** (实例)
- **Section** (区块)
- 其他任何包含children属性的容器

## 测试场景

### 测试1: 简单组合
1. 创建几个文本节点
2. 将它们组合成一个Group
3. 选中这个Group
4. 验证插件能识别其中的文本

### 测试2: 嵌套容器
1. 创建文本节点
2. 放入Frame中
3. 将Frame放入Group中
4. 选中最外层Group
5. 验证能识别深层嵌套的文本

### 测试3: 混合选择
1. 同时选中文本节点和容器
2. 验证不会出现重复的文本节点
3. 验证所有文本都能被正确翻译

## 预期行为

### 选中文本节点
- 直接翻译该文本
- 行为与之前版本相同

### 选中容器
- 自动查找容器内所有文本节点
- 显示找到的文本数量
- 批量翻译所有文本

### 混合选择
- 智能去重，避免重复翻译
- 显示总的文本节点数量
- 保持原有的翻译流程

## 日志输出

新版本会在控制台输出详细的选择分析信息：
```
Selection analysis: 1 total nodes, found 5 text nodes
```

这有助于用户了解插件识别到了多少文本节点。

---

**修复版本**: v1.1.1  
**影响范围**: 文本节点识别和选择逻辑  
**向后兼容**: 是，不影响原有功能