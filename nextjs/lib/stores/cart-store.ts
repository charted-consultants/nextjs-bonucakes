/**
 * Cart Store - Zustand
 * Manages shopping cart state with localStorage persistence
 *
 * Features:
 * - Add/remove items
 * - Update quantities
 * - Calculate totals with shipping
 * - "Buy 10 get 1 free" promotion
 * - £8 flat shipping fee
 * - Multilingual support
 * - localStorage persistence
 */

import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
  CartStore,
  CartItem,
  AddToCartProduct,
  CartPromotion,
  CartTotals,
  CartAPIItem,
} from '@/types/cart';

const SHIPPING_FEE = 10;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Utility: parse numeric price from display string like "£15 / 500gr"
      parseDisplayPrice: (text: string): number => {
        if (!text || typeof text !== 'string') return 0;
        const match = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
      },

      // Utility: parse unit from display price like "£15 / 500g" -> "500g"
      parseDisplayUnit: (text: string): string => {
        if (!text || typeof text !== 'string') return '';
        const match = text.match(/\/\s*(.+)$/);
        return match ? match[1].trim() : '';
      },

      // Add item to cart
      addItem: (product: AddToCartProduct, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id
          );

          if (existingItem) {
            // Update quantity of existing item
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            // Add new item
            const amount = Number(product.price.amount || 0);
            const unitPrice =
              amount > 0 ? amount : get().parseDisplayPrice(product.price.displayPrice || '');

            const newItem: CartItem = {
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              quantity,
              unitPrice,
              currency: product.price.currency,
              displayPrice: product.price.displayPrice,
              displayPriceVi: product.price.displayPriceVi,
              unitEn:
                product.price.unit?.en ||
                get().parseDisplayUnit(product.price.displayPrice || ''),
              unitVi:
                product.price.unit?.vi ||
                get().parseDisplayUnit(product.price.displayPriceVi || product.price.displayPrice || ''),
              image: product.images && product.images.length > 0 ? product.images[0] : null,
              hasPromo: product.hasPromo ?? false,
            };

            return {
              items: [...state.items, newItem],
            };
          }
        });
      },

      // Remove item from cart
      removeItem: (productId: string | number) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      // Update item quantity
      updateQuantity: (productId: string | number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      // Clear entire cart
      clearCart: () => {
        set({ items: [] });
      },

      // Get total number of items
      getCartCount: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get merchandise subtotal
      getSubtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const qty = Number(item.quantity || 0);
          let price = Number(item.unitPrice || 0);

          if (!price || price <= 0) {
            price = state.parseDisplayPrice(item.displayPrice || '');
          }

          if (!price || !qty) return total;
          return total + qty * price;
        }, 0);
      },

      // Get shipping fee (flat rate if cart has items)
      getShippingFee: () => {
        const state = get();
        return state.items.length > 0 ? SHIPPING_FEE : 0;
      },

      // Get grand total (subtotal + shipping)
      getTotal: () => {
        const state = get();
        return state.getSubtotal() + state.getShippingFee();
      },

      // Get all totals at once
      getTotals: (): CartTotals => {
        const state = get();
        const subtotal = state.getSubtotal();
        const shipping = state.getShippingFee();
        const total = subtotal + shipping;
        const itemCount = state.getCartCount();

        return {
          subtotal,
          shipping,
          total,
          itemCount,
        };
      },

      // Calculate promotions (buy 10 get 1 free per product)
      getPromotions: (): CartPromotion[] => {
        const state = get();
        const promotions: CartPromotion[] = [];

        state.items.forEach((item) => {
          if (!item.hasPromo) return;
          const freeItems = Math.floor(item.quantity / 10);
          if (freeItems > 0) {
            promotions.push({
              productId: item.productId,
              productName: item.productName,
              freeItems,
              message: `Buy 10 get 1 free (actually ${item.quantity + freeItems} items)`,
            });
          }
        });

        return promotions;
      },

      // Get cart formatted for API submission
      getCartForAPI: (): CartAPIItem[] => {
        const state = get();
        return state.items.map((item) => ({
          productId: item.productId,
          productName: item.productName.vi,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice || 0) || undefined,
          unitVi: item.unitVi || state.parseDisplayUnit(item.displayPriceVi || item.displayPrice || '') || undefined,
          unitEn: item.unitEn || state.parseDisplayUnit(item.displayPrice || '') || undefined,
        }));
      },
    }),
    {
      name: 'bonu_cart',
      storage: createJSONStorage(() => localStorage),
      // Data migration for old cart format
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as CartStore;

        // Helper function to parse price from display string
        const parseDisplayPrice = (text: string): number => {
          if (!text || typeof text !== 'string') return 0;
          const match = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : 0;
        };

        // Helper function to parse unit from display string
        const parseDisplayUnit = (text: string): string => {
          if (!text || typeof text !== 'string') return '';
          const match = text.match(/\/\s*(.+)$/);
          return match ? match[1].trim() : '';
        };

        state.items.forEach((item) => {
          const price = Number(item.unitPrice);
          if (!price || price <= 0) {
            const parsed = parseDisplayPrice(item.displayPrice || '');
            if (parsed > 0) {
              item.unitPrice = parsed;
            }
          }

          // Backfill unit labels if missing
          if (!item.unitEn && (item.displayPrice || item.displayPriceVi)) {
            const unitFromEn = parseDisplayUnit(item.displayPrice || '');
            const unitFromVi = parseDisplayUnit(item.displayPriceVi || item.displayPrice || '');
            if (unitFromEn) {
              item.unitEn = unitFromEn;
            }
            if (unitFromVi) {
              item.unitVi = unitFromVi;
            }
          }
        });

        return state;
      },
    }
  )
);

// Selector hooks for better performance
export const useCartItems = () => useCartStore((state) => state.items);

export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));

export const useCartTotals = () =>
  useCartStore(
    useShallow((state) => {
      const subtotal = state.items.reduce((total, item) => {
        const qty = Number(item.quantity || 0);
        let price = Number(item.unitPrice || 0);
        if (!price || price <= 0) {
          price = state.parseDisplayPrice(item.displayPrice || '');
        }
        if (!price || !qty) return total;
        return total + qty * price;
      }, 0);
      const shipping = state.items.length > 0 ? 10 : 0;
      const total = subtotal + shipping;
      const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      return { subtotal, shipping, total, itemCount };
    })
  );

export const useCartPromotions = () => {
  const items = useCartItems();
  return useMemo(() => {
    const promotions: CartPromotion[] = [];
    items.forEach((item) => {
      if (!item.hasPromo) return;
      const freeItems = Math.floor(item.quantity / 10);
      if (freeItems > 0) {
        promotions.push({
          productId: item.productId,
          productName: item.productName,
          freeItems,
          message: `Buy 10 get 1 free (actually ${item.quantity + freeItems} items)`,
        });
      }
    });
    return promotions;
  }, [items]);
};
