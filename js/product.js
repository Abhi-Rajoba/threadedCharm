// function getQueryParam(name) {
//   const params = new URLSearchParams(window.location.search);
//   return params.get(name);
// }

// function fmtPrice(p) {
//   return `$${parseFloat(p).toFixed(2)}`;
// }

// async function loadProducts() {
//   const res = await fetch('products.json');
//   if (!res.ok) throw new Error('Failed to load products.json');
//   return res.json();
// }

// async function render() {
//   const id = getQueryParam('id');
//   const root = document.getElementById('product-root');
//   if (!id) {
//     root.innerHTML = '<p>No product specified.</p>';
//     return;
//   }

//   try {
//     const products = await loadProducts();
//     const product = products.find(p => p.id === id);
//     if (!product) {
//       root.innerHTML = '<p>Product not found.</p>';
//       return;
//     }

//     document.title = product.title + ' — Threaded Charm';

//     root.innerHTML = `
//       <div class="product-hero">
//         <div class="product-hero__img">
//           <img src="${product.image}" alt="${product.title}">
//         </div>
//         <div class="product-hero__details">
//           <h1>${product.title}</h1>
//           <div class="product-price">${fmtPrice(product.price)}</div>
//           <div id="product-subtotal" class="product-subtotal" aria-live="polite" aria-atomic="true">Subtotal: ${fmtPrice(product.price)}</div>
//           <p>${product.description}</p>
//           <p><strong>Category:</strong> ${product.category}</p>
//         </div>
//       </div>
//     `;

//     // expose current product for modal/cart fallback
//     window.currentProduct = product;

//     // Add action buttons
//     const details = root.querySelector('.product-hero__details');
//     const actions = document.createElement('div');
//     actions.style.marginTop = '1rem';
//     actions.innerHTML = `
//       <div class="qty-control" aria-label="Quantity" role="group" aria-labelledby="qty-label">
//         <span id="qty-label" class="u-screen-reader-text">Quantity</span>
//         <button type="button" id="qty-decr" class="qty-btn" aria-label="Decrease quantity">−</button>
//         <input id="qty-input" type="number" min="1" value="1" inputmode="numeric" class="qty-input" aria-label="Quantity value" />
//         <button type="button" id="qty-incr" class="qty-btn" aria-label="Increase quantity">＋</button>
//       </div>
//       <div class="action-row">
//         <button id="buy-now" class="btn btn--primary">Buy Now</button>
//       </div>
//     `;
//     details.appendChild(actions);

//     // Wire up cart and buy interactions
//     const qtyInput = document.getElementById('qty-input');
//     const decr = document.getElementById('qty-decr');
//     const incr = document.getElementById('qty-incr');
//     function getQty() { const v = parseInt(qtyInput.value, 10); return isNaN(v) || v < 1 ? 1 : v; }
//     function updateSubtotal() {
//       const subEl = document.getElementById('product-subtotal');
//       if (subEl) {
//         const q = getQty();
//         const unit = parseFloat(product.price) || 0;
//         subEl.textContent = 'Subtotal: ' + fmtPrice(q * unit);
//       }
//     }
//     decr.addEventListener('click', () => { qtyInput.value = Math.max(1, getQty() - 1); updateSubtotal(); });
//     incr.addEventListener('click', () => { qtyInput.value = getQty() + 1; updateSubtotal(); });
//     qtyInput.addEventListener('input', updateSubtotal);
//     updateSubtotal();
//     document.getElementById('buy-now').addEventListener('click', function () {
//       window.currentSelection = { product, qty: getQty() };
//       openBuyModal();
//     });

//     // no cart to render; buy flow only

//   } catch (err) {
//     root.innerHTML = '<p>Error loading product.</p>';
//     console.error(err);
//   }
// }

// document.addEventListener('DOMContentLoaded', render);

// /* ------------------ Cart & Buy Modal Logic ------------------ */

