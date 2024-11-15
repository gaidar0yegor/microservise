/// <reference types="@types/jest" />

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mockImplementation(fn: (...args: Y) => T): this;
    mockReturnValue(value: T): this;
    mockReturnThis(): this;
    mockResolvedValue(value: Promise<T> | T): this;
    mockRejectedValue(value: any): this;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    getMockName(): string;
    mockReturnValueOnce(value: T): this;
    mockResolvedValueOnce(value: T): this;
    mockRejectedValueOnce(value: any): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
  }

  interface FunctionLike {
    (...args: any[]): any;
  }

  type MockableFunction = (...args: any[]) => any;

  interface MockInstance<T extends MockableFunction> extends Function, Mock<ReturnType<T>> {
    new (...args: any[]): T;
    (...args: Parameters<T>): ReturnType<T>;
  }

  function fn<T extends MockableFunction>(implementation?: T): MockInstance<T>;
  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;
  function spyOn<T extends {}, M extends keyof T>(object: T, method: M): Mock;
}

declare module '@testing-library/react' {
  interface Config {
    asyncUtilTimeout?: number;
    defaultHidden?: boolean;
    throwSuggestions?: boolean;
  }

  export function configure(config: Partial<Config>): void;
}

declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }

  interface Window {
    matchMedia(query: string): MediaQueryList;
    IntersectionObserver: {
      new (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ): IntersectionObserver;
      prototype: IntersectionObserver;
    };
    ResizeObserver: {
      new (callback: ResizeObserverCallback): ResizeObserver;
      prototype: ResizeObserver;
    };
    scrollTo: (x: number, y: number) => void;
    localStorage: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
      clear(): void;
    };
    sessionStorage: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
      clear(): void;
    };
  }

  interface IntersectionObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
  }

  interface ResizeObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
  }

  // Extend the Jest matchers
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

export {};
