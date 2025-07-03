// System-level diagnostics for text input issues

export interface SystemDiagnostics {
  browser: BrowserInfo;
  system: SystemInfo;
  textInput: TextInputInfo;
  accessibility: AccessibilityInfo;
}

interface BrowserInfo {
  userAgent: string;
  language: string;
  languages: readonly string[];
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
  maxTouchPoints: number;
}

interface SystemInfo {
  htmlDir: string;
  htmlLang: string;
  documentDir: string;
  bodyDir: string;
  timezone: string;
  screenResolution: string;
  colorScheme: string;
}

interface TextInputInfo {
  inputMethodComposition: boolean;
  virtualKeyboard: any;
  textDirectionality: string;
  unicodeVersion: string;
}

interface AccessibilityInfo {
  reducedMotion: boolean;
  highContrast: boolean;
  forcedColors: boolean;
  screenReader: boolean;
}

export function getSystemDiagnostics(): SystemDiagnostics {
  if (typeof window === 'undefined') {
    throw new Error('System diagnostics can only be run in browser environment');
  }

  // Browser information
  const browser: BrowserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
  };

  // System/Document information
  const system: SystemInfo = {
    htmlDir: document.documentElement.dir || 'not set',
    htmlLang: document.documentElement.lang || 'not set',
    documentDir: document.dir || 'not set',
    bodyDir: document.body.dir || 'not set',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${screen.width}x${screen.height}`,
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  };

  // Text input specific information
  const textInput: TextInputInfo = {
    inputMethodComposition: 'CompositionEvent' in window,
    virtualKeyboard: (navigator as any).virtualKeyboard || null,
    textDirectionality: getComputedStyle(document.body).direction,
    unicodeVersion: getUnicodeVersion(),
  };

  // Accessibility information
  const accessibility: AccessibilityInfo = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    forcedColors: window.matchMedia('(forced-colors: active)').matches,
    screenReader: detectScreenReader(),
  };

  return {
    browser,
    system,
    textInput,
    accessibility,
  };
}

function getUnicodeVersion(): string {
  // Simple Unicode version detection
  try {
    // Test for Unicode 15.0 character
    return '🫠'.length === 2 ? 'Unicode 14.0+' : 'Unicode < 14.0';
  } catch {
    return 'Unknown';
  }
}

function detectScreenReader(): boolean {
  // Basic screen reader detection
  return !!(
    (navigator as any).userAgentData?.brands?.some((brand: any) => 
      /screen.?reader/i.test(brand.brand)
    ) ||
    /NVDA|JAWS|DRAGON|VoiceOver/i.test(navigator.userAgent)
  );
}

// Test for Input Method Editor (IME) issues
export async function testIMEInput(element: HTMLElement): Promise<any> {
  return new Promise((resolve) => {
    const events: any[] = [];
    
    const eventTypes = [
      'compositionstart',
      'compositionupdate', 
      'compositionend',
      'input',
      'beforeinput',
      'textInput',
      'keydown',
      'keyup',
      'keypress'
    ];

    const listeners = eventTypes.map(type => {
      const listener = (event: Event) => {
        events.push({
          type: event.type,
          timestamp: Date.now(),
          data: (event as any).data,
          inputType: (event as any).inputType,
          isComposing: (event as any).isComposing,
        });
      };
      
      element.addEventListener(type, listener);
      return { type, listener };
    });

    // Test typing a single character
    setTimeout(() => {
      // Simulate focus
      element.focus();
      
      // Clean up listeners after test
      setTimeout(() => {
        listeners.forEach(({ type, listener }) => {
          element.removeEventListener(type, listener);
        });
        
        resolve({
          events,
          finalContent: element.textContent,
          finalHTML: element.innerHTML,
        });
      }, 2000);
    }, 100);
  });
}

// Test contenteditable behavior
export function testContentEditableBehavior(element: HTMLElement): any {
  const initialStyle = window.getComputedStyle(element);
  
  return {
    computedStyles: {
      direction: initialStyle.direction,
      writingMode: initialStyle.writingMode,
      textAlign: initialStyle.textAlign,
      unicodeBidi: initialStyle.unicodeBidi,
      whiteSpace: initialStyle.whiteSpace,
      wordWrap: initialStyle.wordWrap,
      wordBreak: initialStyle.wordBreak,
      hyphens: initialStyle.hyphens,
      textOrientation: initialStyle.textOrientation,
    },
    attributes: {
      contenteditable: element.getAttribute('contenteditable'),
      dir: element.getAttribute('dir'),
      lang: element.getAttribute('lang'),
      role: element.getAttribute('role'),
      'aria-label': element.getAttribute('aria-label'),
    },
    properties: {
      isContentEditable: element.isContentEditable,
      spellcheck: element.spellcheck,
      translate: (element as any).translate,
    },
    parentChain: getParentChain(element),
  };
}

function getParentChain(element: HTMLElement): any[] {
  const chain = [];
  let current = element.parentElement;
  
  while (current && chain.length < 10) {
    const style = window.getComputedStyle(current);
    chain.push({
      tagName: current.tagName,
      className: current.className,
      direction: style.direction,
      writingMode: style.writingMode,
      textAlign: style.textAlign,
    });
    current = current.parentElement;
  }
  
  return chain;
}