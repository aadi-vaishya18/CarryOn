/* CarryOn storefront (no frameworks, just HTML/CSS/JS) */

const FREE_SHIPPING_THRESHOLD = 4999;
const SHIPPING_FEE = 99;

const PRODUCTS = [
    {
        id: "urban-explorer",
        name: "Urban Explorer Backpack",
        price: 6999,
        rating: 4.6,
        category: "work",
        badge: "Bestseller",
        img: "bag1.jpg",
        gallery: ["bag1.jpg", "placeholder1.webp", "placeholder2.png", "placeholder3.png"],
        desc: "A clean, compact backpack with laptop sleeve and quick-access pockets. Ideal for commute + travel.",
    },
    {
        id: "weekend-duffel",
        name: "Weekend Duffel",
        price: 5499,
        rating: 4.4,
        category: "travel",
        badge: "New",
        img: "bag5.png",
        gallery: ["bag5.png", "placeholder1.webp", "placeholder2.png", "placeholder3.png"],
        desc: "Lightweight duffel with reinforced handles, roomy main compartment, and durable zipper pulls.",
    },
    {
        id: "classic-tote",
        name: "Classic Carry Tote",
        price: 3999,
        rating: 4.2,
        category: "work",
        badge: "Editor’s pick",
        img: "bag7.png",
        gallery: ["bag7.png", "placeholder2.png", "placeholder1.webp", "placeholder3.png"],
        desc: "A minimalist tote with a structured feel—perfect for office days, books, and a 13–14” laptop.",
    },
    {
        id: "compact-sling",
        name: "Trail Sling Bag",
        price: 1999,
        rating: 4.3,
        category: "outdoor",
        badge: "Lightweight",
        img: "bag9.png",
        gallery: ["bag9.png","placeholder1.webp", "placeholder2.png", "placeholder3.png"],
        desc: "Hands-free sling with an adjustable strap and hidden pocket. Great for day trips and city walks.",
    },
    {
        id: "daily-messenger",
        name: "Midnight Messenger",
        price: 4799,
        rating: 4.5,
        category: "work",
        badge: "Top rated",
        img: "bag10.png",
        gallery: ["bag10.png", "placeholder1.webp", "placeholder3.png", "placeholder2.png"],
        desc: "A sleek messenger bag with magnetic flap, padded laptop area, and cable-friendly organization.",
    },
    {
        id: "carryall-02",
        name: "City Carryall",
        price: 4999,
        rating: 4.1,
        category: "travel",
        badge: "Value",
        img: "bag2.png",
        gallery: ["bag2.png", "placeholder2.png", "placeholder1.webp", "placeholder3.png"],
        desc: "A practical carryall with plenty of space and an easy-clean interior—made for weekends away.",
    },
    {
        id: "mini-pack",
        name: "Minimal Daypack",
        price: 2999,
        rating: 4.0,
        category: "outdoor",
        badge: "Compact",
        img: "bag3.png",
        gallery: ["bag3.png", "placeholder3.png", "placeholder2.png", "placeholder1.webp"],
        desc: "A small daypack that still fits essentials. Breathable straps, water-bottle slot, and quick pocket.",
    },
    {
        id: "on-the-go",
        name: "On-the-Go Crossbody",
        price: 2499,
        rating: 4.2,
        category: "outdoor",
        badge: "Everyday",
        img: "bag4.png",
        gallery: ["bag4.png", "placeholder1.webp", "placeholder2.png", "placeholder3.png"],
        desc: "Simple crossbody with secure zip and smooth strap—easy to pair with any outfit.",
    },
    {
        id: "roller-suitcase",
        name: "City Roller Suitcase",
        price: 9999,
        rating: 4.4,
        category: "travel",
        badge: "Travel",
        img: "bag8.png",
        gallery: ["bag8.png", "placeholder2.png", "placeholder1.webp", "placeholder3.png"],
        desc: "Hard-shell roller with smooth wheels, telescopic handle, and a well-organized interior.",
    },
    {
        id: "red-backpack",
        name: "Everywhere Backpack",
        price: 6499,
        rating: 4.3,
        category: "travel",
        badge: "New",
        img: "bag6.png",
        gallery: ["bag6.png", "placeholder1.webp", "placeholder2.png", "placeholder3.png"],
        desc: "Comfort-first backpack with roomy storage and padded back panel—built for long days and flights.",
    },
];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
    activeCategory: "all",
    query: "",
    wishlist: new Set(JSON.parse(localStorage.getItem("carryon_wishlist") || "[]")),
    cart: [],
    modalProductId: null,
};

