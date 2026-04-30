/**
 * Cart Types
 * Type definitions for cart items and state management
 */

export interface CartItemImage {
  url: string;
  alt: string;
}

export interface ProductPrice {
  amount: number;
  currency: string;
  displayPrice: string;
  displayPriceVi?: string;
  unit?: {
    en: string;
    vi: string;
  };
}

export interface CartItem {
  productId: string | number;
  productSlug: string;
  productName: {
    en: string;
    vi: string;
  };
  quantity: number;
  unitPrice: number;
  currency: string;
  displayPrice: string;
  displayPriceVi?: string;
  unitEn: string;
  unitVi: string;
  image: CartItemImage | null;
  hasPromo?: boolean;
}

export interface CartPromotion {
  productId: string | number;
  productName: {
    en: string;
    vi: string;
  };
  freeItems: number;
  message: string;
}

export interface CartState {
  items: CartItem[];
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface CartStore extends CartState {
  // Actions
  addItem: (product: AddToCartProduct, quantity?: number) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;

  // Computed values
  getCartCount: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getTotals: () => CartTotals;
  getPromotions: () => CartPromotion[];
  getCartForAPI: () => CartAPIItem[];

  // Internal utilities
  parseDisplayPrice: (text: string) => number;
  parseDisplayUnit: (text: string) => string;
}

export interface AddToCartProduct {
  id: string | number;
  slug: string;
  name: {
    en: string;
    vi: string;
  };
  price: ProductPrice;
  images?: CartItemImage[];
  hasPromo?: boolean;
}

export interface CartAPIItem {
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice?: number;
  unitVi?: string;
  unitEn?: string;
}
