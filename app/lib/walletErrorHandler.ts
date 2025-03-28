// Utility to handle wallet-related errors
export function handleWalletError(error: Error) {
  // Ignore Phantom wallet injection errors
  if (error.message.includes('Could not establish connection') ||
      error.message.includes('Receiving end does not exist')) {
    console.debug('Wallet connection error (non-critical):', error.message);
    return;
  }

  // Log other wallet-related errors
  console.error('Wallet error:', error);
} 