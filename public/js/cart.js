// Cart management using localStorage
const Cart = {
    STORAGE_KEY: 'bonu_cart',

    // Get current cart
    getCart() {
        const cart = localStorage.getItem(this.STORAGE_KEY);
        return cart ? JSON.parse(cart) : { items: [] };
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
            cart.items.push({
                productId: product.id,
                productSlug: product.slug,
                productName: product.name,
                quantity: quantity,
                unitPrice: product.price.amount,
                currency: product.price.currency,
                displayPrice: product.price.displayPrice,
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

    // Get total price
    getCartTotal() {
        const cart = this.getCart();
        return cart.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
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
            quantity: item.quantity
        }));
    }
};

// Export for use in other scripts
window.Cart = Cart;
