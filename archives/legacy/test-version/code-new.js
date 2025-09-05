console.log("TP Translator v2.2.1 中文版 loading...");

// Language mappings
const LANGUAGES = {
  auto: "auto-detected language",
  en: "English",
  "zh-CN": "Simplified Chinese", 
  "zh-TW": "Traditional Chinese",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  es: "Spanish",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  tr: "Turkish",
  it: "Italian",
  nl: "Dutch",
  pl: "Polish"
};

// Glossary utility functions
function findGlossaryMatch(text, glossary = []) {
  if (!glossary || !Array.isArray(glossary) || glossary.length === 0) {
    return null;
  }
  
  console.log('Checking glossary for text:', text, 'against', glossary.length, 'entries');
  
  for (const entry of glossary) {
    if (entry && entry.source && entry.target) {
      // Exact match
      if (text === entry.source) {
        console.log('Found exact glossary match:', entry.source, '→', entry.target);
        return entry.target;
      }
      
      // Case-insensitive match
      if (text.toLowerCase() === entry.source.toLowerCase()) {
        console.log('Found case-insensitive glossary match:', entry.source, '→', entry.target);
        return entry.target;
      }
      
      // Partial match (if text contains the glossary term)
      if (text.includes(entry.source)) {
        console.log('Found partial glossary match:', entry.source, '→', entry.target);
        return text.replace(new RegExp(entry.source, 'gi'), entry.target);
      }
    }
  }
  
  return null;
}

function buildGlossaryPrompt(glossary = []) {
  if (!glossary || !Array.isArray(glossary) || glossary.length === 0) {
    return '';
  }
  
  const glossaryEntries = glossary
    .filter(entry => entry && entry.source && entry.target)
    .map(entry => `- "${entry.source}" → "${entry.target}"`)
    .join('\n');
  
  if (glossaryEntries) {
    return `\n\nIMPORTANT GLOSSARY TERMS (use these exact translations when found):\n${glossaryEntries}\n\nIf any of the above glossary terms appear in the text, use the specified translation exactly.`;
  }
  
  return '';
}

// OpenAI prompt builder with glossary support
function buildOpenAIPrompt(text, sourceLang, targetLang, glossary) {
  const glossaryPrompt = buildGlossaryPrompt(glossary);
  
  return {
    system: `You are a professional translator specializing in networking and smart home device interfaces. You translate UI elements for TP-Link products including routers, switches, access points, smart plugs, cameras, and IoT devices.

CRITICAL TRANSLATION RULES:
1. NEVER add quotes, brackets, or any extra formatting around the translation
2. Output ONLY the translated text, nothing else
3. Maintain exact formatting, capitalization patterns, and punctuation
4. Preserve technical terms, model numbers, and brand names
5. Keep all symbols, special characters, and spacing identical
6. Translate UI labels using standard industry terminology
7. For networking terms, use established Chinese technical vocabulary
8. For smart home features, use commonly accepted Chinese terms${glossaryPrompt}`,
    
    user: `Translate this TP-Link interface element from ${LANGUAGES[sourceLang] || sourceLang} to ${LANGUAGES[targetLang] || targetLang}.

Context: This is UI text from TP-Link networking/smart home products (routers, switches, smart devices, mobile apps, web interfaces).

FORMATTING RULES:
- Preserve ALL original formatting exactly
- Keep currency symbols unchanged (¥ → ¥, $ → $, € → €)
- Keep numbers, IPs, MACs, model numbers exactly as-is
- Maintain punctuation, spacing, and special characters
- Preserve button/menu capitalization patterns
- Keep technical abbreviations (WiFi, LED, USB, etc.)

TERMINOLOGY GUIDELINES:
- Use standard networking terminology (路由器, 交换机, 接入点)
- Use established smart home terms (智能插座, 智能摄像头)
- Keep brand/product names in English (TP-Link, Archer, Deco)
- Use professional technical language, not casual terms

Text to translate: "${text}"`
  };
}

