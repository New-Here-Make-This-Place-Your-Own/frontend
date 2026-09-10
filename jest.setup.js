const { jest: jestMock } = require('@jest/globals');
// Expo 57 installs a lazy native fetch getter; unit tests provide their own responses.
Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: jestMock.fn() });
