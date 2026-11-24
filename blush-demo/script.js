const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const products = [
  {
    id: 1,
    name: "Pink Guava Fizz",
    cat: "nonalcoholic",
    type: "FRUITY FIZZ",
    price: 390,
    vol: "330 мл",
    badge: "BESTSELLER",
    rating: "4.9",
    img: "./images/IMG_5171.JPG",
    desc: "розовая гуава, лайм, сочный тропический вкус с цитрусовым финалом",
    ingredients: "вода, сок гуавы, сок лайма, сахар, диоксид углерода"
  },
  {
    id: 2,
    name: "Cherry Crush",
    cat: "nonalcoholic",
    type: "BERRY DRINK",
    price: 350,
    vol: "330 мл",
    badge: "NEW",
    rating: "4.8",
    img: "./images/IMG_5172.JPG",
    desc: "вишнёвая содовая с ярким ягодным характером и лёгкой кислинкой",
    ingredients: "вода, вишнёвый сок, лимонный сок, сахар, диоксид углерода"
  },
  {
    id: 3,
    name: "Peach Please",
    cat: "nonalcoholic",
    type: "FRUIT DRINK",
    price: 420,
    vol: "330 мл",
    badge: "FAN FAVE",
    rating: "5.0",
    img: "./images/IMG_5173.JPG",
    desc: "нежный персик встречается с чайной комбучей, фруктовый вкус и мягкая кислинка",
    ingredients: "чайный настой, культура комбучи, персиковый сок"
  },
  {
    id: 4,
    name: "Rosé Daydream",
    cat: "alcoholic",
    type: "ROSÉ",
    price: 890,
    vol: "750 мл",
    badge: "18+",
    rating: "4.9",
    img: "./images/IMG_5174.JPG",
    desc: "концептуальная позиция крафтового розе с ягодным ароматическим профилем",
    ingredients: "демонстрационное описание, состав требует подтверждения производителя"
  },
  {
    id: 5,
    name: "Berry Blush Spritz",
    cat: "alcoholic",
    type: "SPRITZ",
    price: 760,
    vol: "250 мл",
    badge: "18+",
    rating: "4.7",
    img: "./images/IMG_5175.JPG",
    desc: "ягодный ботанический спритц в праздничном розовом настроении",
    ingredients: "демонстрационное описание, состав требует подтверждения производителя"
  },
  {
    id: 6,
    name: "Vanilla Cloud",
    cat: "nonalcoholic",
    type: "CREAMY DRINK",
    price: 370,
    vol: "330 мл",
    badge: "LIMITED",
    rating: "4.8",
    img: "./images/IMG_5176.JPG",
    desc: "мягкая ванильная газировка с кремовым ароматом и лёгким десертным послевкусием",
    ingredients: "вода, сахар, натуральный ароматизатор ванили, диоксид углерода"
  }
];

const money = (number) =>
  new Intl.NumberFormat("ru-RU").format(number) + " ₽";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

const state = {
  cat: "all",
  query: "",
  sort: "featured",
  showFavorites: false,
  cart: readStorage("blush-cart", []),
  favs: readStorage("blush-favs", [])
};

state.cart = Array.isArray(state.cart)
  ? state.cart.filter((row) => row && products.some((p) => p.id === Number(row.id)))
      .map((row) => ({ id: Number(row.id), qty: Math.max(1, Number(row.qty) || 1) }))
  : [];

state.favs = Array.isArray(state.favs)
  ? state.favs.map(Number).filter((id) => products.some((p) => p.id === id))
  : [];

let toastTimer;

const get = (id) => products.find((product) => product.id === Number(id));

function save() {
  try {
    localStorage.setItem("blush-cart", JSON.stringify(state.cart));
    localStorage.setItem("blush-favs", JSON.stringify(state.favs));
  } catch (error) {
    console.warn("Не удалось сохранить данные в браузере", error);
  }
}