// Gemini prompt builder with glossary support  
function buildGeminiPrompt(text, sourceLang, targetLang, glossary) {
  const glossaryPrompt = buildGlossaryPrompt(glossary);
  
  return `Translate this TP-Link product interface text from ${LANGUAGES[sourceLang] || sourceLang} to ${LANGUAGES[targetLang] || targetLang}.

CONTEXT: TP-Link networking and smart home device UI translation
- Products: Routers, switches, access points, smart plugs, cameras, IoT devices
- Interfaces: Mobile apps, web management panels, device displays

CRITICAL OUTPUT RULES:
✓ Output ONLY the translated text
✗ DO NOT add quotes, brackets, or extra formatting
✗ DO NOT add explanations or notes
✗ DO NOT repeat the original text

FORMATTING PRESERVATION:
- Keep exact spacing, punctuation, and capitalization
- Preserve numbers, IPs, model codes unchanged
- Maintain currency symbols (¥ stays ¥, $ stays $)
- Keep technical abbreviations (WiFi, USB, LED, etc.)
- Preserve special characters and symbols

NETWORKING TERMINOLOGY (English → Chinese):
- Router → 路由器
- Switch → 交换机  
- Access Point → 接入点
- WiFi → WiFi (keep as-is)
- Ethernet → 以太网
- Bandwidth → 带宽
- Firewall → 防火墙
- Port → 端口
- Signal → 信号

SMART HOME TERMINOLOGY:
- Smart Plug → 智能插座
- Smart Camera → 智能摄像头
- Smart Switch → 智能开关
- Motion Detection → 动作检测
- Night Vision → 夜视功能
- Remote Control → 远程控制

BRAND/PRODUCT PRESERVATION:
- Keep "TP-Link", "Archer", "Deco", "Tapo" in English
- Keep model numbers unchanged (e.g., "AC1900", "AX6000")${glossaryPrompt}

Original text: "${text}"

Translation:`;
}

