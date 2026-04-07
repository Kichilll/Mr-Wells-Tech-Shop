// Cart functionality
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
  }

  loadCart() {
    const cart = localStorage.getItem('wts-cart');
    return cart ? JSON.parse(cart) : [];
  }

  saveCart() {
    localStorage.setItem('wts-cart', JSON.stringify(this.items));
    this.updateCartUI();
  }

  addItem(productId, productName, price, options = {}) {
    const existingItem = this.items.find(
      item => item.productId === productId && JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        productId,
        productName,
        price,
        quantity: 1,
        options
      });
    }
    this.saveCart();
  }

  removeItem(productId, options = {}) {
    this.items = this.items.filter(
      item => !(item.productId === productId && JSON.stringify(item.options) === JSON.stringify(options))
    );
    this.saveCart();
  }

  updateQuantity(productId, quantity, options = {}) {
    const item = this.items.find(
      item => item.productId === productId && JSON.stringify(item.options) === JSON.stringify(options)
    );
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }

  getCartTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  updateCartUI() {
    const cartBadges = document.querySelectorAll('.cart-count');
    const count = this.getCartCount();
    cartBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Add to cart function
function addToCart(productId, productName, price, storage = '', color = '') {
  const options = {};
  if (storage) options.storage = storage;
  if (color) options.color = color;

  cart.addItem(productId, productName, price, options);
  
  // Show notification
  showNotification(`${productName} added to cart!`);
}

// Remove from cart
function removeFromCart(productId, options = {}) {
  cart.removeItem(productId, options);
}

// Update quantity
function updateCartItemQuantity(productId, quantity, options = {}) {
  if (quantity <= 0) {
    removeFromCart(productId, options);
  } else {
    cart.updateQuantity(productId, quantity, options);
  }
}

// Notification system
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Initialize cart UI on page load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateCartUI();

  // Add event listeners to product pages
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.dataset.productId;
      const productName = this.dataset.productName;
      const price = parseFloat(this.dataset.price);
      const storage = document.querySelector(`[data-product="${productId}"] .storage-select`)?.value || '';
      const color = document.querySelector(`[data-product="${productId}"] .color-select`)?.value || '';

      addToCart(productId, productName, price, storage, color);
    });
  });
});
