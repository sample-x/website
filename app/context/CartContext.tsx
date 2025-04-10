'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { useAuth } from '@/app/auth/AuthProvider';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { isStaticExport } from '@/app/lib/staticData';

// Add expiration time constant at the top after imports
const CART_EXPIRATION_HOURS = 8;

// Update Sample type to match database structure
export type Sample = {
  id: string;
  collection_date: string;
  created_at: string;
  description: string | null;
  geog: unknown;
  institution_contact_email: string | null;
  institution_contact_name: string | null;
  institution_name: string;
  inStock: boolean;
  latitude: number | null;
  longitude: number | null;
  name: string;
  price: number;
  quantity: number;
  type: string;
  storage_condition?: string;
  location: string;
  updated_at: string;
  user_id: string | null;
};

interface CartItem extends Sample {
  quantity_selected: number;
  added_at: number; // Make this required
}

interface CartContextType {
  items: CartItem[];
  addToCart: (sample: Sample, quantity?: number) => void;
  removeFromCart: (sampleId: string) => void;
  updateQuantity: (sampleId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatic, setIsStatic] = useState(false);
  const router = useRouter();

  // Check if we're in static mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const staticMode = isStaticExport();
      console.log('CartContext: Static mode detected:', staticMode);
      setIsStatic(staticMode);
      if (staticMode) {
        setUseLocalStorage(true);
      }
    }
  }, []);

  // Load cart from localStorage or database when component mounts or user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        setIsInitialized(false);
        
        // Clear cart if user logged out
        if (!user && !isLoading) {
          setItems([]);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cart');
          }
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // First, try to get items from localStorage (ONLY ON CLIENT)
        let localItems: CartItem[] = [];
        if (typeof window !== 'undefined') {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              localItems = JSON.parse(savedCart);
              // Filter out expired items
              localItems = filterExpiredItems(localItems);
              console.log('Loaded cart from localStorage:', localItems);
              setItems(localItems);
            } catch (e) {
              console.error('Error parsing cart from localStorage:', e);
              localStorage.removeItem('cart');
            }
          }
        }

        // In static mode, always use localStorage
        if (isStatic) {
          setUseLocalStorage(true);
          setItems(localItems);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        if (user) {
          console.log('User is logged in, loading cart from database for user:', user.id);
          // Try to load cart from Supabase if user is logged in
          try {
            const { data, error } = await supabase
              .from('cart_items')
              .select(`
                quantity,
                sample_id,
                samples (*)
              `)
              .eq('user_id', user.id);

            if (error) {
              console.error('Error loading cart from database:', error);
              // If there's a database error, fall back to localStorage
              setUseLocalStorage(true);
              // Make sure we keep the items already set from localStorage
              // No need to call setItems again as we've already set them above
            } else {
              const dbItems = data?.map(mapOrderItemToCartItem) || [];

              console.log('Loaded cart from database:', dbItems);

              // If we have items in localStorage, merge them with database items
              if (localItems.length > 0) {
                const mergedItems = [...dbItems];
                
                // Add localStorage items that don't exist in DB
                localItems.forEach(localItem => {
                  const existingItem = mergedItems.find(item => item.id === localItem.id);
                  if (!existingItem) {
                    mergedItems.push(localItem);
                  }
                });

                // Save merged items to database
                try {
                  // First, delete existing cart items
                  const { error: deleteError } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id);

                  if (!deleteError) {
                    // Then insert merged items
                    const { error: insertError } = await supabase
                      .from('cart_items')
                      .insert(
                        mergedItems.map(item => ({
                          user_id: user.id,
                          sample_id: item.id,
                          quantity: item.quantity_selected
                        }))
                      );

                    if (!insertError) {
                      setItems(mergedItems);
                      setUseLocalStorage(false);
                      // Always keep the cart in localStorage as backup
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('cart', JSON.stringify(mergedItems));
                      }
                      setIsInitialized(true);
                      setIsLoading(false);
                      return;
                    }
                  }
                } catch (e) {
                  console.error('Error merging carts:', e);
                }
              }

              // Only update if we actually have items from DB, otherwise keep localStorage
              if (dbItems.length > 0) {
                setItems(dbItems);
                setUseLocalStorage(false);
                // Always keep localStorage as backup
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cart', JSON.stringify(dbItems));
                }
              } else if (localItems.length > 0) {
                // DB is empty but we have localStorage items, keep using those
                setItems(localItems);
                setUseLocalStorage(true);
              }
            }
          } catch (dbError) {
            console.error('Error querying cart from database:', dbError);
            // Keep using localStorage items
            setUseLocalStorage(true);
          }
        } else {
          console.log('User not logged in, using localStorage for cart');
          // Not logged in, use localStorage items (already loaded if client-side)
          setUseLocalStorage(true);
          // Only set items if we haven't already done it above
          if (localItems.length > 0 && items.length === 0) {
            setItems(localItems);
          }
        }
      } catch (error) {
        console.error('Error in loadCart:', error);
        setUseLocalStorage(true);
        if (!user) {
          setItems([]);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cart');
          }
        }
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user, supabase, isStatic]);

  // Save cart to localStorage when it changes (ONLY ON CLIENT)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && !isLoading) {
      // Always save to localStorage as a fallback, regardless of user state
      try {
        console.log('Saving cart to localStorage:', items);
        localStorage.setItem('cart', JSON.stringify(items));
      } catch (e) {
        console.error('Error saving cart to localStorage:', e);
      }
    }
  }, [items, isInitialized, isLoading]);

  // Save cart to database when logged in and cart changes (but not in static mode)
  useEffect(() => {
    const saveCartToDatabase = async () => {
      if (!user || !isInitialized || isSaving || useLocalStorage || isStatic) return;

      setIsSaving(true);
      try {
        // First, delete existing cart items
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting existing cart items:', deleteError);
          setUseLocalStorage(true);
          return;
        }

        // Then insert new cart items if there are any
        if (items.length > 0) {
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert(
              items.map(item => ({
                user_id: user.id,
                sample_id: item.id,
                quantity: item.quantity_selected
              }))
            );

          if (insertError) {
            console.error('Error inserting cart items:', insertError);
            setUseLocalStorage(true);
            return;
          }
          
          // Successfully saved to DB, but still keep in localStorage as backup
          if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(items));
          }
          setUseLocalStorage(false);
        }
      } catch (error) {
        console.error('Error saving cart to database:', error);
        setUseLocalStorage(true);
      } finally {
        setIsSaving(false);
      }
    };

    if (user && isInitialized && !useLocalStorage && !isStatic) {
      saveCartToDatabase();
    }
  }, [items, user, supabase, isInitialized, isSaving, useLocalStorage, isStatic]);

  const addToCart = (sample: Sample, quantity: number = 1) => {
    if (!user && !useLocalStorage) {
      toast.error('Please log in to add items to cart');
      router.push('/login');
      return;
    }

    const now = Date.now();
    const newItem: CartItem = {
      ...sample,
      quantity_selected: quantity,
      added_at: now
    };

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === sample.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === sample.id
            ? { ...item, quantity_selected: item.quantity_selected + quantity, added_at: now }
            : item
        );
      }
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (sampleId: string) => {
    setItems(currentItems => {
      const updatedItems = currentItems.filter(item => item.id.toString() !== sampleId);
      
      // Always update localStorage immediately for all users
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cart', JSON.stringify(updatedItems));
        } catch (e) {
          console.error('Error saving cart to localStorage:', e);
        }
      }
      
      toast.success('Removed from cart');
      return updatedItems;
    });
  };

  const updateQuantity = (sampleId: string, newQuantity: number) => {
    setItems(currentItems => {
      const updatedItems = currentItems.map(item => {
        if (item.id.toString() === sampleId) {
          const maxQuantity = item.quantity || 0;
          if (newQuantity > maxQuantity) {
            toast.error('Cannot exceed available quantity');
            return item;
          }
          return { ...item, quantity_selected: newQuantity };
        }
        return item;
      });
      
      // Always update localStorage immediately for all users
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cart', JSON.stringify(updatedItems));
        } catch (e) {
          console.error('Error saving cart to localStorage:', e);
        }
      }
      
      return updatedItems;
    });
  };

  const clearCart = () => {
    // Allow guests to clear their cart too
    setItems([]);
    
    // Clear localStorage cart for all users
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cart');
      } catch (e) {
        console.error('Error clearing cart from localStorage:', e);
      }
    }
    
    toast.success('Cart cleared');
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity_selected,
    0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity_selected,
    0
  );

  // Add a function to filter expired items
  const filterExpiredItems = (items: CartItem[]): CartItem[] => {
    const now = Date.now();
    return items.filter(item => {
      const itemAge = now - (item.added_at || 0);
      return itemAge < (CART_EXPIRATION_HOURS * 60 * 60 * 1000);
    });
  };

  // Add an effect to periodically check for expired items
  useEffect(() => {
    const checkExpiration = () => {
      setItems(prevItems => filterExpiredItems(prevItems));
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 

// Update the mapping function to handle nullable fields
const mapOrderItemToCartItem = (item: { 
  quantity: number; 
  sample_id: string; 
  samples: { 
    collection_date: string;
    created_at: string;
    description: string | null;
    geog: unknown;
    id: string;
    institution_contact_email: string | null;
    institution_contact_name: string | null;
    institution_name: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string;
    price: number;
    quantity: number;
    type: string;
    storage_condition?: string;
    location: string;
    updated_at: string;
    user_id: string | null;
  }
}): CartItem => {
  const { samples, ...rest } = item;
  return {
    ...samples,
    id: item.sample_id,
    quantity_selected: item.quantity,
    added_at: Date.now(),
    inStock: Number(samples.quantity) > 0,
    institution_name: samples.institution_name || '',
    latitude: samples.latitude || 0,
    longitude: samples.longitude || 0
  };
};