/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import "whatwg-fetch";
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// 1. Polyfill TextEncoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Polyfill ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;
window.ResizeObserver = ResizeObserver;

// 3. Polyfill matchMedia
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