function notify(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function filtered() {
  let list = products.filter((product) => {
    const categoryMatches =
      state.cat === "all" || product.cat === state.cat;

    const text = `${product.name} ${product.type} ${product.desc}`.toLowerCase();
    const queryMatches = text.includes(state.query.toLowerCase());

    const favoriteMatches =
      !state.showFavorites || state.favs.includes(product.id);

    return categoryMatches && queryMatches && favoriteMatches;
  });

  if (state.sort === "asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (state.sort === "desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (state.sort === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

function updateCounts() {
  const cartCount = $("#cart-count");
  const favCount = $("#fav-count");

  if (cartCount) {
    cartCount.textContent = state.cart.reduce((sum, row) => sum + row.qty, 0);
  }

  if (favCount) {
    favCount.textContent = state.favs.length;
  }
}

function render() {
  const container = $("#products");
  if (!container) return;

  const list = filtered();

  container.innerHTML = list.map((product) => `
    <article class="card">
      <div class="visual" data-product="${product.id}" tabindex="0" role="button">
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        <span class="badge">${product.badge}</span>
        <button class="heart ${state.favs.includes(product.id) ? "on" : ""}"
          data-fav="${product.id}" aria-label="Избранное">
          ${state.favs.includes(product.id) ? "♥" : "♡"}
        </button>
        <button class="quick" data-add="${product.id}">
          ${product.cat === "alcoholic" ? "ДЕМО-ПОЗИЦИЯ 18+" : "ДОБАВИТЬ В КОРЗИНУ +"}
        </button>
      </div>
      <div class="info">
        <div>
          <div class="name">${product.name}</div>
          <div class="type">${product.type} · ${product.vol}</div>
          <div class="rating">★ ${product.rating} / 5.0</div>
        </div>
        <div class="price">${money(product.price)}</div>
      </div>
    </article>
  `).join("");

  const total = $("#total");
  const empty = $("#empty");

  if (total) {
    total.textContent = state.showFavorites
      ? `${list.length} FAVORITES`
      : `${String(list.length).padStart(2, "0")} PRODUCTS`;
  }

  if (empty) empty.hidden = list.length > 0;

  updateCounts();
}

function add(id) {
  const product = get(id);
  if (!product) return;

  if (product.cat === "alcoholic") {
    notify("Это демонстрационная позиция 18+ — покупка недоступна.");
    return;
  }

  const row = state.cart.find((item) => item.id === product.id);

  if (row) {
    row.qty += 1;
  } else {
    state.cart.push({ id: product.id, qty: 1 });
  }

  save();
  renderCart();
  updateCounts();
  notify(`${product.name} добавлен в корзину`);
}

function favorite(id) {
  const productId = Number(id);

  if (state.favs.includes(productId)) {
    state.favs = state.favs.filter((item) => item !== productId);
  } else {
    state.favs.push(productId);
  }

  save();
  render();
  notify(
    state.favs.includes(productId)
      ? "добавлено в избранное ♡"
      : "удалено из избранного"
  );
}

function renderCart() {
  const box = $("#cart-items");
  const empty = $("#cart-empty");
  const footer = $("#cart-footer");
  if (!box || !empty || !footer) return;

  state.cart = state.cart.filter((row) => get(row.id));

  if (!state.cart.length) {
    box.innerHTML = "";
    empty.hidden = false;
    footer.hidden = true;
    updateCounts();
    return;
  }

  empty.hidden = true;
  footer.hidden = false;

  box.innerHTML = state.cart.map((row) => {
    const product = get(row.id);

    return `
      <div class="cart-line">
        <img src="${product.img}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <small>${product.vol}</small>
          <div class="qty">
            <button data-qty="${product.id}" data-delta="-1">−</button>
            ${row.qty}
            <button data-qty="${product.id}" data-delta="1">+</button>
          </div>
        </div>
        <div>
          <strong>${money(product.price * row.qty)}</strong>
          <br>
          <button class="remove" data-remove="${product.id}">УДАЛИТЬ</button>
        </div>
      </div>
    `;
  }).join("");

  const subtotal = $("#subtotal");
  if (subtotal) {
    subtotal.textContent = money(
      state.cart.reduce((sum, row) => sum + get(row.id).price * row.qty, 0)
    );
  }

  updateCounts();
}

function changeQty(id, delta) {
  const row = state.cart.find((item) => item.id === Number(id));
  if (!row) return;

  row.qty += delta;

  if (row.qty < 1) {
    state.cart = state.cart.filter((item) => item.id !== Number(id));
  }

  save();
  renderCart();
  updateCounts();
}

function close() {
  $("#drawer")?.classList.remove("open");
  $("#overlay")?.classList.remove("show");

  $$(".modal").forEach((modal) => modal.classList.remove("open"));
  document.body.style.overflow = "";
}

function showModal(id) {
  close();
  $(id)?.classList.add("open");
  $("#overlay")?.classList.add("show");
  document.body.style.overflow = "hidden";
}

function cartOpen() {
  $("#drawer")?.classList.add("open");
  $("#overlay")?.classList.add("show");
  document.body.style.overflow = "hidden";
}

function detail(id) {
  const product = get(id);
  const container = $("#product-detail");
  if (!product || !container) return;

  container.innerHTML = `
    <div class="detail">
      <img src="${product.img}" alt="${product.name}">
      <div>
        <p class="eyebrow">${product.type}</p>
        <h2>${product.name}</h2>
        <p>${product.desc}</p>
        <div class="detail-price">${money(product.price)}</div>
        <small>
          ОБЪЁМ: ${product.vol}<br>
          РЕЙТИНГ: ★ ${product.rating}<br>
          СОСТАВ: ${product.ingredients}
        </small>
        <button class="btn pink" data-add="${product.id}">
          ${product.cat === "alcoholic" ? "ДЕМО-ПОЗИЦИЯ" : "В КОРЗИНУ +"}
        </button>
      </div>
    </div>
  `;

  showModal("#product-modal");
}

$("#filters")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cat]");
  if (!button) return;

  state.cat = button.dataset.cat;
  state.showFavorites = false;

  $$("[data-cat]").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  render();
});

$("#sort")?.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

$("#products")?.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-fav]");
  if (favoriteButton) {
    event.stopPropagation();
    favorite(favoriteButton.dataset.fav);
    return;
  }

  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    event.stopPropagation();
    add(addButton.dataset.add);
    return;
  }

  const productCard = event.target.closest("[data-product]");
  if (productCard) detail(productCard.dataset.product);
});

