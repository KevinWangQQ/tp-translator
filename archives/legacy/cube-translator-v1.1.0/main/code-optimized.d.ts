/**
 * 优化版本的Figma翻译插件主线程 - 修复翻译质量和性能问题
 */
declare class OptimizedTranslationEngine {
    translateText(text: string, sourceLang: string, targetLang: string, engine: string, config: any): Promise<string>;
    private translateWithOpenAI;
    private translateWithGemini;
    private buildOptimizedPrompt;
    testConnection(engine: string, config: any): Promise<boolean>;
}
declare class FigmaService {
    getSelectedTextNodes(): any;
    getSelectionInfo(): {
        totalNodes: any;
        textNodes: any;
        nodeIds: any;
        textContents: any;
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
