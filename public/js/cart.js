// Cart management using localStorage
const Cart = {
    STORAGE_KEY: 'bonu_cart',
    SHIPPING_FEE: 8,

    // Get current cart (migrates missing numeric prices from displayPrice)
    getCart() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        const cart = raw ? JSON.parse(raw) : { items: [] };
        let changed = false;
        cart.items.forEach(item => {
            const price = Number(item && item.unitPrice);
            if (!price || price <= 0) {
                const parsed = this.parseDisplayPrice(item && item.displayPrice ? item.displayPrice : '');
                if (parsed > 0) {
                    item.unitPrice = parsed;
                    changed = true;
                }
            }
            // Data migration for localized display price and correct EN unit for banh mi
            if (item && item.productSlug === 'banh-mi-sai-gon-half-baked') {
                if (!item.displayPriceVi && item.displayPrice) {
                    item.displayPriceVi = item.displayPrice; // old data had only VI in displayPrice
                    changed = true;
                }
                // Ensure English display uses loaf (not Vietnamese 'ổ')
                const numeric = Number(item.unitPrice || 0) || this.parseDisplayPrice(item.displayPrice || '');
                if (!item.displayPrice || /ổ/.test(item.displayPrice)) {
                    if (numeric > 0) {
                        item.displayPrice = `£${numeric} / loaf`;
                    } else {
                        item.displayPrice = '£9 / loaf';
                    }
                    changed = true;
                }
            }
            // Backfill unit labels if missing
            if (!item.unitEn && (item.displayPrice || item.displayPriceVi)) {
                const unitFromEn = this.parseDisplayUnit(item.displayPrice || '');
                const unitFromVi = this.parseDisplayUnit(item.displayPriceVi || item.displayPrice || '');
                if (unitFromEn) { item.unitEn = unitFromEn; changed = true; }
                if (unitFromVi) { item.unitVi = unitFromVi; changed = true; }
            }
        });
        if (changed) this.saveCart(cart);
        return cart;
    },

    // Save cart to localStorage
    saveCart(cart) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        this.triggerCartUpdate();
    },

    // Add item to cart
    addToCart(product, quantity = 1) {
        const cart = this.getCart();

        // Check if product already exists
        const existingItem = cart.items.find(item => item.productId === product.id);

        if (existingItem) {
            // Update quantity
            existingItem.quantity += quantity;
        } else {
            // Add new item
            const amount = Number(product.price.amount || 0);
            const unitPrice = amount > 0 ? amount : this.parseDisplayPrice(product.price.displayPrice || '');
            cart.items.push({
                productId: product.id,
                productSlug: product.slug,
                productName: product.name,
                quantity: quantity,
                unitPrice: unitPrice,
                currency: product.price.currency,
                displayPrice: product.price.displayPrice,
                displayPriceVi: product.price.displayPriceVi,
                unitEn: product.price.unit && product.price.unit.en ? product.price.unit.en : this.parseDisplayUnit(product.price.displayPrice || ''),
                unitVi: product.price.unit && product.price.unit.vi ? product.price.unit.vi : this.parseDisplayUnit(product.price.displayPriceVi || product.price.displayPrice || ''),
                image: product.images && product.images.length > 0 ? product.images[0] : null
            });
        }

        this.saveCart(cart);
        return cart;
    },

    // Remove item from cart
    removeFromCart(productId) {
        const cart = this.getCart();
        cart.items = cart.items.filter(item => item.productId !== productId);
        this.saveCart(cart);
        return cart;
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.items.find(item => item.productId === productId);

        if (item) {
            if (quantity <= 0) {
                // Remove if quantity is 0 or negative
                return this.removeFromCart(productId);
            }
            item.quantity = quantity;
            this.saveCart(cart);
        }

        return cart;
    },

    // Clear entire cart
    clearCart() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.triggerCartUpdate();
    },

    // Get total number of items
    getCartCount() {
        const cart = this.getCart();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get merchandise subtotal
    getCartTotal() {
        const cart = this.getCart();
        return cart.items.reduce((total, item) => {
            const qty = Number(item.quantity || 0);
            let price = Number(item.unitPrice || 0);
            if (!price || price <= 0) price = this.parseDisplayPrice(item.displayPrice || '');
            if (!price || !qty) return total;
            return total + (qty * price);
        }, 0);
    },

    // Flat shipping fee per order (applies if cart has items)
    getShippingFee() {
        const cart = this.getCart();
        return cart.items && cart.items.length > 0 ? this.SHIPPING_FEE : 0;
    },

    // Grand total = subtotal + shipping
    getGrandTotal() {
        const sub = this.getCartTotal();
        const ship = this.getShippingFee();
        return sub + ship;
    },

    // Utility: parse number from display price like "£15 / 500gr"
    parseDisplayPrice(text) {
        if (!text || typeof text !== 'string') return 0;
        const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
        return m ? parseFloat(m[1]) : 0;
    },

    // Utility: parse unit text from display price like "£15 / 500g" -> "500g"
    parseDisplayUnit(text) {
        if (!text || typeof text !== 'string') return '';
        const m = text.match(/\/\s*(.+)$/);
        return m ? m[1].trim() : '';
    },

    // Calculate promotion (buy 10 get 1 free per product)
    calculatePromotions() {
        const cart = this.getCart();
        const promotions = [];

        cart.items.forEach(item => {
            const freeItems = Math.floor(item.quantity / 10);
            if (freeItems > 0) {
                promotions.push({
                    productId: item.productId,
                    productName: item.productName,
                    freeItems: freeItems,
                    message: `Mua 10 tặng 1 (thực tế ${item.quantity + freeItems} ổ)`
                });
            }
        });

        return promotions;
    },

    // Trigger custom event when cart updates
    triggerCartUpdate() {
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: this.getCart() }
        }));
    },

    // Get cart for API submission
    getCartForAPI() {
        const cart = this.getCart();
        return cart.items.map(item => ({
            productId: item.productId,
            productName: item.productName.vi || item.productName,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice || 0) || undefined,
            unitVi: item.unitVi || this.parseDisplayUnit(item.displayPriceVi || item.displayPrice || '') || undefined,
            unitEn: item.unitEn || this.parseDisplayUnit(item.displayPrice || '') || undefined
        }));
    }
};

// Export for use in other scripts
window.Cart = Cart;