// const CART_KEY = 'lounge_cart';

// function getCart() {
//   // cart removed; always return empty
//   return [];
// }

// function saveCart(cart) {
//   // no-op since cart is disabled
// }

// function addToCart(item, qty = 1, opts = {}) {
//   const options = Object.assign({ openPopup: true, replace: false }, opts);
//   const q = Math.max(1, parseInt(qty, 10) || 1);
//   const cart = getCart();
//   const found = cart.find(i => i.id === item.id);
//   if (found) {
//     if (options.replace) {
//       found.qty = q;
//     } else {
//       found.qty = (found.qty || 1) + q;
//     }
//   } else {
//     cart.push(Object.assign({}, item, { qty: q }));
//   }
//   saveCart(cart);
//   if (options.openPopup) {
//     openCartPopup();
//   }
// }

// function removeFromCart(id) {
//   let cart = getCart();
//   cart = cart.filter(i => i.id !== id);
//   saveCart(cart);
// }

// function clearCart() {
//   localStorage.removeItem(CART_KEY);
//   renderCart();
// }

// function renderCart() {
//   const container = document.getElementById('cart-items');
//   const totalEl = document.getElementById('cart-total');
//   if (!container) return;
//   container.innerHTML = '<p class="cart-empty">Cart is disabled. Use Buy Now.</p>';
//   if (totalEl) totalEl.innerText = '';
// }

// function changeQty(id, delta) {
//   const cart = getCart();
//   const item = cart.find(i => i.id === id);
//   if (!item) return;
//   const next = Math.max(1, (item.qty || 1) + delta);
//   item.qty = next;
//   saveCart(cart);
// }

// function setQty(id, qty) {
//   const cart = getCart();
//   const item = cart.find(i => i.id === id);
//   if (!item) return;
//   const q = Math.max(1, parseInt(qty, 10) || 1);
//   item.qty = q;
//   saveCart(cart);
// }

// function openBuyModal() {
//   const modal = document.getElementById('buy-modal');
//   if (!modal) return;
//   renderOrderSummary();
//   modal.classList.remove('u-hidden');
// }

// function closeBuyModal() {
//   const modal = document.getElementById('buy-modal');
//   if (!modal) return;
//   modal.classList.add('u-hidden');
// }

// function buildOrderMessage(formData) {
//   // Use current selection since cart is removed
//   const sel = window.currentSelection;
//   let lines = [];
//   lines.push('New Order');
//   lines.push('----------------');
//   if (sel && sel.product) {
//     const qty = Math.max(1, parseInt(sel.qty, 10) || 1);
//     const unit = parseFloat(sel.product.price) || 0;
//     const total = qty * unit;
//     lines.push('Items:');
//     lines.push(`${sel.product.title} x${qty} — ${fmtPrice(total)}`);
//     lines.push(`Total: ${fmtPrice(total)}`);
//   } else if (window.currentProduct) {
//     lines.push(`Item: ${window.currentProduct.title} — ${fmtPrice(window.currentProduct.price)}`);
//   }
//   lines.push('');
//   lines.push('Customer Details:');
//   lines.push(`Name: ${formData.name}`);
//   lines.push(`Mobile: ${formData.mobile}`);
//   lines.push(`Email: ${formData.email}`);
//   lines.push(`Address: ${formData.address}`);
//   if (formData.additional) {
//     lines.push('Additional info:');
//     lines.push(formData.additional);
//   }
//   lines.push('');
//   lines.push('Please confirm and respond.');
//   return lines.join('\n');
// }