const INR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function money(n) {
    return INR.format(Math.round(Number(n) || 0));
}

function stars(rating) {
    const full = Math.floor(rating);
    let out = "";

    for (let i = 0; i < 5; i++) {
        out += i < full ? "★" : "☆";
    }

    return out;
}

function persistWishlist() {
    localStorage.setItem("carryon_wishlist", JSON.stringify(Array.from(state.wishlist)));
}

function loadCart() {
    try {
        const raw = localStorage.getItem("carryon_cart");
        if (raw) {
            const cart = JSON.parse(raw);
            if (Array.isArray(cart)) return cart;
        }
    } catch {
        // ignore and fall back
    }

    // Migration from older cartCount-only version
    const oldCount = Number(localStorage.getItem("carryon_cartCount") || 0);
    if (oldCount > 0) {
        localStorage.removeItem("carryon_cartCount");
        return [{ id: "urban-explorer", qty: oldCount }];
    }

    return [];
}

function saveCart(cart) {
    localStorage.setItem("carryon_cart", JSON.stringify(cart));
}

function cartItemCount(cart = state.cart) {
    return cart.reduce((sum, it) => sum + Number(it.qty || 0), 0);
}

function cartSubtotal(cart = state.cart) {
    return cart.reduce((sum, it) => {
        const p = PRODUCTS.find((x) => x.id === it.id);
        if (!p) return sum;
        return sum + p.price * Number(it.qty || 0);
    }, 0);
}

function showToast(message) {
    const container = $("#toastContainer");
    if (!container) return;

    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    container.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 250);
    }, 2200);
}

function updateBadges() {
    const cartBadge = $("#cartCount");
    if (cartBadge) cartBadge.textContent = String(cartItemCount());

    const wishBadge = $("#wishlistCount");
    if (wishBadge) wishBadge.textContent = String(state.wishlist.size);
}

function getInitialTheme() {
    const saved = localStorage.getItem("carryon_theme");
    if (saved === "light" || saved === "dark") return saved;

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
}

function setTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    localStorage.setItem("carryon_theme", t);
    syncThemeUI();
}

function toggleTheme() {
    const current = document.documentElement.dataset.theme || "dark";
    setTheme(current === "dark" ? "light" : "dark");
}

function syncThemeUI() {
    const icon = $("#themeIcon");
    if (!icon) return;

    const current = document.documentElement.dataset.theme || "dark";
    // show the "next" theme icon
    icon.src = current === "dark" ? "assets/sun.png" : "assets/moon.png";
}

function setCart(cart) {
    state.cart = cart;
    saveCart(cart);
    updateBadges();
    renderCartDrawer();
    renderCartPage();
}

function addToCart(productId, qty = 1) {
    const next = [...state.cart];
    const idx = next.findIndex((x) => x.id === productId);
    const addQty = Math.max(1, Number(qty || 1));

    if (idx === -1) next.push({ id: productId, qty: addQty });
    else next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + addQty };

    setCart(next);
}

function setQty(productId, qty) {
    const nextQty = Math.max(1, Number(qty || 1));
    const next = state.cart.map((it) => (it.id === productId ? { ...it, qty: nextQty } : it));
    setCart(next);
}

function removeFromCart(productId) {
    setCart(state.cart.filter((it) => it.id !== productId));
}

function clearCart() {
    setCart([]);
}

function toggleWishlist(productId) {
    if (state.wishlist.has(productId)) {
        state.wishlist.delete(productId);
        showToast("Removed from wishlist");
    } else {
        state.wishlist.add(productId);
        showToast("Saved to wishlist");
    }

    persistWishlist();
    updateBadges();
    renderWishlistDrawer();
    renderProducts();
}

function goToProduct(productId) {
    window.location.href = `product.html?id=${encodeURIComponent(productId)}`;
}

