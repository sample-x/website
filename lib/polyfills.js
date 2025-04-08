// Standard polyfills for browser-only APIs in Node.js environment
if (typeof window === 'undefined') {
  global.window = global;
  global.self = global;
  global.document = {
    createElement: () => ({ style: {} }),
    getElementsByTagName: () => ([]),
    querySelector: () => null,
    documentElement: { style: {} }
  };
  global.navigator = {
    userAgent: 'node',
    platform: 'node'
  };
  global.location = { href: '', protocol: 'https:', host: '' };
}
