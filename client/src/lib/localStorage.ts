interface CartItem {
  productId: string;
  quantity: number;
}

interface LocalCart {
  items: CartItem[];
}

interface LocalWishlist {
  products: string[];
}

export const localStorageService = {
  getCart(): LocalCart {
    try {
      const cart = localStorage.getItem('guest_cart');
      return cart ? JSON.parse(cart) : { items: [] };
    } catch {
      return { items: [] };
    }
  },

  setCart(cart: LocalCart): void {
    localStorage.setItem('guest_cart', JSON.stringify(cart));
  },

  addToCart(productId: string, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    this.setCart(cart);
  },

  updateCartQuantity(productId: string, quantity: number): void {
    const cart = this.getCart();
    const item = cart.items.find(item => item.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      this.setCart(cart);
    }
  },

  removeFromCart(productId: string): void {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.productId !== productId);
    this.setCart(cart);
  },

  clearCart(): void {
    localStorage.removeItem('guest_cart');
  },

  getWishlist(): LocalWishlist {
    try {
      const wishlist = localStorage.getItem('guest_wishlist');
      return wishlist ? JSON.parse(wishlist) : { products: [] };
    } catch {
      return { products: [] };
    }
  },

  setWishlist(wishlist: LocalWishlist): void {
    localStorage.setItem('guest_wishlist', JSON.stringify(wishlist));
  },

  addToWishlist(productId: string): void {
    const wishlist = this.getWishlist();
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      this.setWishlist(wishlist);
    }
  },

  removeFromWishlist(productId: string): void {
    const wishlist = this.getWishlist();
    wishlist.products = wishlist.products.filter(id => id !== productId);
    this.setWishlist(wishlist);
  },

  isInWishlist(productId: string): boolean {
    const wishlist = this.getWishlist();
    return wishlist.products.includes(productId);
  },

  clearWishlist(): void {
    localStorage.removeItem('guest_wishlist');
  }
};
