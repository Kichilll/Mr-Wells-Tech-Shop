// Cart display and checkout functionality

function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const emptyMessage = document.getElementById('emptyCartMessage');

  if (cart.items.length === 0) {
    container.innerHTML = '';
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';
  container.innerHTML = cart.items.map((item, index) => {
    const optionsText = Object.entries(item.options)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(' | ');

    return `
      <div class="cart-item" data-index="${index}">
        <div class="item-image">
          <div style="width: 80px; height: 80px; background: var(--card-bg); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            📱
          </div>
        </div>
        <div class="item-details">
          <h3>${item.productName}</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">${optionsText || 'No options selected'}</p>
          <p style="color: #0ea5e9; font-weight: 600; margin-top: 8px;">$${item.price.toFixed(2)}</p>
        </div>
        <div class="item-quantity">
          <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
          <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
          <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
        </div>
        <div class="item-total">
          <p style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <button class="remove-btn" onclick="removeItemFromCart(${index})">🗑</button>
      </div>
    `;
  }).join('');

  updateOrderSummary();
}

function removeItemFromCart(index) {
  const item = cart.items[index];
  cart.removeItem(item.productId, item.options);
  renderCartItems();
}

function increaseQuantity(index) {
  const item = cart.items[index];
  cart.updateQuantity(item.productId, item.quantity + 1, item.options);
  renderCartItems();
}

function decreaseQuantity(index) {
  const item = cart.items[index];
  if (item.quantity > 1) {
    cart.updateQuantity(item.productId, item.quantity - 1, item.options);
  } else {
    removeItemFromCart(index);
  }
  renderCartItems();
}

function updateQuantity(index, newQuantity) {
  newQuantity = parseInt(newQuantity);
  if (newQuantity <= 0) {
    removeItemFromCart(index);
  } else {
    const item = cart.items[index];
    cart.updateQuantity(item.productId, newQuantity, item.options);
    renderCartItems();
  }
}

function updateOrderSummary() {
  const subtotal = cart.getCartTotal();
  const tax = (subtotal * 0.10); // 10% tax
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
}

function openCheckout() {
  if (cart.items.length === 0) {
    showNotification('Your cart is empty!');
    return;
  }
  
  const modal = document.getElementById('checkoutModal');
  modal.style.display = 'flex';
  renderCheckoutReview();
}

function contactViaWhatsApp() {
  const cartSummary = cart.items.map(item => {
    return `${item.productName} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`;
  }).join('\n');
  
  const total = cart.getCartTotal();
  const tax = (total * 0.10);
  const finalTotal = total + tax;
  
  const message = encodeURIComponent(
    `Hi Mr Wells! 👋\n\nI'd like to purchase the following items:\n\n${cartSummary}\n\nSubtotal: $${total.toFixed(2)}\nTax (10%): $${tax.toFixed(2)}\nTotal: $${finalTotal.toFixed(2)}\n\nPlease confirm availability. Thank you!`
  );
  
  window.open(`https://wa.me/971556516551?text=${message}`, '_blank');
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
}

function renderCheckoutReview() {
  const reviewContainer = document.getElementById('checkoutOrderReview');
  
  if (cart.items.length === 0) {
    reviewContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No items in cart</p>';
    return;
  }
  
  reviewContainer.innerHTML = cart.items.map((item, index) => {
    return `
      <div class="review-item-editable" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 8px;">${item.productName}</div>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">$${item.price.toFixed(2)} each</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="qty-btn-modal" style="padding: 4px 8px; font-size: 0.9rem;" onclick="decreaseCheckoutQuantity(${index})">−</button>
            <input type="number" value="${item.quantity}" min="1" style="width: 50px; padding: 6px; text-align: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: var(--text-main);" onchange="updateCheckoutQuantity(${index}, this.value)">
            <button type="button" class="qty-btn-modal" style="padding: 4px 8px; font-size: 0.9rem;" onclick="increaseCheckoutQuantity(${index})">+</button>
            <button type="button" class="qty-btn-modal" style="padding: 4px 12px; font-size: 1rem; color: #ff6b6b; margin-left: auto;" onclick="removeCheckoutItem(${index})" title="Remove item">🗑</button>
          </div>
        </div>
        <div style="text-align: right; min-width: 80px; font-weight: 600; font-size: 1.1rem;">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
  }).join('');
  
  // Update total after rendering
  updateOrderSummary();
}

// Checkout review quantity controls
function increaseCheckoutQuantity(index) {
  const item = cart.items[index];
  cart.updateQuantity(item.productId, item.quantity + 1, item.options);
  renderCheckoutReview();
}

function decreaseCheckoutQuantity(index) {
  const item = cart.items[index];
  if (item.quantity > 1) {
    cart.updateQuantity(item.productId, item.quantity - 1, item.options);
  } else {
    removeCheckoutItem(index);
  }
  renderCheckoutReview();
}

function updateCheckoutQuantity(index, newQuantity) {
  newQuantity = parseInt(newQuantity);
  if (newQuantity <= 0) {
    removeCheckoutItem(index);
  } else {
    const item = cart.items[index];
    cart.updateQuantity(item.productId, newQuantity, item.options);
  }
  renderCheckoutReview();
}

function removeCheckoutItem(index) {
  const item = cart.items[index];
  cart.removeItem(item.productId, item.options);
  
  if (cart.items.length === 0) {
    showNotification('Cart is empty. Closing checkout...');
    setTimeout(() => {
      closeCheckout();
    }, 1000);
  } else {
    renderCheckoutReview();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Render cart on cart page
  if (document.getElementById('cartItemsContainer')) {
    renderCartItems();
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckout);
  }

  // Promo code
  const applyPromoBtn = document.getElementById('applyPromo');
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
      const promoCode = document.getElementById('promoCode').value;
      if (promoCode.toLowerCase() === 'wells10') {
        showNotification('Promo code applied! 10% discount activated.');
      } else {
        showNotification('Invalid promo code');
      }
    });
  }

  // Checkout form submit
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Collect customer information
      const fullName = document.getElementById('fullName').value;
      const location = document.getElementById('location').value;
      const phone = document.getElementById('phone').value;
      
      // Build order summary
      const cartSummary = cart.items.map(item => {
        return `• ${item.productName} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`;
      }).join('\n');
      
      const subtotal = cart.getCartTotal();
      const tax = (subtotal * 0.10);
      const total = subtotal + tax;
      
      // Create WhatsApp message
      const message = encodeURIComponent(
        `🛍️ *NEW ORDER FROM WELLS TECH*\n\n` +
        `*Customer Details:*\n` +
        `Name: ${fullName}\n` +
        `Phone: ${phone}\n` +
        `Location: ${location}\n\n` +
        `*Order Items:*\n${cartSummary}\n\n` +
        `*Order Summary:*\n` +
        `Subtotal: $${subtotal.toFixed(2)}\n` +
        `Tax (10%): $${tax.toFixed(2)}\n` +
        `*Total: $${total.toFixed(2)}*\n\n` +
        `Please confirm availability and payment method. Thank you!`
      );
      
      // Show success message
      showNotification('Order submitted! Redirecting to WhatsApp...');
      
      // Clear cart after a short delay
      setTimeout(() => {
        cart.clearCart();
        closeCheckout();
        
        // Redirect to WhatsApp with all order details
        window.open(`https://wa.me/971556516551?text=${message}`, '_blank');
        
        // Redirect to home page after WhatsApp opens
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }, 1000);
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('checkoutModal');
    if (e.target === modal) {
      closeCheckout();
    }
  });
});
