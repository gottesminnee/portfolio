let products = [];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const ageGate = $("#age-gate");
const ageYes = $("#age-yes");
const ageNo = $("#age-no");

if (ageGate && ageYes && ageNo) {

  try {
    if (localStorage.getItem("blushAgeConfirmed") === "true") {
      ageGate.classList.add("hidden");
    }
  } catch (error) {
    console.log("Age storage unavailable");
  }

  ageYes.addEventListener("click", () => {
    try {
      localStorage.setItem("blushAgeConfirmed", "true");
    } catch (error) {
      console.log("Age storage unavailable");
    }

    ageGate.classList.add("hidden");
  });

  ageNo.addEventListener("click", () => {
    ageGate.innerHTML = `
      <div>
        <h2>SEE YOU<br><em>SOON.</em></h2>
        <p>Для просмотра концепт-магазина требуется подтверждение возраста 18+.</p>
      </div>
    `;
  });
}

const money = n =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";

const state = {
  cat: "all",
  query: "",
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("blush-cart") || "[]"),
  favs: JSON.parse(localStorage.getItem("blush-favs") || "[]")
};

const get = id => products.find(p => p.id === +id);

let toastTimer;

function save() {
  localStorage.setItem("blush-cart", JSON.stringify(state.cart));
  localStorage.setItem("blush-favs", JSON.stringify(state.favs));
}

function notify(msg) {
  const t = $("#toast");

  t.textContent = msg;
  t.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    t.classList.remove("show");
  }, 2500);
}

function filtered() {
  let a = products.filter(p =>
    (state.cat === "all" || p.cat === state.cat) &&
    (p.name + " " + p.type + " " + p.desc)
      .toLowerCase()
      .includes(state.query.toLowerCase())
  );

  if (state.sort === "asc") {
    a.sort((x, y) => x.price - y.price);
  }

  if (state.sort === "desc") {
    a.sort((x, y) => y.price - x.price);
  }

  if (state.sort === "name") {
    a.sort((x, y) => x.name.localeCompare(y.name));
  }

  return a;
}

function render() {
  const list = filtered();

  $("#products").innerHTML = list.map(p => `
    <article class="card">
      <div class="visual" data-product="${p.id}"
        tabindex="0" role="button">

        <img src="${p.img}" alt="${p.name}" loading="lazy">

        <span class="badge">${p.badge}</span>

        <button class="heart ${state.favs.includes(p.id) ? "on" : ""}"
          data-fav="${p.id}" aria-label="Избранное">
          ${state.favs.includes(p.id) ? "♥" : "♡"}
        </button>

        <button class="quick" data-add="${p.id}">
          ДОБАВИТЬ В КОРЗИНУ +
        </button>
      </div>

      <div class="info">
        <div>
          <div class="name">${p.name}</div>
          <div class="type">${p.type} · ${p.vol}</div>
          <div class="rating">★ ${p.rating} / 5.0</div>
        </div>

        <div class="price">${money(p.price)}</div>
      </div>
    </article>
  `).join("");

  $("#total").textContent =
    String(list.length).padStart(2, "0") + " PRODUCTS";

  $("#empty").hidden = !!list.length;

  updateCounts();
}

function updateCounts() {
  $("#cart-count").textContent =
    state.cart.reduce((n, x) => n + x.qty, 0);

  $("#fav-count").textContent = state.favs.length;
}

function add(id) {
  const p = get(id);

  if (p.cat === "alcoholic") {
    notify("Демо-позиция 18+: покупка недоступна.");
    return;
  }

  const row = state.cart.find(x => x.id === p.id);

  if (row) {
    row.qty++;
  } else {
    state.cart.push({
      id: p.id,
      qty: 1
    });
  }

  save();
  renderCart();
  updateCounts();

  notify(p.name + " добавлен в корзину ♡");
}

function favorite(id) {
  id = +id;

  if (state.favs.includes(id)) {
    state.favs = state.favs.filter(x => x !== id);
  } else {
    state.favs.push(id);
  }

  save();
  render();

  notify(
    state.favs.includes(id)
      ? "Добавлено в избранное ♡"
      : "Удалено из избранного"
  );
}