// function renderOrderSummary() {
//   const wrap = document.getElementById('order-summary');
//   if (!wrap) return;
//   const itemsEl = wrap.querySelector('.order-summary__items');
//   const totalEl = wrap.querySelector('.order-summary__total');
//   const sel = window.currentSelection;
//   if (!sel || !sel.product) {
//     itemsEl.textContent = 'No items yet.';
//     totalEl.textContent = '';
//     return;
//   }
//   const qty = Math.max(1, parseInt(sel.qty, 10) || 1);
//   const unit = parseFloat(sel.product.price) || 0;
//   const sub = qty * unit;
//   const html = `<ul class="order-list"><li class="order-item"><span>${sel.product.title} × ${qty}</span><span>${fmtPrice(sub)}</span></li></ul>`;
//   itemsEl.innerHTML = html;
//   totalEl.textContent = 'Total: ' + fmtPrice(sub);
// }

// function initCartUI() {
//   // cart clear
//   const clearBtn = document.getElementById('cart-clear');
//   if (clearBtn) clearBtn.addEventListener('click', clearCart);

//   // sidebar buy opens modal
//   const sidebarBuy = document.getElementById('cart-buy');
//   if (sidebarBuy) sidebarBuy.addEventListener('click', openBuyModal);

//   // modal cancel
//   const buyCancel = document.getElementById('buy-cancel');
//   if (buyCancel) buyCancel.addEventListener('click', closeBuyModal);
//   const buyClose = document.getElementById('buy-close');
//   if (buyClose) buyClose.addEventListener('click', closeBuyModal);

//   // handle form submission
//   const buyForm = document.getElementById('buy-form');
//   if (buyForm) {
//     buyForm.addEventListener('submit', function (e) {
//       e.preventDefault();
//       const fd = new FormData(buyForm);
//       const data = {
//         name: (fd.get('name') || '').trim(),
//         mobile: (fd.get('mobile') || '').trim(),
//         email: (fd.get('email') || '').trim(),
//         address: (fd.get('address') || '').trim(),
//         additional: (fd.get('additional') || '').trim()
//       };
//       // clear previous errors
//       const err = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg || ''; };
//       err('err-name'); err('err-mobile'); err('err-email'); err('err-address');
//       // basic validation with inline errors
//       let valid = true;
//       if (!data.name) { err('err-name', 'Please enter your name'); valid = false; }
//       // very permissive Indian mobile format example: 10 digits
//       if (!/^\d{10}$/.test(data.mobile)) { err('err-mobile', 'Enter a valid 10-digit mobile number'); valid = false; }
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { err('err-email', 'Enter a valid email'); valid = false; }
//       if (!data.address || data.address.length < 8) { err('err-address', 'Please enter full address'); valid = false; }
//       if (!valid) return;

//       // save profile locally
//       try { localStorage.setItem('lounge_profile', JSON.stringify({ name: data.name, mobile: data.mobile, email: data.email, address: data.address })); } catch (e) {}

//       const submitBtn = document.getElementById('buy-confirm');
//       const prevText = submitBtn ? submitBtn.textContent : '';
//       if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Opening WhatsApp…'; }

//       const message = buildOrderMessage(data);
//       const phone = '9359031364';
//       const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
//       // open WhatsApp in new tab/window
//       window.open(url, '_blank');
//       if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = prevText; }
//       // clear the form fields after successful submit
//       try {
//         // reset form fields
//         buyForm.reset();
//         // clear inline error messages
//         err('err-name'); err('err-mobile'); err('err-email'); err('err-address');
//         // clear current selection so modal shows no items next time until user chooses
//         window.currentSelection = null;
//       } catch (e) {}
//       closeBuyModal();
//     });
//   }

//   renderCart();
// }

// /* ------------------ Cart Popup Controls ------------------ */

// function openCartPopup() {
//   const popup = document.getElementById('cart-popup');
//   if (!popup) return;
//   popup.classList.remove('u-hidden');
//   popup.setAttribute('aria-hidden', 'false');
//   // move panel into view
//   const panel = popup.querySelector('.cart-popup__panel');
//   if (panel) panel.classList.add('is-open');
//   // focus the close button for accessibility
//   const closeBtn = document.getElementById('cart-close');
//   if (closeBtn) closeBtn.focus();
// }