function filteredProducts() {
    const q = state.query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
        const matchCategory = state.activeCategory === "all" || p.category === state.activeCategory;
        const matchQuery = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
        return matchCategory && matchQuery;
    });
}

function renderProductCards(container, items) {
    if (!container) return;
    container.innerHTML = "";

    for (const p of items) {
        const card = document.createElement("article");
        card.className = "shopping-card";
        card.dataset.id = p.id;

        const wishActive = state.wishlist.has(p.id);

        card.innerHTML = `
            <button class="wishlist-square ${wishActive ? "active" : ""}" type="button" aria-label="Toggle wishlist">
                <img src="assets/heart.png" alt="" />
            </button>
            <div class="product-badge">${p.badge}</div>
            <img src="assets/${p.img}" alt="${p.name}" class="product-img" loading="lazy" />
            <h4 class="product-name">${p.name}</h4>
            <p class="price">${money(p.price)}</p>
            <p class="rating" aria-label="Rating ${p.rating} out of 5">${stars(p.rating)} <span class="rating-num">${p.rating.toFixed(1)}</span></p>
            <div class="shopping-buttons">
                <button class="btn add-to-cart" type="button">Add to cart</button>
                <button class="btn ghost quick-view" type="button">Quick view</button>
            </div>
        `;

        // Card click -> product page
        card.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            goToProduct(p.id);
        });

        // Wishlist
        card.querySelector(".wishlist-square").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleWishlist(p.id);
        });

        // Add to cart
        card.querySelector(".add-to-cart").addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(p.id, 1);
            showToast("Added to cart");
            openCartDrawer();
        });

        // Quick view
        card.querySelector(".quick-view").addEventListener("click", (e) => {
            e.stopPropagation();
            openModal(p.id);
        });

        container.appendChild(card);
    }
}

function renderProducts() {
    const grid = $("#productGrid");
    const meta = $("#resultsMeta");
    if (!grid) return;

    const items = filteredProducts();

    if (meta) {
        const categoryLabel = state.activeCategory === "all" ? "All" : state.activeCategory;
        meta.textContent = `${items.length} item(s) • ${categoryLabel}`;
    }

    renderProductCards(grid, items);
}

function openModal(productId) {
    const modal = $("#productModal");
    if (!modal) {
        // If the page doesn't have a modal, just go to product page
        goToProduct(productId);
        return;
    }

    const img = $("#modalImage");
    const title = $("#modalTitle");
    const price = $("#modalPrice");
    const rating = $("#modalRating");
    const desc = $("#modalDesc");
    const qty = $("#modalQty");

    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return;

    state.modalProductId = p.id;

    if (img) img.src = `assets/${p.img}`;
    if (title) title.textContent = p.name;
    if (price) price.textContent = money(p.price);
    if (rating) rating.textContent = `${stars(p.rating)}  ${p.rating.toFixed(1)}`;
    if (desc) desc.textContent = p.desc;
    if (qty) qty.value = "1";

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    const closeBtn = $("#modalCloseBtn");
    if (closeBtn) closeBtn.focus();
}

function closeModal() {
    const modal = $("#productModal");
    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    state.modalProductId = null;
}

function setCategory(category) {
    state.activeCategory = category;

    $$(".nav-link").forEach((a) => a.classList.toggle("active", a.dataset.category === category));
    $$(".chip").forEach((b) => b.classList.toggle("active", b.dataset.category === category));

    renderProducts();
}

function openDrawer() {
    const drawer = $("#drawer");
    const backdrop = $("#drawerBackdrop");
    if (!drawer || !backdrop) return;

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("show"));
}

function closeDrawer() {
    const drawer = $("#drawer");
    const backdrop = $("#drawerBackdrop");
    if (!drawer || !backdrop) return;

    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
    setTimeout(() => (backdrop.hidden = true), 160);
}

function openCartDrawer() {
    const drawer = $("#cartDrawer");
    const backdrop = $("#cartBackdrop");

    // If drawer isn't present (should be on all pages), fall back to cart page
    if (!drawer || !backdrop) {
        window.location.href = "cart.html";
        return;
    }

    renderCartDrawer();

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("show"));
}

