module.exports = {
  extends: [
    'next/core-web-vitals',
  ],
  rules: {
    // Disable rules causing problems
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn',
    
    // Add any other custom rules here
  }
};