function renderCart() {
  const box = $("#cart-items");
  const empty = $("#cart-empty");
  const foot = $("#cart-footer");

  if (!state.cart.length) {
    box.innerHTML = "";
    empty.hidden = false;
    foot.hidden = true;
    return;
  }

  empty.hidden = true;
  foot.hidden = false;

  box.innerHTML = state.cart.map(row => {
    const p = get(row.id);

    return `
      <div class="cart-line">
        <img src="${p.img}" alt="">

        <div>
          <h4>${p.name}</h4>
          <small>${p.vol}</small>

          <div class="qty">
            <button data-qty="${p.id}" data-delta="-1">−</button>
            ${row.qty}
            <button data-qty="${p.id}" data-delta="1">+</button>
          </div>
        </div>

        <div>
          <strong>${money(p.price * row.qty)}</strong>
          <br>
          <button class="remove" data-remove="${p.id}">
            УДАЛИТЬ
          </button>
        </div>
      </div>
    `;
  }).join("");

  $("#subtotal").textContent = money(
    state.cart.reduce((n, x) =>
      n + get(x.id).price * x.qty, 0
    )
  );
}

function qty(id, delta) {
  const x = state.cart.find(r => r.id === +id);

  if (!x) return;

  x.qty += delta;

  if (x.qty < 1) {
    state.cart = state.cart.filter(r => r.id !== +id);
  }

  save();
  renderCart();
  updateCounts();
}

function close() {
  $("#drawer").classList.remove("open");
  $("#overlay").classList.remove("show");

  $$(".modal").forEach(x =>
    x.classList.remove("open")
  );

  document.body.style.overflow = "";
}

function showModal(id) {
  close();

  $(id).classList.add("open");
  $("#overlay").classList.add("show");

  document.body.style.overflow = "hidden";
}

function cartOpen() {
  $("#drawer").classList.add("open");
  $("#overlay").classList.add("show");

  document.body.style.overflow = "hidden";
}

function detail(id) {
  const p = get(id);

  $("#product-detail").innerHTML = `
    <div class="detail">
      <img src="${p.img}" alt="${p.name}">

      <div>
        <p class="eyebrow">${p.type}</p>

        <h2>${p.name}</h2>

        <p>${p.desc}</p>

        <div class="detail-price">
          ${money(p.price)}
        </div>

        <small>
          ОБЪЁМ: ${p.vol}<br>
          РЕЙТИНГ: ★ ${p.rating}<br>
          СОСТАВ: ${p.ingredients}
        </small>

        <button class="btn pink" data-add="${p.id}">
          ${p.cat === "alcoholic"
            ? "ДЕМО-ПОЗИЦИЯ 18+"
            : "В КОРЗИНУ +"}
        </button>
      </div>
    </div>
  `;

  showModal("#product-modal");
}


$("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");

  if (!b) return;

  state.cat = b.dataset.cat;

  $$("[data-cat]").forEach(x =>
    x.classList.toggle("active", x === b)
  );

  render();
});


$("#sort").addEventListener("change", e => {
  state.sort = e.target.value;
  render();
});


$("#products").addEventListener("click", e => {
  const f = e.target.closest("[data-fav]");

  if (f) {
    e.stopPropagation();
    favorite(f.dataset.fav);
    return;
  }

  const a = e.target.closest("[data-add]");

  if (a) {
    e.stopPropagation();
    add(a.dataset.add);
    return;
  }

  const p = e.target.closest("[data-product]");

  if (p) {
    detail(p.dataset.product);
  }
});

$("#products").addEventListener("keydown", e => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.matches("[data-product]")
  ) {
    detail(e.target.dataset.product);
  }
});


document.addEventListener("click", e => {
  const a = e.target.closest("[data-add]");

  if (a && !$("#products").contains(a)) {
    add(a.dataset.add);

    if ($("#product-modal").classList.contains("open")) {
      close();
    }
  }

  const f = e.target.closest("[data-fav]");

  if (f && !$("#products").contains(f)) {
    favorite(f.dataset.fav);
  }

  const q = e.target.closest("[data-qty]");

  if (q) {
    qty(q.dataset.qty, +q.dataset.delta);
  }

  const r = e.target.closest("[data-remove]");

  if (r) {
    state.cart = state.cart.filter(
      x => x.id !== +r.dataset.remove
    );

    save();
    renderCart();
    updateCounts();
  }

  if (e.target.matches("[data-close]")) {
    close();
  }
});


$("#cart-open").onclick = cartOpen;
$("#cart-close").onclick = close;
$("#overlay").onclick = close;
$("#continue").onclick = close;

