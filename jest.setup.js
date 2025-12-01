// @ts-nocheck
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// 1. Debugging: Confirm this file is actually running
console.log("🟢 JEST SETUP LOADED");

// 2. Polyfill TextEncoder (Required for Firebase)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 3. Polyfill ResizeObserver (Required for Radix UI / Shadcn)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Attach to global and window (if available)
global.ResizeObserver = ResizeObserver;
if (typeof window !== "undefined") {
  window.ResizeObserver = ResizeObserver;
}

// 4. Polyfill matchMedia (Required for Sonner)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
