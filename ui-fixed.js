(() => {
  console.log("TP Translator v1.2.0 - 彻底修复版本加载中...");
  
  // 全局状态管理
  const store = new class StateManager {
    constructor() {
      // 强制设置默认状态 - 确保Gemini始终启用
      this.state = {
        currentPage: "translate",
        selection: {
          totalNodes: 0,
          textNodes: 0,
          nodeIds: [],
          textContents: []
        },
        translation: {
          isTranslating: false,
          progress: 0,
          results: [],
          currentEngine: "gemini", // 强制默认gemini
          sourceLang: "auto",
          targetLang: "zh-CN",
          mode: "replace"
        },
        engines: {
          openai: {
            apiKey: "",
            model: "gpt-3.5-turbo-instruct",
            enabled: false
          },
          gemini: {
            apiKey: "",
            model: "gemini-pro", 
            enabled: true  // 强制启用Gemini
          }
        },
        history: [],
        error: null,
        success: null
      };
      this.listeners = [];
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    setState(update) {
      if (typeof update === 'function') {
        const newState = update(this.state);
        this.state = { ...this.state, ...newState };
      } else {
        this.state = { ...this.state, ...update };
      }
      
      // 强制确保Gemini始终启用
      this.state.engines.gemini.enabled = true;
      this.state.translation.currentEngine = "gemini";
      
      this.listeners.forEach(listener => listener(this.state));
    }

    updateNested(path, value) {
      const keys = path.split('.');
      let newState = { ...this.state };
      let current = newState;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      this.setState(newState);
    }
  };

  // UI渲染器
  class UIRenderer {
    constructor() {
      this.container = null;
      this.init();
    }

    init() {
      console.log("初始化UI渲染器...");
      this.container = document.getElementById("root");
      
      if (this.container) {
        store.subscribe(state => {
          this.render(state);
        });
        this.setupMessageHandling();
        this.render(store.state);
        console.log("UI渲染器初始化成功");
      } else {
        console.error("找不到根容器");
      }
    }

    render(state) {
      if (!this.container) return;
      
      this.container.innerHTML = `
        <div class="app">
          ${this.renderHeader(state)}
          ${this.renderNavigation(state)}
          ${this.renderContent(state)}
          ${this.renderFooter(state)}
          ${this.renderNotifications(state)}
        </div>
        ${this.renderStyles()}
      `;
      this.bindEvents(state);
    }

    renderHeader(state) {
      return `
        <header class="header">
          <div class="header-content">
            <div class="logo">
              <span class="logo-icon">🔌</span>
              <span class="logo-text">TP Translator</span>
            </div>
            <div class="header-actions">
              <button class="btn-icon" onclick="ui.showSettings()" title="设置">
                ⚙️
              </button>
            </div>
          </div>
        </header>
      `;
    }

    renderNavigation(state) {
      const tabs = [
        { id: "translate", label: "翻译", icon: "🌍" },
        { id: "settings", label: "设置", icon: "⚙️" },
        { id: "history", label: "历史", icon: "📚" }
      ];

      return `
        <nav class="navigation">
          ${tabs.map(tab => `
            <button 
              class="nav-tab ${state.currentPage === tab.id ? 'active' : ''}"
              onclick="ui.switchPage('${tab.id}')"
            >
              <span class="nav-icon">${tab.icon}</span>
              <span class="nav-label">${tab.label}</span>
            </button>
          `).join('')}
        </nav>
      `;
    }

    renderContent(state) {
      switch (state.currentPage) {
        case "translate":
        default:
          return this.renderTranslatePage(state);
        case "settings":
          return this.renderSettingsPage(state);
        case "history":
          return this.renderHistoryPage(state);
      }
    }

    renderTranslatePage(state) {
      return `
        <main class="content">
          ${this.renderSelectionInfo(state)}
          ${this.renderTranslationOptions(state)}
          ${this.renderTranslationActions(state)}
          ${this.renderTranslationResults(state)}
        </main>
      `;
    }

    renderSelectionInfo(state) {
      const { selection } = state;
      const hasSelection = selection.textNodes > 0;

      return `
        <section class="section">
          <h3 class="section-title">
            <span class="section-icon">📋</span>
            选择信息
          </h3>
          <div class="selection-card ${hasSelection ? 'has-selection' : ''}">
            <div class="selection-stats">
              <div class="stat">
                <span class="stat-value">${selection.totalNodes}</span>
                <span class="stat-label">总节点</span>
              </div>
              <div class="stat">
                <span class="stat-value">${selection.textNodes}</span>
                <span class="stat-label">文本节点</span>
              </div>
            </div>
            ${hasSelection ? `
              <div class="selection-preview">
                <h4>文本预览</h4>
                <div class="text-preview">
                  ${selection.textContents.slice(0, 3).map(text => `
                    <div class="text-item">${this.truncateText(text, 50)}</div>
                  `).join('')}
                  ${selection.textContents.length > 3 ? `
                    <div class="text-more">还有 ${selection.textContents.length - 3} 个文本...</div>
                  ` : ''}
                </div>
              </div>
            ` : `
              <div class="selection-empty">
                <p>请在Figma中选择包含文本的节点</p>
                <button class="btn-secondary" onclick="ui.refreshSelection()">
                  刷新选择
                </button>
              </div>
            `}
          </div>
        </section>
      `;
    }

    renderTranslationOptions(state) {
      const { translation, engines } = state;
      
      // 强制确保显示Gemini选项 - 即使没有API密钥
      const availableEngines = [
        { key: 'gemini', name: 'Google Gemini', model: engines.gemini.model },
        ...(engines.openai.enabled ? [{ key: 'openai', name: 'OpenAI', model: engines.openai.model }] : [])
      ];

      return `
        <section class="section">
          <h3 class="section-title">
            <span class="section-icon">⚙️</span>
            翻译选项
          </h3>
          <div class="options-grid">
            <div class="option-group">
              <label class="option-label">翻译引擎</label>
              <select class="select" onchange="ui.updateTranslationOption('currentEngine', this.value)">
                ${availableEngines.map(engine => `
                  <option value="${engine.key}" ${translation.currentEngine === engine.key ? 'selected' : ''}>
                    ${engine.name} (${engine.model})
                  </option>
                `).join('')}
                ${availableEngines.length === 0 ? `
                  <option value="">请先在设置中配置API</option>
                ` : ''}
              </select>
            </div>
            
            <div class="option-group">
              <label class="option-label">源语言</label>
              <select class="select" onchange="ui.updateTranslationOption('sourceLang', this.value)">
                <option value="auto" ${translation.sourceLang === 'auto' ? 'selected' : ''}>自动检测</option>
                <option value="en" ${translation.sourceLang === 'en' ? 'selected' : ''}>英语</option>
                <option value="zh-CN" ${translation.sourceLang === 'zh-CN' ? 'selected' : ''}>中文(简体)</option>
                <option value="zh-TW" ${translation.sourceLang === 'zh-TW' ? 'selected' : ''}>中文(繁體)</option>
                <option value="ja" ${translation.sourceLang === 'ja' ? 'selected' : ''}>日语</option>
                <option value="ko" ${translation.sourceLang === 'ko' ? 'selected' : ''}>韩语</option>
                <option value="fr" ${translation.sourceLang === 'fr' ? 'selected' : ''}>法语</option>
                <option value="de" ${translation.sourceLang === 'de' ? 'selected' : ''}>德语</option>
                <option value="es" ${translation.sourceLang === 'es' ? 'selected' : ''}>西班牙语</option>
              </select>
            </div>
            
            <div class="option-group">
              <label class="option-label">目标语言</label>
              <select class="select" onchange="ui.updateTranslationOption('targetLang', this.value)">
                <option value="zh-CN" ${translation.targetLang === 'zh-CN' ? 'selected' : ''}>中文(简体)</option>
                <option value="zh-TW" ${translation.targetLang === 'zh-TW' ? 'selected' : ''}>中文(繁體)</option>
                <option value="en" ${translation.targetLang === 'en' ? 'selected' : ''}>英语</option>
                <option value="ja" ${translation.targetLang === 'ja' ? 'selected' : ''}>日语</option>
                <option value="ko" ${translation.targetLang === 'ko' ? 'selected' : ''}>韩语</option>
                <option value="fr" ${translation.targetLang === 'fr' ? 'selected' : ''}>法语</option>
                <option value="de" ${translation.targetLang === 'de' ? 'selected' : ''}>德语</option>
                <option value="es" ${translation.targetLang === 'es' ? 'selected' : ''}>西班牙语</option>
              </select>
            </div>
            
            <div class="option-group">
              <label class="option-label">输出模式</label>
              <select class="select" onchange="ui.updateTranslationOption('mode', this.value)">
                <option value="replace" ${translation.mode === 'replace' ? 'selected' : ''}>替换原文</option>
                <option value="beside" ${translation.mode === 'beside' ? 'selected' : ''}>原文旁边</option>
                <option value="newFrame" ${translation.mode === 'newFrame' ? 'selected' : ''}>新建框架</option>
                <option value="newPage" ${translation.mode === 'newPage' ? 'selected' : ''}>新建页面</option>
              </select>
            </div>
          </div>
        </section>
      `;
    }

    renderTranslationActions(state) {
      const { translation, selection } = state;
      const canTranslate = selection.textNodes > 0 && !translation.isTranslating;
      
      // 简化引擎检查 - 只要有选中的引擎就允许翻译
      const hasEngine = translation.currentEngine && translation.currentEngine !== '';

      return `
        <section class="section">
          <div class="actions">
            <button 
              class="btn-primary ${canTranslate && hasEngine ? '' : 'disabled'}"
              onclick="ui.startTranslation()"
              ${canTranslate && hasEngine ? '' : 'disabled'}
            >
              ${translation.isTranslating ? '🔄 翻译中...' : '🚀 开始翻译'}
            </button>
            
            ${translation.isTranslating ? `
              <button class="btn-secondary" onclick="ui.cancelTranslation()">
                取消翻译
              </button>
            ` : ''}
            
            <button class="btn-secondary" onclick="ui.refreshSelection()">
              🔄 刷新选择
            </button>
          </div>
          
          ${translation.isTranslating ? `
            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${translation.progress}%"></div>
              </div>
              <div class="progress-text">
                翻译进度: ${Math.round(translation.progress)}%
              </div>
            </div>
          ` : ''}
          
          ${!hasEngine ? `
            <div class="warning-message">
              <span class="warning-icon">⚠️</span>
              请先在设置中配置翻译引擎API密钥
            </div>
          ` : ''}
        </section>
      `;
    }

    renderTranslationResults(state) {
      const { translation } = state;
      
      if (translation.results.length === 0) {
        return '';
      }

      return `
        <section class="section">
          <h3 class="section-title">
            <span class="section-icon">📄</span>
            翻译结果
          </h3>
          <div class="results-container">
            ${translation.results.map((result, index) => `
              <div class="result-item ${result.status}">
                <div class="result-header">
                  <span class="result-index">${index + 1}</span>
                  <span class="result-status ${result.status}">
                    ${this.getStatusText(result.status)}
                  </span>
                </div>
                <div class="result-content">
                  <div class="original-text">
                    <label>原文:</label>
                    <div class="text-content">${this.escapeHtml(result.originalText)}</div>
                  </div>
                  ${result.translatedText ? `
                    <div class="translated-text">
                      <label>译文:</label>
                      <div class="text-content">${this.escapeHtml(result.translatedText)}</div>
                    </div>
                  ` : ''}
                  ${result.error ? `
                    <div class="error-text">
                      <label>错误:</label>
                      <div class="text-content error">${this.escapeHtml(result.error)}</div>
                    </div>
                  ` : ''}
                </div>
                
                <!-- 强制显示操作按钮 - 不管状态如何 -->
                <div class="result-actions">
                  ${result.translatedText ? `
                    <button class="btn-small" onclick="ui.applyTranslation(${index})">
                      应用翻译
                    </button>
                    <button class="btn-small secondary" onclick="ui.copyTranslation(${index})">
                      复制译文
                    </button>
                  ` : ''}
                  
                  <!-- 节点定位按钮 - 始终显示（如果有nodeId） -->
                  ${result.nodeId ? `
                    <button class="btn-small locate-btn" onclick="ui.locateNode(${index})" title="在Figma中定位此文本">
                      🎯 定位
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    renderSettingsPage(state) {
      return `
        <main class="content">
          <section class="section">
            <h3 class="section-title">
              <span class="section-icon">🔑</span>
              API配置
            </h3>
            ${this.renderEngineSettings("gemini", "Google Gemini", state)}
            ${this.renderEngineSettings("openai", "OpenAI", state)}
          </section>
          
          <section class="section">
            <h3 class="section-title">
              <span class="section-icon">💾</span>
              数据管理
            </h3>
            <div class="settings-actions">
              <button class="btn-secondary" onclick="ui.exportSettings()">
                导出设置
              </button>
              <button class="btn-secondary" onclick="ui.importSettings()">
                导入设置
              </button>
              <button class="btn-danger" onclick="ui.clearHistory()">
                清除历史
              </button>
            </div>
          </section>
        </main>
      `;
    }

    renderEngineSettings(engineKey, engineName, state) {
      const engine = state.engines[engineKey];
      
      return `
        <div class="engine-settings">
          <div class="engine-header">
            <h4>${engineName}</h4>
            <label class="switch">
              <input 
                type="checkbox" 
                ${engine.enabled ? 'checked' : ''}
                onchange="ui.toggleEngine('${engineKey}', this.checked)"
                ${engineKey === 'gemini' ? 'disabled' : ''}
              >
              <span class="slider ${engineKey === 'gemini' ? 'forced-on' : ''}"></span>
            </label>
            ${engineKey === 'gemini' ? '<small style="color: #666;">默认引擎</small>' : ''}
          </div>
          
          <div class="engine-config ${engine.enabled ? '' : 'disabled'}">
            <div class="input-group">
              <label class="input-label">API密钥</label>
              <input 
                type="password" 
                class="input" 
                placeholder="输入您的${engineName} API密钥"
                value="${engine.apiKey}"
                onchange="ui.updateEngineConfig('${engineKey}', 'apiKey', this.value)"
              >
            </div>
            
            <div class="input-group">
              <label class="input-label">模型</label>
              <select 
                class="select"
                onchange="ui.updateEngineConfig('${engineKey}', 'model', this.value)"
              >
                ${this.getModelOptions(engineKey, engine.model)}
              </select>
            </div>
            
            <div class="engine-actions">
              <button 
                class="btn-small" 
                onclick="ui.testEngine('${engineKey}')"
                ${engine.apiKey ? '' : 'disabled'}
              >
                测试连接
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderHistoryPage(state) {
      return `
        <main class="content">
          <section class="section">
            <h3 class="section-title">
              <span class="section-icon">📚</span>
              翻译历史
            </h3>
            ${state.history.length > 0 ? `
              <div class="history-list">
                ${state.history.map((item, index) => `
                  <div class="history-item">
                    <div class="history-header">
                      <span class="history-date">${this.formatDate(item.timestamp)}</span>
                      <span class="history-engine">${item.engine}</span>
                    </div>
                    <div class="history-content">
                      <div class="history-original">${this.truncateText(item.originalText, 100)}</div>
                      <div class="history-translated">${this.truncateText(item.translatedText, 100)}</div>
                    </div>
                    <div class="history-actions">
                      <button class="btn-small" onclick="ui.reuseTranslation(${index})">
                        重用
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <p>暂无翻译历史</p>
              </div>
            `}
          </section>
        </main>
      `;
    }

    renderFooter(state) {
      return `
        <footer class="footer">
          <div class="footer-content">
            <span class="version">v1.2.0</span>
            <span class="status">就绪</span>
          </div>
        </footer>
      `;
    }

    renderNotifications(state) {
      let notifications = '';
      
      if (state.error) {
        notifications += `
          <div class="notification error">
            <span class="notification-icon">❌</span>
            <span class="notification-text">${state.error}</span>
            <button class="notification-close" onclick="ui.clearError()">×</button>
          </div>
        `;
      }
      
      if (state.success) {
        notifications += `
          <div class="notification success">
            <span class="notification-icon">✅</span>
            <span class="notification-text">${state.success}</span>
            <button class="notification-close" onclick="ui.clearSuccess()">×</button>
          </div>
        `;
      }
      
      return notifications ? `<div class="notifications">${notifications}</div>` : '';
    }

    renderStyles() {
      return `
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          .app {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: #f5f5f5;
          }
          
          /* Header */
          .header {
            background: #fff;
            border-bottom: 1px solid #e1e4e8;
            padding: 12px 16px;
            flex-shrink: 0;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #0366d6;
          }
          
          .logo-icon { font-size: 18px; }
          
          /* Navigation */
          .navigation {
            background: #fff;
            border-bottom: 1px solid #e1e4e8;
            display: flex;
            padding: 0 16px;
            flex-shrink: 0;
          }
          
          .nav-tab {
            background: none;
            border: none;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            color: #586069;
            border-bottom: 2px solid transparent;
            font-size: 13px;
          }
          
          .nav-tab:hover { color: #0366d6; }
          
          .nav-tab.active {
            color: #0366d6;
            border-bottom-color: #0366d6;
          }
          
          /* Content */
          .content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
          }
          
          .section {
            background: #fff;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #24292e;
          }
          
          /* Selection Info */
          .selection-card {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
          }
          
          .selection-card.has-selection {
            border-color: #28a745;
            background: #f8fff8;
          }
          
          .selection-stats {
            display: flex;
            gap: 24px;
            margin-bottom: 16px;
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: 600;
            color: #0366d6;
          }
          
          .stat-label {
            font-size: 12px;
            color: #586069;
          }
          
          .text-preview {
            max-height: 120px;
            overflow-y: auto;
          }
          
          .text-item {
            padding: 8px;
            background: #f6f8fa;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: 12px;
          }
          
          .text-more {
            font-size: 12px;
            color: #586069;
            font-style: italic;
          }
          
          .selection-empty {
            text-align: center;
            color: #586069;
          }
          
          /* Options */
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          .option-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .option-label {
            font-size: 12px;
            font-weight: 500;
            color: #24292e;
          }
          
          /* Form Controls */
          .select, .input {
            padding: 8px 12px;
            border: 1px solid #d1d5da;
            border-radius: 4px;
            font-size: 14px;
            background: #fff;
          }
          
          .select:focus, .input:focus {
            outline: none;
            border-color: #0366d6;
            box-shadow: 0 0 0 2px rgba(3,102,214,0.1);
          }
          
          /* Buttons */
          .btn-primary, .btn-secondary, .btn-danger, .btn-small, .btn-icon {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
          }
          
          .btn-primary {
            background: #28a745;
            color: #fff;
          }
          
          .btn-primary:hover { background: #218838; }
          
          .btn-secondary {
            background: #6c757d;
            color: #fff;
          }
          
          .btn-secondary:hover { background: #5a6268; }
          
          .btn-danger {
            background: #dc3545;
            color: #fff;
          }
          
          .btn-small {
            padding: 4px 8px;
            font-size: 12px;
          }
          
          .btn-icon {
            padding: 6px;
            background: transparent;
            color: #586069;
          }
          
          .disabled {
            opacity: 0.5;
            cursor: not-allowed !important;
          }
          
          /* 强制定位按钮可见样式 */
          .locate-btn {
            background: #17a2b8 !important;
            color: #fff !important;
            border: 1px solid #17a2b8 !important;
          }
          
          .locate-btn:hover {
            background: #138496 !important;
          }
          
          /* Actions */
          .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          /* Progress */
          .progress-section {
            margin-top: 16px;
          }
          
          .progress-bar {
            height: 6px;
            background: #e1e4e8;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
          }
          
          .progress-fill {
            height: 100%;
            background: #28a745;
            transition: width 0.3s ease;
          }
          
          .progress-text {
            font-size: 12px;
            color: #586069;
            text-align: center;
          }
          
          /* Warning */
          .warning-message {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            color: #856404;
            margin-top: 12px;
          }
          
          /* Results */
          .results-container {
            max-height: 300px;
            overflow-y: auto;
          }
          
          .result-item {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
          }
          
          .result-item.success { border-color: #28a745; }
          .result-item.error { border-color: #dc3545; }
          
          .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .result-index {
            font-weight: 600;
            color: #0366d6;
          }
          
          .result-status {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 3px;
          }
          
          .result-status.success { background: #d4edda; color: #155724; }
          .result-status.error { background: #f8d7da; color: #721c24; }
          
          .original-text, .translated-text, .error-text {
            margin-bottom: 8px;
          }
          
          .original-text label { color: #6c757d; }
          .translated-text label { color: #28a745; }
          .error-text label { color: #dc3545; }
          
          .text-content {
            background: #f6f8fa;
            padding: 8px;
            border-radius: 4px;
            margin-top: 4px;
            font-size: 13px;
            line-height: 1.4;
          }
          
          .text-content.error { background: #f8d7da; }
          
          .result-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          /* Engine Settings */
          .engine-settings {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
          }
          
          .engine-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .engine-config.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
          
          .input-group {
            margin-bottom: 12px;
          }
          
          .input-label {
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #24292e;
          }
          
          /* Switch */
          .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
          }
          
          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 20px;
          }
          
          .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          .slider.forced-on {
            background-color: #28a745 !important;
          }
          
          input:checked + .slider {
            background-color: #28a745;
          }
          
          input:checked + .slider:before {
            transform: translateX(20px);
          }
          
          /* Footer */
          .footer {
            background: #fff;
            border-top: 1px solid #e1e4e8;
            padding: 8px 16px;
            flex-shrink: 0;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #586069;
          }
          
          /* Notifications */
          .notifications {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
          }
          
          .notification {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          .notification.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
          }
          
          .notification.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
          }
          
          .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            margin-left: 8px;
          }
          
          /* Empty State */
          .empty-state {
            text-align: center;
            padding: 40px;
            color: #586069;
          }
          
          /* Settings Actions */
          .settings-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          .engine-actions {
            margin-top: 12px;
          }
        </style>
      `;
    }

    // 辅助方法
    bindEvents(state) {
      // 事件绑定在这里处理
    }

    getStatusText(status) {
      switch (status) {
        case 'success': return '✅ 成功';
        case 'error': return '❌ 失败';
        case 'pending': return '⏳ 处理中';
        default: return '❓ 未知';
      }
    }

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN');
    }

    getModelOptions(engineKey, selectedModel) {
      const models = {
        openai: ['gpt-3.5-turbo-instruct', 'gpt-4', 'gpt-4-turbo'],
        gemini: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
      };

      return (models[engineKey] || []).map(model => 
        `<option value="${model}" ${model === selectedModel ? 'selected' : ''}>${model}</option>`
      ).join('');
    }

    // UI交互方法
    switchPage(page) {
      store.setState({ currentPage: page });
    }

    showSettings() {
      this.switchPage('settings');
    }

    updateTranslationOption(key, value) {
      store.updateNested(`translation.${key}`, value);
    }

    toggleEngine(engine, enabled) {
      // 强制确保Gemini始终启用
      if (engine === 'gemini') {
        enabled = true;
      }
      store.updateNested(`engines.${engine}.enabled`, enabled);
    }

    updateEngineConfig(engine, key, value) {
      store.updateNested(`engines.${engine}.${key}`, value);
    }

    refreshSelection() {
      this.postMessage('get-selection');
    }

    startTranslation() {
      const state = store.state;
      
      if (state.selection.textNodes === 0) {
        return this.showError('请先选择包含文本的节点');
      }

      const engine = state.engines[state.translation.currentEngine];
      if (!engine || !engine.enabled) {
        return this.showError('请先配置有效的翻译引擎');
      }

      store.updateNested('translation.isTranslating', true);
      store.updateNested('translation.progress', 0);
      store.updateNested('translation.results', []);

      this.postMessage('start-translation', {
        engine: state.translation.currentEngine,
        sourceLang: state.translation.sourceLang,
        targetLang: state.translation.targetLang,
        mode: state.translation.mode,
        nodeIds: state.selection.nodeIds
      });
    }

    cancelTranslation() {
      store.updateNested('translation.isTranslating', false);
      this.postMessage('cancel-translation');
    }

    applyTranslation(index) {
      const result = store.state.translation.results[index];
      if (result && result.translatedText) {
        this.postMessage('apply-translation', {
          nodeId: result.nodeId,
          translatedText: result.translatedText,
          mode: store.state.translation.mode
        });
      }
    }

    copyTranslation(index) {
      const result = store.state.translation.results[index];
      if (result && result.translatedText) {
        navigator.clipboard.writeText(result.translatedText).then(() => {
          this.showSuccess('译文已复制到剪贴板');
        }).catch(() => {
          this.showError('复制失败');
        });
      }
    }

    // 强化的节点定位方法
    locateNode(index) {
      const result = store.state.translation.results[index];
      if (result && result.nodeId) {
        this.postMessage('locate-node', { nodeId: result.nodeId });
        this.showSuccess('正在定位到该节点...');
      } else {
        this.showError('无法定位节点：节点ID缺失');
      }
    }

    testEngine(engine) {
      const engineConfig = store.state.engines[engine];
      if (engineConfig.apiKey) {
        this.postMessage('test-engine', { engine, config: engineConfig });
      } else {
        this.showError('请先输入API密钥');
      }
    }

    exportSettings() {
      const settings = {
        engines: store.state.engines,
        translation: {
          sourceLang: store.state.translation.sourceLang,
          targetLang: store.state.translation.targetLang,
          mode: store.state.translation.mode
        }
      };

      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'figma-translator-settings.json';
      a.click();
      URL.revokeObjectURL(url);
      this.showSuccess('设置已导出');
    }

    importSettings() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target && e.target.result;
              if (typeof content === 'string') {
                const settings = JSON.parse(content);
                if (settings.engines) {
                  // 确保Gemini始终启用
                  if (settings.engines.gemini) {
                    settings.engines.gemini.enabled = true;
                  }
                  store.setState({ engines: settings.engines });
                }
                if (settings.translation) {
                  store.updateNested('translation', { ...store.state.translation, ...settings.translation });
                }
                this.showSuccess('设置已导入');
              }
            } catch (error) {
              this.showError('设置文件格式错误');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }

    clearHistory() {
      if (confirm('确定要清除所有翻译历史吗？')) {
        store.setState({ history: [] });
        this.showSuccess('历史记录已清除');
      }
    }

    reuseTranslation(index) {
      const item = store.state.history[index];
      if (item) {
        store.updateNested('translation.sourceLang', item.sourceLang);
        store.updateNested('translation.targetLang', item.targetLang);
        store.updateNested('translation.currentEngine', item.engine);
        this.switchPage('translate');
        this.showSuccess('翻译设置已应用');
      }
    }

    setupMessageHandling() {
      window.addEventListener('message', (event) => {
        const message = event.data.pluginMessage;
        if (message) {
          console.log('UI received message:', message.type, message);
          this.handleMessage(message);
        }
      });
    }

    handleMessage(message) {
      switch (message.type) {
        case 'plugin-ready':
          this.showSuccess('插件已连接');
          break;

        case 'selection-changed':
          store.updateNested('selection', {
            totalNodes: message.payload.nodeCount || 0,
            textNodes: message.payload.hasTextNodes ? 1 : 0,
            nodeIds: message.payload.nodeIds || [],
            textContents: message.payload.textContents || []
          });
          break;

        case 'selection-info':
          store.updateNested('selection', {
            totalNodes: message.payload.totalNodes || 0,
            textNodes: message.payload.textNodes || 0,
            nodeIds: message.payload.nodeIds || [],
            textContents: message.payload.textContents || []
          });
          break;

        case 'translation-progress':
          store.updateNested('translation.progress', message.payload.progress);
          break;

        case 'translation-result':
          const results = [...store.state.translation.results];
          results.push(message.payload);
          store.updateNested('translation.results', results);
          break;

        case 'translation-complete':
          store.updateNested('translation.isTranslating', false);
          store.updateNested('translation.progress', 100);
          
          const history = [...store.state.history];
          message.payload.results.forEach(result => {
            if (result.status === 'success') {
              history.unshift({
                timestamp: new Date().toISOString(),
                engine: store.state.translation.currentEngine,
                sourceLang: store.state.translation.sourceLang,
                targetLang: store.state.translation.targetLang,
                originalText: result.originalText,
                translatedText: result.translatedText
              });
            }
          });
          
          store.setState({ history: history.slice(0, 50) });
          this.showSuccess(`翻译完成！成功 ${message.payload.successCount} 个，失败 ${message.payload.failureCount} 个`);
          break;

        case 'translation-error':
          store.updateNested('translation.isTranslating', false);
          this.showError(message.payload.error);
          break;

        case 'engine-test-result':
          if (message.payload.success) {
            this.showSuccess(`${message.payload.engine} 连接测试成功`);
          } else {
            this.showError(`${message.payload.engine} 连接测试失败: ${message.payload.error}`);
          }
          break;

        case 'apply-result':
          if (message.payload.success) {
            this.showSuccess('翻译已应用到Figma');
          } else {
            this.showError(`应用失败: ${message.payload.error}`);
          }
          break;

        case 'locate-result':
          if (message.payload.success) {
            this.showSuccess('节点定位成功');
          } else {
            this.showError(`定位失败: ${message.payload.error}`);
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    }

    postMessage(type, payload = {}) {
      const message = { type, payload };
      console.log('Sending message:', message);
      parent.postMessage({ pluginMessage: message }, '*');
    }

    showError(error) {
      store.setState({ error });
      setTimeout(() => {
        store.setState({ error: null });
      }, 5000);
    }

    showSuccess(success) {
      store.setState({ success });
      setTimeout(() => {
        store.setState({ success: null });
      }, 3000);
    }

    clearError() {
      store.setState({ error: null });
    }

    clearSuccess() {
      store.setState({ success: null });
    }
  }

  // 初始化应用
  let uiInstance;

  function initializeApp() {
    console.log('初始化TP Translator v1.2.0...');
    uiInstance = new UIRenderer();
    window.ui = uiInstance;
    console.log('TP Translator v1.2.0 初始化成功');
  }

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  console.log('TP Translator v1.2.0 彻底修复版本脚本加载完成');
})();