$("#products")?.addEventListener("keydown", (event) => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.matches("[data-product]")
  ) {
    event.preventDefault();
    detail(event.target.dataset.product);
  }
});

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton && !$("#products")?.contains(addButton)) {
    add(addButton.dataset.add);

    if ($("#product-modal")?.classList.contains("open")) {
      close();
    }
  }

  const favoriteButton = event.target.closest("[data-fav]");
  if (favoriteButton && !$("#products")?.contains(favoriteButton)) {
    favorite(favoriteButton.dataset.fav);
  }

  const quantityButton = event.target.closest("[data-qty]");
  if (quantityButton) {
    changeQty(quantityButton.dataset.qty, Number(quantityButton.dataset.delta));
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    state.cart = state.cart.filter(
      (item) => item.id !== Number(removeButton.dataset.remove)
    );
    save();
    renderCart();
    updateCounts();
  }

  if (event.target.matches("[data-close]")) close();
});

$("#cart-open")?.addEventListener("click", cartOpen);
$("#cart-close")?.addEventListener("click", close);
$("#overlay")?.addEventListener("click", close);
$("#continue")?.addEventListener("click", close);

$("#checkout-open")?.addEventListener("click", () => {
  if (state.cart.length) showModal("#checkout-modal");
});

$("#search-toggle")?.addEventListener("click", () => {
  $("#search")?.classList.toggle("show");
  $("#query")?.focus();
});

$("#query")?.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  state.showFavorites = false;
  render();
});

$("#clear-search")?.addEventListener("click", () => {
  if ($("#query")) $("#query").value = "";
  state.query = "";
  render();
});

$("#favorites-toggle")?.addEventListener("click", () => {
  state.cat = "all";
  state.query = "";
  state.showFavorites = true;

  if ($("#query")) $("#query").value = "";

  $$("[data-cat]").forEach((button) => {
    button.classList.toggle("active", button.dataset.cat === "all");
  });

  render();
  $("#catalog")?.scrollIntoView({ behavior: "smooth" });
});

$("#hamb")?.addEventListener("click", () => {
  $("#nav")?.classList.toggle("open");
});

$$("nav a").forEach((link) => {
  link.addEventListener("click", () => $("#nav")?.classList.remove("open"));
});

$("#newsletter")?.addEventListener("submit", (event) => {
  event.preventDefault();
  notify("ты в списке рассылки ♡");
  event.target.reset();
});

const checkoutForm = $("#checkout-form");

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.target;
  if (!form.reportValidity() || !state.cart.length) return;

  const orderNumber = "BC-" + String(Date.now()).slice(-6);
  const order = {
    orderNumber,
    createdAt: new Date().toISOString(),
    customer: {
      name: form.elements.name.value,
      email: form.elements.email.value,
      phone: form.elements.phone.value,
      address: form.elements.address.value
    },
    items: state.cart.map((row) => {
      const product = get(row.id);
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: row.qty
      };
    }),
    total: state.cart.reduce(
      (sum, row) => sum + get(row.id).price * row.qty,
      0
    )
  };

  const orders = readStorage("blush-demo-orders", []);
  orders.push(order);

  try {
    localStorage.setItem("blush-demo-orders", JSON.stringify(orders));
  } catch (error) {
    console.warn("не удалось сохранить демо-заказ", error);
  }

  state.cart = [];
  save();
  renderCart();
  updateCounts();
  close();
  form.reset();

  notify(`демо-заказ ${orderNumber} оформлен ♡`);
});

const ageGate = $("#age-gate");
const ageYes = $("#age-yes");
const ageNo = $("#age-no");

if (ageGate && ageYes && ageNo) {
  try {
    if (
      localStorage.getItem("blushAgeConfirmed") === "true" ||
      sessionStorage.getItem("blush-age") === "yes"
    ) {
      ageGate.classList.add("hidden");
    }
  } catch (error) {
  }

  ageYes.addEventListener("click", () => {
    try {
      localStorage.setItem("blushAgeConfirmed", "true");
      sessionStorage.setItem("blush-age", "yes");
    } catch (error) {

    }
    ageGate.classList.add("hidden");
  });

  ageNo.addEventListener("click", () => {
    ageGate.innerHTML = `
      <div class="age-box">
        <h2>SEE YOU<br><em>SOON.</em></h2>
        <p>для просмотра концепт-магазина требуется подтверждение возраста</p>
      </div>
    `;
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") close();
});

render();
renderCart();
updateCounts();