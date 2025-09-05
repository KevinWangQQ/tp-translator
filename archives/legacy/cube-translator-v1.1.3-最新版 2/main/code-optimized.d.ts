/**
 * 优化版本的Figma翻译插件主线程 - 修复翻译质量和性能问题
 * 专门针对TP-Link网络设备和智能家居产品优化
 */
declare const LANGUAGE_NAMES: {
    auto: string;
    en: string;
    "zh-CN": string;
    "zh-TW": string;
    ja: string;
    ko: string;
    fr: string;
    de: string;
    es: string;
    pt: string;
    ru: string;
    ar: string;
    hi: string;
    th: string;
    vi: string;
    id: string;
    ms: string;
    tr: string;
    it: string;
    nl: string;
    pl: string;
};
declare function buildOpenAIPrompt(text: string, sourceLang: string, targetLang: string): {
    system: string;
    user: string;
};
declare function buildGeminiPrompt(text: string, sourceLang: string, targetLang: string): string;
declare class OptimizedTranslationEngine {
    translateText(text: string, sourceLang: string, targetLang: string, engine: string, config: any): Promise<string>;
    private translateWithOpenAI;
    private translateWithGemini;
    private buildOptimizedPrompt;
    testConnection(engine: string, config: any): Promise<boolean>;
}
declare class FigmaService {
    private findTextNodesInNode;
    getSelectedTextNodes(): any[];
    getSelectionInfo(): {
        totalNodes: any;
        textNodes: number;
        nodeIds: any[];
        textContents: any[];
        containerInfo: any;
    };
    applyTranslation(nodeId: string, translatedText: string, mode: string): Promise<void>;
    createBesideText(originalNode: any, translatedText: string): Promise<void>;
    createFrameWithTranslation(originalNode: any, translatedText: string): Promise<void>;
    createPageWithTranslation(originalNode: any, translatedText: string): Promise<void>;
    getAvailableFonts(): string[];
}
declare class OptimizedMessageHandler {
    private isTranslating;
    private translationEngine;
    private figmaService;
    constructor();
    handleMessage(message: any): Promise<any>;
    private handleOptimizedTranslation;
    private translateSingleNode;
    private handleSelectAllText;
    private handleApplyTranslation;
    private handleTestEngine;
    private handleSaveSettings;
    private handleLoadSettings;
    private postMessage;
}
declare class OptimizedPluginController {
    private messageHandler;
    private figmaService;
    constructor();
    initialize(): Promise<void>;
    private setupUI;
    private setupMessageHandling;
    private setupEventListeners;
    private postMessage;
}
declare const handleError: (error: any, context: string) => void;
declare function initializeOptimizedPlugin(): Promise<void>;
declare const commands: {
    'open-translator': () => Promise<void>;
    'quick-translate': () => Promise<void>;
    'open-settings': () => Promise<void>;
};
