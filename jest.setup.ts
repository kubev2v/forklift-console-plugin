import { TextDecoder, TextEncoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

import '@testing-library/jest-dom/jest-globals';

const MockIntersectionObserver = jest.fn().mockImplementation(() => ({
  disconnect: jest.fn(),
  observe: jest.fn(),
  root: null,
  rootMargin: '',
  takeRecords: jest.fn(() => []),
  thresholds: [],
  unobserve: jest.fn(),
}));

Object.defineProperty(global, 'IntersectionObserver', {
  configurable: true,
  value: MockIntersectionObserver,
  writable: true,
});