$("#checkout-open").onclick = () => {
  if (state.cart.length) {
    showModal("#checkout-modal");
  }
};


$("#search-toggle").onclick = () => {
  $("#search").classList.toggle("show");
  $("#query").focus();
};

$("#query").oninput = e => {
  state.query = e.target.value.trim();
  render();
};

$("#clear-search").onclick = () => {
  $("#query").value = "";
  state.query = "";
  render();
};


$("#favorites-toggle").onclick = () => {
  state.cat = "all";
  state.query = "";
  $("#query").value = "";

  $$("[data-cat]").forEach(x =>
    x.classList.toggle("active", x.dataset.cat === "all")
  );

  const a = products.filter(p =>
    state.favs.includes(p.id)
  );

  $("#products").innerHTML = a.map(p => `
    <article class="card">
      <div class="visual" data-product="${p.id}">
        <img src="${p.img}" alt="${p.name}">
        <span class="badge">FAVORITE</span>

        <button class="heart on" data-fav="${p.id}">
          ♥
        </button>

        <button class="quick" data-add="${p.id}">
          ДОБАВИТЬ В КОРЗИНУ +
        </button>
      </div>

      <div class="info">
        <div class="name">${p.name}</div>
        <div class="price">${money(p.price)}</div>
      </div>
    </article>
  `).join("");

  $("#total").textContent = a.length + " FAVORITES";
  $("#empty").hidden = !!a.length;

  $("#catalog").scrollIntoView({
    behavior: "smooth"
  });
};


$("#hamb").onclick = () =>
  $("#nav").classList.toggle("open");

$$("nav a").forEach(a => {
  a.onclick = () =>
    $("#nav").classList.remove("open");
});


$("#newsletter").onsubmit = e => {
  e.preventDefault();

  notify("Ты в списке рассылки ♡");

  e.target.reset();
};


const checkoutForm = $("#checkout-form");

if (checkoutForm) {
  checkoutForm.onsubmit = async e => {
    e.preventDefault();

    if (!e.target.reportValidity()) return;

    const form = e.target;

    const orderData = {
        name: form.elements.name.value,
        email: form.elements.email.value,
        phone: form.elements.phone.value,
        address: form.elements.address.value,

        items: state.cart.map(row => ({
            productId: get(row.id).dbId,
            quantity: row.qty
        }))
    };

    try {
        const response = await fetch("http://localhost:8080/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error("Не удалось оформить заказ");
        }

        const order = await response.json();

        state.cart = [];

        save();
        renderCart();
        updateCounts();
        close();

        form.reset();

        notify("Заказ " + order.orderNumber + " сохранён♡");

    } catch (error) {
        console.error(error);
        notify("Ошибка оформления");
    }
  }
};

$("#age-yes").onclick = () => {
  localStorage.setItem("blushAgeConfirmed", "true");
  $("#age-gate").classList.add("hidden");
};

$("#age-no").onclick = () => {
  $("#age-gate").innerHTML = `
    <div>
      <h2>SEE YOU<br><em>SOON.</em></h2>
      <p>
        Для просмотра концепт-магазина требуется
        подтверждение возраста 18+.
      </p>
    </div>
  `;
};

if (sessionStorage.getItem("blush-age") === "yes") {
  $("#age-gate").classList.add("hidden");
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    close();
  }
});

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:8080/api/products");

    if (!response.ok) {
      throw new Error("Ошибка загрузки товаров");
    }

    const data = await response.json();

    const frontendIds = {
      "Pink Guava Fizz": 1,
      "Cherry Crush": 2,
      "Peach Please": 3,
      "Rosé Daydream": 4,
      "Berry Blush Spritz": 5,
      "Vanilla Cloud": 6
    };

    products = data.map(p => ({
      id: frontendIds[p.name] ?? p.id,
      dbId: p.id,
      name: p.name,
      cat: p.category,
      type: p.type,
      price: p.price,
      vol: p.volume,
      badge: p.badge,
      rating: p.rating,
      img: "." + p.image,
      desc: p.description,
      ingredients: p.ingredients
    }));

    render();
    renderCart();
    updateCounts();

  } catch (error) {
    console.error("Ошибка:", error);
    $("#products").innerHTML =
      "<p>Не удалось загрузить каталог</p>";
  }
}

loadProducts();