function closeCartDrawer() {
    const drawer = $("#cartDrawer");
    const backdrop = $("#cartBackdrop");
    if (!drawer || !backdrop) return;

    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
    setTimeout(() => (backdrop.hidden = true), 160);
}

function openWishlistDrawer() {
    const drawer = $("#wishlistDrawer");
    const backdrop = $("#wishlistBackdrop");

    if (!drawer || !backdrop) {
        showToast("Wishlist is not available on this page");
        return;
    }

    renderWishlistDrawer();

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("show"));
}

function closeWishlistDrawer() {
    const drawer = $("#wishlistDrawer");
    const backdrop = $("#wishlistBackdrop");
    if (!drawer || !backdrop) return;

    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
    setTimeout(() => (backdrop.hidden = true), 160);
}

function renderWishlistDrawer() {
    const itemsEl = $("#wishlistDrawerItems");
    const meta = $("#wishlistDrawerMeta");

    if (!itemsEl || !meta) return;

    const ids = Array.from(state.wishlist);
    meta.textContent = `${ids.length} item(s)`;

    if (ids.length === 0) {
        itemsEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Wishlist is empty</div>
                <div class="muted">Tap the heart on a product to save it.</div>
                <a class="btn buy-now" href="index.html">Browse bags</a>
            </div>
        `;
        return;
    }

    itemsEl.innerHTML = "";

    for (const id of ids) {
        const p = PRODUCTS.find((x) => x.id === id);
        if (!p) continue;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = p.id;

        row.innerHTML = `
            <img class="cart-thumb" src="assets/${p.img}" alt="${p.name}" />
            <div class="cart-info">
                <a class="cart-name" href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
                <div class="muted">${money(p.price)}</div>
                <div class="shopping-buttons">
                    <button class="btn add-to-cart" type="button">Add to cart</button>
                    <button class="btn ghost remove-wish" type="button">Remove</button>
                </div>
            </div>
            <div class="cart-right">
                <div class="cart-line">${p.badge}</div>
            </div>
        `;

        row.querySelector(".add-to-cart").addEventListener("click", () => {
            addToCart(p.id, 1);
            showToast("Added to cart");
            openCartDrawer();
        });

        row.querySelector(".remove-wish").addEventListener("click", () => {
            toggleWishlist(p.id);
        });

        itemsEl.appendChild(row);
    }
}

function renderCartItems(container) {
    if (!container) return;

    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Your cart is empty</div>
                <div class="muted">Add a bag you love — it will show up here.</div>
                <a class="btn buy-now" href="index.html">Shop bags</a>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    for (const it of state.cart) {
        const p = PRODUCTS.find((x) => x.id === it.id);
        if (!p) continue;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = it.id;

        row.innerHTML = `
            <img class="cart-thumb" src="assets/${p.img}" alt="${p.name}" />
            <div class="cart-info">
                <a class="cart-name" href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
                <div class="muted">${money(p.price)} each</div>
                <div class="qty">
                    <button class="qty-btn dec" type="button" aria-label="Decrease quantity">−</button>
                    <input class="qty-input" type="number" min="1" value="${Number(it.qty || 1)}" />
                    <button class="qty-btn inc" type="button" aria-label="Increase quantity">+</button>
                </div>
            </div>
            <div class="cart-right">
                <div class="cart-line">${money(p.price * Number(it.qty || 1))}</div>
                <button class="remove-btn" type="button">Remove</button>
            </div>
        `;

        const input = row.querySelector(".qty-input");
        const dec = row.querySelector(".dec");
        const inc = row.querySelector(".inc");
        const remove = row.querySelector(".remove-btn");

        dec.addEventListener("click", () => {
            const next = Math.max(1, Number(input.value || 1) - 1);
            input.value = String(next);
            setQty(it.id, next);
        });

        inc.addEventListener("click", () => {
            const next = Math.max(1, Number(input.value || 1) + 1);
            input.value = String(next);
            setQty(it.id, next);
        });

        input.addEventListener("change", () => {
            const next = Math.max(1, Number(input.value || 1));
            input.value = String(next);
            setQty(it.id, next);
        });

        remove.addEventListener("click", () => {
            removeFromCart(it.id);
            showToast("Removed from cart");
        });

        container.appendChild(row);
    }
}

function renderCartDrawer() {
    const itemsEl = $("#cartDrawerItems");
    const meta = $("#cartDrawerMeta");
    const subtotalEl = $("#cartDrawerSubtotal");

    if (!itemsEl || !meta || !subtotalEl) return;

    const count = cartItemCount();
    meta.textContent = `${count} item(s)`;
    subtotalEl.textContent = money(cartSubtotal());

    renderCartItems(itemsEl);
}

function renderCartPage() {
    const itemsEl = $("#cartPageItems");
    const meta = $("#cartPageMeta");
    const subtotalEl = $("#cartSubtotal");
    const shippingEl = $("#cartShipping");
    const totalEl = $("#cartTotal");

    if (!itemsEl || !meta || !subtotalEl || !shippingEl || !totalEl) return;

    const count = cartItemCount();
    const subtotal = cartSubtotal();
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    meta.textContent = `${count} item(s)`;
    subtotalEl.textContent = money(subtotal);
    shippingEl.textContent = money(shipping);
    totalEl.textContent = money(total);

    renderCartItems(itemsEl);
}

function renderProductPage() {
    const root = $("#productPage");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const p = PRODUCTS.find((x) => x.id === id);

    const crumb = $("#crumbTitle");
    if (crumb) crumb.textContent = p ? p.name : "Product";

    if (!p) {
        root.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Product not found</div>
                <div class="muted">Go back to the shop and pick a bag.</div>
                <a class="btn buy-now" href="index.html">Back to shop</a>
            </div>
        `;
        return;
    }

    const gallery = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.img, "placeholder1.webp", "placeholder2.png"];

    root.innerHTML = `
        <div class="product-media">
            <img id="productMainImage" src="assets/${gallery[0]}" alt="${p.name}" />
            <div class="gallery-thumbs" id="galleryThumbs" aria-label="Product gallery">
                ${gallery
                    .map(
                        (g, idx) => `
                    <button class="thumb ${idx === 0 ? "active" : ""}" type="button" aria-label="View image ${idx + 1}">
                        <img src="assets/${g}" alt="" />
                    </button>
                `
                    )
                    .join("")}
            </div>
        </div>
        <div class="product-info">
            <div class="product-top">
                <div class="product-badge">${p.badge}</div>
                <h1>${p.name}</h1>
                <div class="product-rating">
                    <span class="rating">${stars(p.rating)}</span>
                    <span class="muted">${p.rating.toFixed(1)} / 5</span>
                </div>
                <div class="product-price">${money(p.price)}</div>
                <p class="muted">${p.desc}</p>
            </div>

            <div class="product-highlights">
                <div class="highlight">Durable build + premium finish</div>
                <div class="highlight">Smart pockets for easy organization</div>
                <div class="highlight">Comfort straps for all-day carry</div>
            </div>

            <div class="qty-row">
                <label for="productQty" class="muted">Qty</label>
                <input id="productQty" type="number" min="1" value="1" />
            </div>

            <div class="product-actions">
                <button class="btn add-to-cart" id="productAddBtn" type="button">Add to cart</button>
                <button class="btn buy-now" id="productBuyBtn" type="button">Buy now</button>
            </div>
        </div>
    `;

    const qty = $("#productQty");
    const addBtn = $("#productAddBtn");
    const buyBtn = $("#productBuyBtn");

    const mainImg = $("#productMainImage");
    const thumbs = $$("#galleryThumbs .thumb");

    thumbs.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            thumbs.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            if (mainImg) mainImg.src = `assets/${gallery[idx]}`;
        });
    });

    addBtn.addEventListener("click", () => {
        const n = Math.max(1, Number(qty.value || 1));
        qty.value = String(n);
        addToCart(p.id, n);
        showToast("Added to cart");
        openCartDrawer();
    });

    buyBtn.addEventListener("click", () => {
        const n = Math.max(1, Number(qty.value || 1));
        qty.value = String(n);
        addToCart(p.id, n);
        window.location.href = "cart.html#checkout";
    });

    const relatedGrid = $("#relatedGrid");
    if (relatedGrid) {
        const sameCategory = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category);
        const others = PRODUCTS.filter((x) => x.id !== p.id && x.category !== p.category);
        const related = [...sameCategory, ...others].slice(0, 6);
        renderProductCards(relatedGrid, related);
    }
}