// function closeCartPopup() {
//   const popup = document.getElementById('cart-popup');
//   if (!popup) return;
//   const panel = popup.querySelector('.cart-popup__panel');
//   if (panel) panel.classList.remove('is-open');
//   popup.classList.add('u-hidden');
//   popup.setAttribute('aria-hidden', 'true');
// }

// // wire cart close/backdrop after DOM ready
// document.addEventListener('DOMContentLoaded', function () {
//   const closeBtn = document.getElementById('cart-close');
//   if (closeBtn) closeBtn.addEventListener('click', closeCartPopup);
//   const backdrop = document.getElementById('cart-backdrop');
//   if (backdrop) backdrop.addEventListener('click', closeCartPopup);
//   renderCart();
//   renderOrderSummary();
// });

// // Improve modal focus behavior
// function openBuyModal() {
//   const modal = document.getElementById('buy-modal');
//   if (!modal) return;
//   renderOrderSummary();
//   modal.classList.remove('u-hidden');
//   modal.setAttribute('aria-hidden', 'false');
//   document.body.classList.add('no-scroll');
//   // focus first input
//   const first = modal.querySelector('input, textarea, button');
//   if (first) first.focus();
//   // preload saved profile if any
//   try {
//     const prof = JSON.parse(localStorage.getItem('lounge_profile') || 'null');
//     if (prof) {
//       const name = document.getElementById('cust-name'); if (name && !name.value) name.value = prof.name || '';
//       const mob = document.getElementById('cust-mobile'); if (mob && !mob.value) mob.value = prof.mobile || '';
//       const em = document.getElementById('cust-email'); if (em && !em.value) em.value = prof.email || '';
//       const addr = document.getElementById('cust-address'); if (addr && !addr.value) addr.value = prof.address || '';
//     }
//   } catch (e) {}
// }

// function closeBuyModal() {
//   const modal = document.getElementById('buy-modal');
//   if (!modal) return;
//   modal.classList.add('u-hidden');
//   modal.setAttribute('aria-hidden', 'true');
//   document.body.classList.remove('no-scroll');
//   // clear and reset the buy form when modal closes
//   try {
//     const buyForm = document.getElementById('buy-form');
//     if (buyForm) {
//       buyForm.reset();
//       const clearErr = id => { const el = document.getElementById(id); if (el) el.textContent = ''; };
//       clearErr('err-name'); clearErr('err-mobile'); clearErr('err-email'); clearErr('err-address');
//     }
//     // clear currentSelection so order summary shows empty next time
//     window.currentSelection = null;
//   } catch (e) {}
// }

// // keep a reference to current product for buy message fallback
// window.currentProduct = null;

// // ensure initCartUI runs after DOM ready
// document.addEventListener('DOMContentLoaded', function () {
//   initCartUI();
//   // esc to close modal
//   document.addEventListener('keydown', function (e) {
//     if (e.key === 'Escape') closeBuyModal();
//   });
//   // click outside content to close
//   const modal = document.getElementById('buy-modal');
//   if (modal) {
//     modal.addEventListener('click', function (e) {
//       if (e.target === modal) closeBuyModal();
//     });
//   }
// });











function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function fmtPrice(p) {
  return `₹${parseFloat(p).toFixed(2)}`;
}

async function loadProducts() {
  const res = await fetch('products.json');
  if (!res.ok) throw new Error('Failed to load products.json');
  return res.json();
}

