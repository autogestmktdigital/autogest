/// <reference types="next" />

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export {};