function makeOrderId() {
    const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
    const tail = String(Date.now()).slice(-4);
    return `CO-${rand}-${tail}`;
}

function renderSuccessPage() {
    const root = $("#successPage");
    if (!root) return;

    let order = null;
    try {
        const raw = localStorage.getItem("carryon_lastOrder");
        if (raw) order = JSON.parse(raw);
    } catch {
        // ignore
    }

    if (!order) {
        root.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">No recent order found</div>
                <div class="muted"></div>
                <a class="btn buy-now" href="index.html">Back to shop</a>
            </div>
        `;
        return;
    }

    const items = Array.isArray(order.items) ? order.items : [];

    root.innerHTML = `
        <div class="success-grid">
            <div>
                <h1>Order placed successfully</h1>
                <p class="muted"></p>

                <div class="success-card">
                    <div class="cart-row"><span class="muted">Order ID</span><strong>${order.id || "—"}</strong></div>
                    <div class="cart-row"><span class="muted">Name</span><strong>${order.fullName || "—"}</strong></div>
                    <div class="cart-row"><span class="muted">Email</span><strong>${order.email || "—"}</strong></div>
                    <div class="cart-row"><span class="muted">Payment</span><strong>${order.payment || "—"}</strong></div>
                </div>

                <div class="success-card" style="margin-top:12px">
                    <div class="empty-title">Items</div>
                    <div class="muted">${items.length ? "" : "(none)"}</div>
                    <div style="margin-top:10px; display:grid; gap:8px;">
                        ${items
                            .map((it) => `<div class="cart-row"><span class="muted">${it.name} × ${it.qty}</span><strong>${money(it.lineTotal)}</strong></div>`)
                            .join("")}
                    </div>
                </div>

                <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:14px;">
                    <a class="btn buy-now" href="index.html">Continue shopping</a>
                    <a class="btn ghost" href="cart.html">View cart</a>
                </div>
            </div>

            <div class="success-card">
                <div class="empty-title">Summary</div>
                <div class="cart-row" style="margin-top:10px"><span class="muted">Subtotal</span><strong>${money(order.subtotal || 0)}</strong></div>
                <div class="cart-row"><span class="muted">Shipping</span><strong>${money(order.shipping || 0)}</strong></div>
                <div class="cart-row total"><span>Total</span><strong>${money(order.total || 0)}</strong></div>
                <img src="assets/placeholder2.png" alt="Placeholder" style="width:100%; height:160px; object-fit:cover; border-radius:14px; border:1px solid var(--border); margin-top:12px;" />
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    // Base init
    state.cart = loadCart();
    updateBadges();

    // Footer year
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    // Search
    const search = $("#search");
    const hasGrid = Boolean($("#productGrid"));

    if (search) {
        // allow index.html?q=... for other pages
        search.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;
            const q = search.value.trim();
            if (!q) return;
            if (!hasGrid) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
        });

        if (hasGrid) {
            search.addEventListener("input", (e) => {
                state.query = e.target.value;
                renderProducts();
            });
        }
    }

    // If we are on index with URL params
    if (hasGrid) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        const cat = params.get("cat") || "";

        if (q) {
            state.query = q;
            if (search) search.value = q;
        }

        if (cat && ["all", "travel", "work", "outdoor"].includes(cat)) {
            state.activeCategory = cat;
        }
    }

    // Category nav (desktop) only intercept on index
    $$(".nav-link").forEach((a) => {
        a.addEventListener("click", (e) => {
            if (!hasGrid) return; // other pages use normal links
            e.preventDefault();
            setCategory(a.dataset.category || "all");
        });
    });

    // Chips (mobile)
    $$(".chip").forEach((b) => {
        b.addEventListener("click", () => setCategory(b.dataset.category || "all"));
    });

    // Drawer (menu)
    const menuBtn = $("#menuBtn");
    const drawerCloseBtn = $("#drawerCloseBtn");
    const drawerBackdrop = $("#drawerBackdrop");

    if (menuBtn) menuBtn.addEventListener("click", openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

    $$(".drawer-link").forEach((a) => {
        a.addEventListener("click", (e) => {
            if (hasGrid && a.dataset.category) {
                e.preventDefault();
                setCategory(a.dataset.category);
            }
            closeDrawer();
        });
    });

    // Cart drawer
    const cartBtn = $("#cartBtn");
    const cartCloseBtn = $("#cartCloseBtn");
    const cartBackdrop = $("#cartBackdrop");

    if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartDrawer);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

    // Wishlist drawer
    const wishlistBtn = $("#wishlistBtn");
    const wishlistCloseBtn = $("#wishlistCloseBtn");
    const wishlistBackdrop = $("#wishlistBackdrop");

    if (wishlistBtn) wishlistBtn.addEventListener("click", openWishlistDrawer);
    if (wishlistCloseBtn) wishlistCloseBtn.addEventListener("click", closeWishlistDrawer);
    if (wishlistBackdrop) wishlistBackdrop.addEventListener("click", closeWishlistDrawer);

    // Theme toggle
    const themeBtn = $("#themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // Modal close + backdrop (only on index)
    const modal = $("#productModal");
    const modalCloseBtn = $("#modalCloseBtn");
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Modal CTA buttons
    const modalAddToCartBtn = $("#modalAddToCartBtn");
    const modalBuyNowBtn = $("#modalBuyNowBtn");

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener("click", () => {
            const productId = state.modalProductId;
            if (!productId) return;
            const qty = Math.max(1, Number($("#modalQty")?.value || 1));
            addToCart(productId, qty);
            showToast("Added to cart");
            closeModal();
            openCartDrawer();
        });
    }

    if (modalBuyNowBtn) {
        modalBuyNowBtn.addEventListener("click", () => {
            const productId = state.modalProductId;
            if (!productId) return;
            const qty = Math.max(1, Number($("#modalQty")?.value || 1));
            addToCart(productId, qty);
            window.location.href = "cart.html#checkout";
        });
    }

    // Cart page actions
    const clearCartBtn = $("#clearCartBtn");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            clearCart();
            showToast("Cart cleared");
        });
    }

    const checkoutForm = $("#checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (cartItemCount() === 0) {
                showToast("Your cart is empty");
                return;
            }
            const data = new FormData(checkoutForm);
            const fullName = String(data.get("fullName") || "");
            const email = String(data.get("email") || "");
            const payment = String(data.get("payment") || "card").toUpperCase();

            const subtotal = cartSubtotal();
            const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            const total = subtotal + shipping;

            const items = state.cart
                .map((it) => {
                    const p = PRODUCTS.find((x) => x.id === it.id);
                    if (!p) return null;
                    return {
                        id: p.id,
                        name: p.name,
                        qty: Number(it.qty || 0),
                        unitPrice: p.price,
                        lineTotal: p.price * Number(it.qty || 0),
                    };
                })
                .filter(Boolean);

            const order = {
                id: makeOrderId(),
                createdAt: new Date().toISOString(),
                fullName,
                email,
                payment,
                subtotal,
                shipping,
                total,
                items,
            };

            localStorage.setItem("carryon_lastOrder", JSON.stringify(order));

            checkoutForm.reset();
            clearCart();
            window.location.href = `success.html?order=${encodeURIComponent(order.id)}`;
        });
    }

    // Hero CTA only on index
    const shopNowBtn = $("#shopNowBtn");
    if (shopNowBtn) {
        shopNowBtn.addEventListener("click", () => {
            state.query = "";
            if (search) search.value = "";
            setCategory("all");
            window.scrollTo({ top: document.body.scrollHeight / 4, behavior: "smooth" });
        });
    }

    const viewDealsBtn = $("#viewDealsBtn");
    if (viewDealsBtn) viewDealsBtn.addEventListener("click", () => showToast("Deals coming soon"));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
            closeDrawer();
            closeCartDrawer();
            closeWishlistDrawer();
        }
    });

    // Page renders
    // Theme init
    setTheme(getInitialTheme());

    // Page renders
    renderProducts();
    renderCartDrawer();
    renderWishlistDrawer();
    renderCartPage();
    renderProductPage();
    renderSuccessPage();
});