async function render() {
  const idRaw = getQueryParam('id') || '';
  const id = (() => {
    try { return decodeURIComponent(idRaw).trim(); } catch (e) { return idRaw.trim(); }
  })();
  const root = document.getElementById('product-root');
  if (!id) {
    root.innerHTML = '<p>No product specified.</p>';
    return;
  }

  try {
    const products = await loadProducts();
    // helper to create a slug from title (fallback matching)
    const slug = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let product = products.find(p => p.id === id || p.id === idRaw);
    if (!product) {
      // try matching by slugified title
      product = products.find(p => slug(p.title) === slug(id) || slug(p.title) === id);
    }
    if (!product) {
      // as a last resort try matching where id is a numeric index
      const maybeIndex = parseInt(id, 10);
      if (!isNaN(maybeIndex) && maybeIndex >= 0 && maybeIndex < products.length) {
        product = products[maybeIndex];
      }
    }
    if (!product) console.warn('Product not found for id:', id, 'raw:', idRaw, 'products:', products.map(p=>p.id));
    if (!product) {
      root.innerHTML = '<p>Product not found.</p>';
      return;
    }

    document.title = product.title + ' — Threaded Charm';

    root.innerHTML = `
      <div class="product-hero">
        <div class="product-hero__img">
          <img src="${encodeURI(product.image || '')}" alt="${product.title}">
        </div>
        <div class="product-hero__details">
          <h1>${product.title}</h1>
          <div class="product-price">${fmtPrice(product.price)}</div>
          <div id="product-subtotal" class="product-subtotal" aria-live="polite" aria-atomic="true">Subtotal: ${fmtPrice(product.price)}</div>
          <p>${product.description}</p>
          <p><strong>Category:</strong> ${product.category}</p>
        </div>
      </div>
    `;

    // expose current product for modal/cart fallback
    window.currentProduct = product;

    // Add action buttons
    const details = root.querySelector('.product-hero__details');
    const actions = document.createElement('div');
    actions.style.marginTop = '1rem';
    actions.innerHTML = `
      <div class="qty-control" aria-label="Quantity" role="group" aria-labelledby="qty-label">
        <span id="qty-label" class="u-screen-reader-text">Quantity</span>
        <button type="button" id="qty-decr" class="qty-btn" aria-label="Decrease quantity">−</button>
        <input id="qty-input" type="number" min="1" value="1" inputmode="numeric" class="qty-input" aria-label="Quantity value" />
        <button type="button" id="qty-incr" class="qty-btn" aria-label="Increase quantity">＋</button>
      </div>
      <div class="action-row">
        <button id="buy-now" class="btn btn--primary">Buy Now</button>
      </div>
    `;
    details.appendChild(actions);

    // Wire up cart and buy interactions
    const qtyInput = document.getElementById('qty-input');
    const decr = document.getElementById('qty-decr');
    const incr = document.getElementById('qty-incr');
    function getQty() { const v = parseInt(qtyInput.value, 10); return isNaN(v) || v < 1 ? 1 : v; }
    function updateSubtotal() {
      const subEl = document.getElementById('product-subtotal');
      if (subEl) {
        const q = getQty();
        const unit = parseFloat(product.price) || 0;
        subEl.textContent = 'Subtotal: ' + fmtPrice(q * unit);
      }
    }
    decr.addEventListener('click', () => { qtyInput.value = Math.max(1, getQty() - 1); updateSubtotal(); });
    incr.addEventListener('click', () => { qtyInput.value = getQty() + 1; updateSubtotal(); });
    qtyInput.addEventListener('input', updateSubtotal);
    updateSubtotal();
    document.getElementById('buy-now').addEventListener('click', function () {
      window.currentSelection = { product, qty: getQty() };
      openBuyModal();
    });

    // no cart to render; buy flow only

  } catch (err) {
    root.innerHTML = '<p>Error loading product.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', render);

/* ------------------ Cart & Buy Modal Logic ------------------ */

const CART_KEY = 'lounge_cart';

function getCart() {
  // cart removed; always return empty
  return [];
}

function saveCart(cart) {
  // no-op since cart is disabled
}

function addToCart(item, qty = 1, opts = {}) {
  const options = Object.assign({ openPopup: true, replace: false }, opts);
  const q = Math.max(1, parseInt(qty, 10) || 1);
  const cart = getCart();
  const found = cart.find(i => i.id === item.id);
  if (found) {
    if (options.replace) {
      found.qty = q;
    } else {
      found.qty = (found.qty || 1) + q;
    }
  } else {
    cart.push(Object.assign({}, item, { qty: q }));
  }
  saveCart(cart);
  if (options.openPopup) {
    openCartPopup();
  }
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!container) return;
  container.innerHTML = '<p class="cart-empty">Cart is disabled. Use Buy Now.</p>';
  if (totalEl) totalEl.innerText = '';
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const next = Math.max(1, (item.qty || 1) + delta);
  item.qty = next;
  saveCart(cart);
}

function setQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const q = Math.max(1, parseInt(qty, 10) || 1);
  item.qty = q;
  saveCart(cart);
}

function openBuyModal() {
  const modal = document.getElementById('buy-modal');
  if (!modal) return;
  
  // Always reset form to empty state
  const buyForm = document.getElementById('buy-form');
  if (buyForm) {
    buyForm.reset();
    // Clear any error messages
    const clearErr = id => { const el = document.getElementById(id); if (el) el.textContent = ''; };
    clearErr('err-name'); clearErr('err-mobile'); clearErr('err-email'); clearErr('err-address');
  }
  
  renderOrderSummary();
  modal.classList.remove('u-hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  
  // Focus first input
  const first = modal.querySelector('input, textarea, button');
  if (first) first.focus();
}

function closeBuyModal() {
  const modal = document.getElementById('buy-modal');
  if (!modal) return;
  modal.classList.add('u-hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  
  // Reset form and clear all data when modal closes
  try {
    const buyForm = document.getElementById('buy-form');
    if (buyForm) {
      buyForm.reset();
      const clearErr = id => { const el = document.getElementById(id); if (el) el.textContent = ''; };
      clearErr('err-name'); clearErr('err-mobile'); clearErr('err-email'); clearErr('err-address');
    }
    window.currentSelection = null;
  } catch (e) {}
}

function buildOrderMessage(formData) {
  // Use current selection since cart is removed
  const sel = window.currentSelection;
  let lines = [];
  lines.push('New Order');
  lines.push('----------------');
  if (sel && sel.product) {
    const qty = Math.max(1, parseInt(sel.qty, 10) || 1);
    const unit = parseFloat(sel.product.price) || 0;
    const total = qty * unit;
    lines.push('Items:');
    lines.push(`${sel.product.title} x${qty} — ${fmtPrice(total)}`);
    lines.push(`Total: ${fmtPrice(total)}`);
  } else if (window.currentProduct) {
    lines.push(`Item: ${window.currentProduct.title} — ${fmtPrice(window.currentProduct.price)}`);
  }
  lines.push('');
  lines.push('Customer Details:');
  lines.push(`Name: ${formData.name}`);
  lines.push(`Mobile: ${formData.mobile}`);
  lines.push(`Email: ${formData.email}`);
  lines.push(`Address: ${formData.address}`);
  if (formData.additional) {
    lines.push('Additional info:');
    lines.push(formData.additional);
  }
  lines.push('');
  lines.push('Please confirm and respond.');
  return lines.join('\n');
}

function renderOrderSummary() {
  const wrap = document.getElementById('order-summary');
  if (!wrap) return;
  const itemsEl = wrap.querySelector('.order-summary__items');
  const totalEl = wrap.querySelector('.order-summary__total');
  const sel = window.currentSelection;
  if (!sel || !sel.product) {
    itemsEl.textContent = 'No items yet.';
    totalEl.textContent = '';
    return;
  }
  const qty = Math.max(1, parseInt(sel.qty, 10) || 1);
  const unit = parseFloat(sel.product.price) || 0;
  const sub = qty * unit;
  const html = `<ul class="order-list"><li class="order-item"><span>${sel.product.title} × ${qty}</span><span>${fmtPrice(sub)}</span></li></ul>`;
  itemsEl.innerHTML = html;
  totalEl.textContent = 'Total: ' + fmtPrice(sub);
}

function initCartUI() {
  // cart clear
  const clearBtn = document.getElementById('cart-clear');
  if (clearBtn) clearBtn.addEventListener('click', clearCart);

  // sidebar buy opens modal
  const sidebarBuy = document.getElementById('cart-buy');
  if (sidebarBuy) sidebarBuy.addEventListener('click', openBuyModal);

  // modal cancel
  const buyCancel = document.getElementById('buy-cancel');
  if (buyCancel) buyCancel.addEventListener('click', closeBuyModal);
  const buyClose = document.getElementById('buy-close');
  if (buyClose) buyClose.addEventListener('click', closeBuyModal);

  // handle form submission
  const buyForm = document.getElementById('buy-form');
  if (buyForm) {
    buyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(buyForm);
      const data = {
        name: (fd.get('name') || '').trim(),
        mobile: (fd.get('mobile') || '').trim(),
        email: (fd.get('email') || '').trim(),
        address: (fd.get('address') || '').trim(),
        additional: (fd.get('additional') || '').trim()
      };
      // clear previous errors
      const err = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg || ''; };
      err('err-name'); err('err-mobile'); err('err-email'); err('err-address');
      // basic validation with inline errors
      let valid = true;
      if (!data.name) { err('err-name', 'Please enter your name'); valid = false; }
      // very permissive Indian mobile format example: 10 digits
      if (!/^\d{10}$/.test(data.mobile)) { err('err-mobile', 'Enter a valid 10-digit mobile number'); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { err('err-email', 'Enter a valid email'); valid = false; }
      if (!data.address || data.address.length < 8) { err('err-address', 'Please enter full address'); valid = false; }
      if (!valid) return;

      const submitBtn = document.getElementById('buy-confirm');
      const prevText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Opening WhatsApp…'; }

      const message = buildOrderMessage(data);
      const phone = '9359031364';
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      // open WhatsApp in new tab/window
      window.open(url, '_blank');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = prevText; }
      // clear the form fields after successful submit
      try {
        // reset form fields
        buyForm.reset();
        // clear inline error messages
        err('err-name'); err('err-mobile'); err('err-email'); err('err-address');
        // clear current selection so modal shows no items next time until user chooses
        window.currentSelection = null;
      } catch (e) {}
      closeBuyModal();
    });
  }

  renderCart();
}

