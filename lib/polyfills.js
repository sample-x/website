// Standard polyfills for browser-only APIs in Node.js environment
if (typeof window === 'undefined') {
  global.window = global;
  global.self = global;
  global.document = {
    createElement: () => ({}),
    getElementsByTagName: () => [],
    querySelector: () => null,
  };
  global.navigator = {
    userAgent: 'node',
    platform: process.platform,
  };
  global.location = { href: '', protocol: 'https:', host: '' };
}
