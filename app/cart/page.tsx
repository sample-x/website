'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft, faShoppingCart, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, itemCount, isLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  
  // Track if we're on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Redirect to login if trying to checkout while not logged in
  const handleCheckout = () => {
    if (!user) {
      // Save current URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/cart');
      router.push('/login');
      return;
    }

    setIsCheckingOut(true);
    // Navigate to our new checkout page
    router.push('/checkout');
  };
  
  // Show loading state while we're fetching cart data or during server-side rendering
  if (!isClientSide || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white shadow-md rounded-lg p-8">
              <div className="text-gray-500 mb-4">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl fa-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading your cart...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white shadow-md rounded-lg p-8">
              <div className="text-gray-500 mb-4">
                <FontAwesomeIcon icon={faShoppingCart} className="text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any samples to your cart yet.</p>
              <Link
                href="/samples"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Browse Samples
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/samples"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({itemCount} items)</h1>
          </div>

          {/* Debug info in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-4 rounded-md mb-6 text-xs">
              <h4 className="font-bold mb-2">Debug Info:</h4>
              <pre className="overflow-auto max-h-28">
                {JSON.stringify({items, isLoading, isClientSide}, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="py-6 flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.type}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.location}</p>
                    </div>

                    <div className="ml-6">
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        name={`quantity-${item.id}`}
                        min="1"
                        max={item.quantity || 10}
                        value={item.quantity_selected}
                        onChange={(e) => updateQuantity(item.id.toString(), parseInt(e.target.value))}
                        className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      />
                    </div>

                    <div className="ml-6">
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity_selected).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="ml-6">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id.toString())}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                        <span className="sr-only">Remove item</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>${total.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes will be calculated at checkout.</p>
              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
              </div>
              <div className="mt-6 flex justify-center text-sm text-gray-500">
                <p>
                  or{' '}
                  <Link href="/samples" className="text-orange-600 font-medium hover:text-orange-500">
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 