import '@testing-library/jest-dom';

declare const beforeAll: (callback: () => void) => void;
declare const afterAll: (callback: () => void) => void;
declare const afterEach: (callback: () => void) => void;
declare const jest: any;

// Mock window.matchMedia
window.matchMedia = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

window.ResizeObserver = MockResizeObserver;

// Mock window.scrollTo
window.scrollTo = () => {};

// Mock localStorage
const mockLocalStorage = {
  getItem: (key: string): string | null => null,
  setItem: (key: string, value: string): void => {},
  removeItem: (key: string): void => {},
  clear: (): void => {},
  length: 0,
  key: (index: number): string | null => null,
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: (key: string): string | null => null,
  setItem: (key: string, value: string): void => {},
  removeItem: (key: string): void => {},
  clear: (): void => {},
  length: 0,
  key: (index: number): string | null => null,
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock console methods
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Store original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// Setup and teardown
beforeAll(() => {
  console.error = mockConsole.error;
  console.warn = mockConsole.warn;
  console.info = mockConsole.info;
});

afterAll(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
});

afterEach(() => {
  jest.clearAllMocks();
});

// Extend expect matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: { [key: string]: any }): R;
    }
  }
}