// Translation Engine
class TranslationEngine {
  async translateText(text, sourceLang, targetLang, engine, config, glossary = []) {
    console.log(`Translating with ${engine}:`, { text, sourceLang, targetLang, glossaryCount: glossary.length });
    
    // First check glossary for direct match
    const glossaryMatch = findGlossaryMatch(text, glossary);
    if (glossaryMatch) {
      console.log('Using glossary translation:', glossaryMatch);
      return glossaryMatch;
    }
    
    try {
      if (engine === 'openai') {
        return await this.translateWithOpenAI(text, sourceLang, targetLang, config, glossary);
      } else if (engine === 'gemini') {
        return await this.translateWithGemini(text, sourceLang, targetLang, config, glossary);
      } else {
        throw new Error(`Unsupported engine: ${engine}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async translateWithOpenAI(text, sourceLang, targetLang, config, glossary) {
    const model = config.model || 'gpt-3.5-turbo-instruct';
    
    if (!model.includes('instruct')) {
      // Chat completions API
      const prompt = buildOpenAIPrompt(text, sourceLang, targetLang, glossary);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim();
      
      if (!translatedText) {
        throw new Error('No translation returned from OpenAI Chat API');
      }
      
      return translatedText;
    } else {
      // Completions API
      const prompt = buildOpenAIPrompt(text, sourceLang, targetLang, glossary);
      const fullPrompt = `${prompt.system}\n\n${prompt.user}`;
      
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: fullPrompt,
          max_tokens: 500,
          temperature: 0.1,
          stop: ["\n\n", "Original:", "Context:"]
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const translatedText = data.choices?.[0]?.text?.trim();
      
      if (!translatedText) {
        throw new Error('No translation returned from OpenAI Completions API');
      }
      
      return translatedText;
    }
  }

  async translateWithGemini(text, sourceLang, targetLang, config, glossary) {
    const prompt = buildGeminiPrompt(text, sourceLang, targetLang, glossary);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.05,
          maxOutputTokens: 500,
          stopSequences: ['"', '""', '```'],
          topP: 0.8,
          topK: 10
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    let translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!translatedText) {
      throw new Error('No translation returned from Gemini');
    }
    
    // Clean up the response
    translatedText = translatedText
      .replace(/^["'`]+|["'`]+$/g, '')
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^\*|\*$/g, '')
      .replace(/^```[\w]*\n?|\n?```$/g, '')
      .trim();
    
    return translatedText;
  }

  buildOptimizedPrompt(text, sourceLang, targetLang, glossary) {
    return buildGeminiPrompt(text, sourceLang, targetLang, glossary);
  }

  async testConnection(engine, config) {
    try {
      await this.translateText("Hello", "en", "zh-CN", engine, config, []);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Figma Service
class FigmaService {
  findTextNodesInNode(node) {
    const textNodes = [];
    if (node.type === 'TEXT') {
      textNodes.push(node);
    } else if ('children' in node) {
      for (const child of node.children) {
        textNodes.push(...this.findTextNodesInNode(child));
      }
    }
    return textNodes;
  }

  getSelectedTextNodes() {
    const selection = [];
    for (const node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        selection.push(node);
      } else {
        const textNodes = this.findTextNodesInNode(node);
        selection.push(...textNodes);
      }
    }
    // Remove duplicates
    return selection.filter((node, index, array) => 
      array.findIndex(n => n.id === node.id) === index
    );
  }

  getSelectionInfo() {
    const selection = figma.currentPage.selection;
    const textNodes = this.getSelectedTextNodes();
    
    console.log(`Selection analysis: ${selection.length} total nodes, found ${textNodes.length} text nodes`);
    
    return {
      totalNodes: selection.length,
      textNodes: textNodes.length,
      nodeIds: textNodes.map(node => node.id),
      textContents: textNodes.map(node => node.characters || ''),
      containerInfo: selection.map(node => ({
        id: node.id,
        type: node.type,
        name: node.name,
        hasChildren: 'children' in node ? node.children.length : 0
      }))
    };
  }

  async applyTranslation(nodeId, translatedText, mode) {
    let node;
    try {
      node = figma.getNodeById(nodeId);
    } catch (error) {
      node = figma.currentPage.findOne(n => n.id === nodeId);
    }
    
    if (!node || node.type !== 'TEXT') {
      throw new Error('Node not found or not a text node');
    }
    
    await figma.loadFontAsync(node.fontName);
    
    switch (mode) {
      case 'replace':
        node.characters = translatedText;
        break;
      case 'beside':
        await this.createBesideText(node, translatedText);
        break;
      case 'newFrame':
        await this.createFrameWithTranslation(node, translatedText);
        break;
      case 'newPage':
        await this.createPageWithTranslation(node, translatedText);
        break;
      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }
  }

  async createBesideText(originalNode, translatedText) {
    const newNode = originalNode.clone();
    newNode.characters = translatedText;
    newNode.x = originalNode.x + originalNode.width + 20;
    
    const fills = originalNode.fills.slice();
    if (fills.length > 0 && fills[0].type === 'SOLID') {
      fills[0] = Object.assign({}, fills[0], {
        color: { r: 0, g: 0.5, b: 0 }
      });
      newNode.fills = fills;
    }
  }

  async createFrameWithTranslation(originalNode, translatedText) {
    const frame = figma.createFrame();
    frame.name = "Translation Frame";
    frame.x = originalNode.x + originalNode.width + 50;
    frame.y = originalNode.y;
    
    const originalCopy = originalNode.clone();
    originalCopy.x = 0;
    originalCopy.y = 0;
    frame.appendChild(originalCopy);
    
    const translatedCopy = originalNode.clone();
    translatedCopy.characters = translatedText;
    translatedCopy.x = 0;
    translatedCopy.y = originalCopy.height + 10;
    frame.appendChild(translatedCopy);
    
    frame.resize(
      Math.max(originalCopy.width, translatedCopy.width) + 20,
      originalCopy.height + translatedCopy.height + 30
    );
    
    frame.backgrounds = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.95, b: 0.95 }
    }];
  }

  async createPageWithTranslation(originalNode, translatedText) {
    const page = figma.createPage();
    page.name = `Translation - ${new Date().toLocaleString()}`;
    
    const originalCopy = originalNode.clone();
    originalCopy.x = 100;
    originalCopy.y = 100;
    page.appendChild(originalCopy);
    
    const translatedCopy = originalNode.clone();
    translatedCopy.characters = translatedText;
    translatedCopy.x = 100;
    translatedCopy.y = originalCopy.y + originalCopy.height + 50;
    page.appendChild(translatedCopy);
  }

  getAvailableFonts() {
    return ['Inter', 'Roboto', 'Arial', 'Helvetica'];
  }
}

// Message Handler
class MessageHandler {
  constructor() {
    this.isTranslating = false;
    this.translationEngine = new TranslationEngine();
    this.figmaService = new FigmaService();
  }

  async handleMessage(message) {
    console.log('Handling message:', message.type);
    
    try {
      switch (message.type) {
        case 'get-selection':
          return {
            type: 'selection-info',
            payload: this.figmaService.getSelectionInfo()
          };
          
        case 'select-all-text':
          return await this.handleSelectAllText();
          
        case 'start-translation':
          return await this.handleOptimizedTranslation(message.payload);
          
        case 'cancel-translation':
          this.isTranslating = false;
          return { type: 'translation-cancelled' };
          
        case 'apply-translation':
          return await this.handleApplyTranslation(message.payload);
          
        case 'test-engine':
          return await this.handleTestEngine(message.payload);
          
        case 'save-settings':
          return await this.handleSaveSettings(message.payload);
          
        case 'load-settings':
          return await this.handleLoadSettings();
          
        case 'locate-node':
          return await this.handleLocateNode(message.payload);
          
        default:
          console.log('Unknown message type:', message.type);
          return null;
      }
    } catch (error) {
      console.error('Message handling error:', error);
      return {
        type: 'error',
        payload: { error: error.message }
      };
    }
  }

  async handleOptimizedTranslation(payload) {
    if (this.isTranslating) {
      throw new Error('Translation already in progress');
    }
    
    this.isTranslating = true;
    
    const {
      engine,
      sourceLang,
      targetLang,
      mode,
      nodeIds,
      config,
      glossary = [],
      advancedPrompt = {},
      contentFilters = {},
      general = {}
    } = payload;
    
    console.log('Starting translation with glossary:', {
      engine,
      sourceLang,
      targetLang,
      nodeCount: nodeIds.length,
      glossaryCount: glossary.length,
      glossary: glossary
    });
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    try {
      const translationConfig = config;
      const batchSize = 3;
      
      // Group nodes into batches
      const batches = [];
      for (let i = 0; i < nodeIds.length; i += batchSize) {
        batches.push(nodeIds.slice(i, i + batchSize));
      }
      
      let processedCount = 0;
      
      for (const batch of batches) {
        if (!this.isTranslating) break;
        
        const batchPromises = batch.map(async (nodeId) => 
          await this.translateSingleNode(
            nodeId,
            engine,
            sourceLang,
            targetLang,
            mode,
            translationConfig,
            glossary
          )
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        for (const result of batchResults) {
          results.push(result);
          if (result.status === 'success') {
            successCount++;
          } else {
            failureCount++;
          }
          
          this.postMessage({
            type: 'translation-result',
            payload: result
          });
        }
        
        processedCount += batch.length;
        this.postMessage({
          type: 'translation-progress',
          payload: {
            progress: (processedCount / nodeIds.length) * 100
          }
        });
        
        // Add delay between batches
        if (processedCount < nodeIds.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      this.isTranslating = false;
      
      return {
        type: 'translation-complete',
        payload: {
          results,
          successCount,
          failureCount
        }
      };
      
    } catch (error) {
      this.isTranslating = false;
      throw error;
    }
  }

  async translateSingleNode(nodeId, engine, sourceLang, targetLang, mode, config, glossary) {
    let node;
    try {
      node = figma.getNodeById(nodeId);
    } catch (error) {
      node = figma.currentPage.findOne(n => n.id === nodeId);
    }
    
    if (!node || node.type !== 'TEXT') {
      return {
        nodeId,
        originalText: '',
        translatedText: '',
        status: 'error',
        error: 'Node not found or not a text node',
        applied: false
      };
    }
    
    const originalText = node.characters || '';
    
    try {
      console.log(`Translating node ${nodeId}: "${originalText}" with glossary:`, glossary);
      
      const translatedText = await this.translationEngine.translateText(
        originalText,
        sourceLang,
        targetLang,
        engine,
        config,
        glossary
      );
      
      const result = {
        nodeId,
        originalText,
        translatedText,
        status: 'success',
        applied: false
      };
      
      // Apply translation
      result.applied = await this.applyTranslationWithRetry(nodeId, translatedText, mode, 3);
      
      return result;
      
    } catch (error) {
      return {
        nodeId,
        originalText,
        translatedText: '',
        status: 'error',
        error: error.message,
        applied: false
      };
    }
  }

  async handleSelectAllText() {
    try {
      const allTextNodes = figma.currentPage.findAll(node => node.type === 'TEXT');
      figma.currentPage.selection = allTextNodes;
      
      return {
        type: 'selection-info',
        payload: {
          totalNodes: allTextNodes.length,
          textNodes: allTextNodes.length,
          nodeIds: allTextNodes.map(node => node.id),
          textContents: allTextNodes.map(node => node.characters || '')
        }
      };
    } catch (error) {
      return {
        type: 'error',
        payload: { error: error.message }
      };
    }
  }

  async applyTranslationWithRetry(nodeId, translatedText, mode, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.figmaService.applyTranslation(nodeId, translatedText, mode);
        console.log(`Translation applied successfully on attempt ${attempt}`);
        return true;
      } catch (error) {
        console.warn(`Failed to apply translation (attempt ${attempt}/${maxRetries}):`, error.message);
        
        if (attempt < maxRetries) {
          const retryDelay = delay * Math.pow(1.5, attempt - 1);
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    console.error(`Failed to apply translation after ${maxRetries} attempts`);
    return false;
  }

  async handleApplyTranslation(payload) {
    try {
      const success = await this.applyTranslationWithRetry(
        payload.nodeId,
        payload.translatedText,
        payload.mode,
        3
      );
      
      return {
        type: 'apply-result',
        payload: {
          success,
          error: success ? null : 'Failed to apply translation after retries'
        }
      };
    } catch (error) {
      return {
        type: 'apply-result',
        payload: {
          success: false,
          error: error.message
        }
      };
    }
  }

  async handleTestEngine(payload) {
    try {
      const success = await this.translationEngine.testConnection(payload.engine, payload.config);
      
      return {
        type: 'engine-test-result',
        payload: {
          engine: payload.engine,
          success,
          error: success ? null : 'Connection test failed'
        }
      };
    } catch (error) {
      return {
        type: 'engine-test-result',
        payload: {
          engine: payload.engine,
          success: false,
          error: error.message
        }
      };
    }
  }

  async handleSaveSettings(payload) {
    try {
      if (payload.engines) {
        await figma.clientStorage.setAsync('translationEngines', payload.engines);
      }
      if (payload.settings) {
        await figma.clientStorage.setAsync('pluginSettings', payload.settings);
      }
      if (payload.translationMemories) {
        await figma.clientStorage.setAsync('translationMemories', payload.translationMemories);
      }
      if (payload.glossary) {
        await figma.clientStorage.setAsync('glossary', payload.glossary);
      }
      if (payload.advancedPrompt) {
        await figma.clientStorage.setAsync('advancedPrompt', payload.advancedPrompt);
      }
      if (payload.contentFilters) {
        await figma.clientStorage.setAsync('contentFilters', payload.contentFilters);
      }
      if (payload.general) {
        await figma.clientStorage.setAsync('general', payload.general);
      }
      
      console.log('Settings saved successfully');
      
      return {
        type: 'settings-save-result',
        payload: { success: true }
      };
    } catch (error) {
      console.error('Failed to save settings:', error);
      
      return {
        type: 'settings-save-result',
        payload: {
          success: false,
          error: error.message
        }
      };
    }
  }

  async handleLoadSettings() {
    try {
      const engines = await figma.clientStorage.getAsync('translationEngines') || {
        openai: { enabled: false, apiKey: '', model: 'gpt-3.5-turbo-instruct' },
        gemini: { enabled: false, apiKey: '', model: 'gemini-pro' }
      };
      
      const settings = await figma.clientStorage.getAsync('pluginSettings') || {
        defaultTargetLang: 'zh-CN'
      };
      
      const translationMemories = await figma.clientStorage.getAsync('translationMemories') || [];
      const glossary = await figma.clientStorage.getAsync('glossary') || [];
      const advancedPrompt = await figma.clientStorage.getAsync('advancedPrompt') || {};
      const contentFilters = await figma.clientStorage.getAsync('contentFilters') || {};
      const general = await figma.clientStorage.getAsync('general') || {};
      
      console.log('Settings loaded successfully');
      
      return {
        type: 'settings-loaded',
        payload: {
          engines,
          settings,
          translationMemories,
          glossary,
          advancedPrompt,
          contentFilters,
          general
        }
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      
      return {
        type: 'settings-load-error',
        payload: { error: error.message }
      };
    }
  }

  async handleLocateNode(payload) {
    try {
      const { nodeId } = payload;
      
      let node;
      try {
        node = figma.getNodeById(nodeId);
      } catch (error) {
        node = figma.currentPage.findOne(n => n.id === nodeId);
      }
      
      if (!node) {
        return {
          type: 'locate-result',
          payload: {
            success: false,
            error: 'Node not found'
          }
        };
      }
      
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      
      const x = node.absoluteTransform[0][2];
      const y = node.absoluteTransform[1][2];
      const size = Math.max(node.width, node.height);
      const zoom = Math.min(Math.max(0.5, 1000 / size), 3);
      
      figma.viewport.zoom = zoom;
      setTimeout(() => {
        figma.viewport.center = {
          x: x + node.width / 2,
          y: y + node.height / 2
        };
      }, 100);
      
      return {
        type: 'locate-result',
        payload: {
          success: true,
          nodeId,
          position: { x, y },
          size: { width: node.width, height: node.height }
        }
      };
      
    } catch (error) {
      return {
        type: 'locate-result',
        payload: {
          success: false,
          error: error.message
        }
      };
    }
  }

  postMessage(message) {
    figma.ui.postMessage(message);
  }
}

// Plugin Manager
class PluginManager {
  constructor() {
    this.messageHandler = new MessageHandler();
    this.figmaService = new FigmaService();
  }

  async initialize() {
    console.log('Initializing TP Translator v2.2.1 中文版...');
    
    this.setupUI();
    this.setupMessageHandling();
    this.setupEventListeners();
    
    this.postMessage({
      type: 'plugin-ready',
      payload: {
        version: '2.2.1 中文版',
        selection: this.figmaService.getSelectionInfo()
      }
    });
    
    console.log('TP Translator v2.2.1 中文版 initialized successfully');
  }

  setupUI() {
    figma.showUI(__html__, {
      width: 380,
      height: 600,
      title: 'TP Translator v2.2.1 中文版'
    });
  }

  setupMessageHandling() {
    figma.ui.onmessage = async (message) => {
      try {
        console.log('Received message:', message.type);
        const response = await this.messageHandler.handleMessage(message);
        if (response) {
          this.postMessage(response);
        }
      } catch (error) {
        console.error('Message handling error:', error);
        this.postMessage({
          type: 'error',
          payload: { error: error.message }
        });
      }
    };
  }

  setupEventListeners() {
    figma.on('selectionchange', () => {
      const selection = this.figmaService.getSelectionInfo();
      this.postMessage({
        type: 'selection-changed',
        payload: selection
      });
    });
    
    figma.on('currentpagechange', () => {
      this.postMessage({
        type: 'page-changed',
        payload: {
          pageId: figma.currentPage.id,
          pageName: figma.currentPage.name
        }
      });
    });
    
    figma.on('close', () => {
      console.log('Plugin closing...');
    });
  }

  postMessage(message) {
    figma.ui.postMessage(message);
    console.log('Sent message:', message.type);
  }
}

// Error handling
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  if (figma.ui) {
    figma.ui.postMessage({
      type: 'error',
      payload: {
        error: error.message,
        context
      }
    });
  }
};

// Main initialization
async function main() {
  try {
    const plugin = new PluginManager();
    await plugin.initialize();
  } catch (error) {
    handleError(error, 'main initialization');
  }
}

// Command handlers
const commands = {
  'open-translator': async () => {
    await main();
  },
  'quick-translate': async () => {
    await main();
    setTimeout(() => {
      figma.ui.postMessage({
        type: 'auto-translate',
        payload: {
          engine: 'openai',
          sourceLang: 'auto',
          targetLang: 'zh-CN'
        }
      });
    }, 1000);
  },
  'open-settings': async () => {
    await main();
    setTimeout(() => {
      figma.ui.postMessage({
        type: 'show-settings'
      });
    }, 500);
  }
};

// Execute command or default startup
if (figma.command && commands[figma.command]) {
  commands[figma.command]().catch(error => {
    handleError(error, `command: ${figma.command}`);
  });
} else {
  main().catch(error => {
    handleError(error, 'default startup');
  });
}

console.log('TP Translator v2.2.1 中文版 script loaded');