/* ------------------ Cart Popup Controls ------------------ */

function openCartPopup() {
  const popup = document.getElementById('cart-popup');
  if (!popup) return;
  popup.classList.remove('u-hidden');
  popup.setAttribute('aria-hidden', 'false');
  // move panel into view
  const panel = popup.querySelector('.cart-popup__panel');
  if (panel) panel.classList.add('is-open');
  // focus the close button for accessibility
  const closeBtn = document.getElementById('cart-close');
  if (closeBtn) closeBtn.focus();
}

function closeCartPopup() {
  const popup = document.getElementById('cart-popup');
  if (!popup) return;
  const panel = popup.querySelector('.cart-popup__panel');
  if (panel) panel.classList.remove('is-open');
  popup.classList.add('u-hidden');
  popup.setAttribute('aria-hidden', 'true');
}

// wire cart close/backdrop after DOM ready
document.addEventListener('DOMContentLoaded', function () {
  const closeBtn = document.getElementById('cart-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCartPopup);
  const backdrop = document.getElementById('cart-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeCartPopup);
  renderCart();
  renderOrderSummary();
});

// keep a reference to current product for buy message fallback
window.currentProduct = null;

// ensure initCartUI runs after DOM ready
document.addEventListener('DOMContentLoaded', function () {
  initCartUI();
  // esc to close modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBuyModal();
  });
  // click outside content to close
  const modal = document.getElementById('buy-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeBuyModal();
    });
  }
});