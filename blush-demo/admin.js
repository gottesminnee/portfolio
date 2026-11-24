
let adminAuth = "";

const loginScreen = document.querySelector("#login-screen");
const adminPanel = document.querySelector("#admin-panel");

document.querySelector("#login-form").addEventListener("submit", async e => {
    e.preventDefault();

    const username = document.querySelector("#login").value;
    const password = document.querySelector("#password").value;

    adminAuth = "Basic " + btoa(username + ":" + password);

    try {
        const response = await fetch("http://localhost:8080/api/orders", {
            headers: {
                Authorization: adminAuth
            }
        });

        if (!response.ok) {
            throw new Error("неверный логин или пароль");
        }

        loginScreen.hidden = true;
        adminPanel.hidden = false;

        loadOrders();

    } catch (error) {
        adminAuth = "";
        document.querySelector("#login-error").textContent =
            "неверный логин или пароль";
    }
});

document.querySelector("#logout").addEventListener("click", () => {
    adminAuth = "";
    adminPanel.hidden = true;
    loginScreen.hidden = false;
    document.querySelector("#password").value = "";
    document.querySelector("#login-error").textContent = "";
});

const ordersContainer = document.querySelector("#orders");

async function loadOrders() {
    try {
        const response = await fetch("http://localhost:8080/api/orders", {
            headers: {
            Authorization: adminAuth
        }
    });

        if (!response.ok) {
            throw new Error("Ошибка загрузки");
        }

        const orders = await response.json();

        document.querySelector("#total-orders").textContent = orders.length;

        document.querySelector("#new-orders").textContent =
            orders.filter(order => order.status === "NEW").length;

        document.querySelector("#revenue").textContent =
            orders.reduce((sum, order) => sum + order.total, 0) + " ₽";

        ordersContainer.innerHTML = "";

        if (orders.length === 0) {
            ordersContainer.innerHTML = "<p>ззаказов пока нет </p>";
            return;
        }

        orders.reverse().forEach(order => {
            const card = document.createElement("article");
            card.className = "order";

            const items = JSON.parse(order.itemsJson || "[]");

            card.innerHTML = `
                <div class="order-top">
                    <span class="order-number">${order.orderNumber}</span>
                    <strong>${order.total} ₽</strong>
                </div>

                <div class="order-info">
                    Покупатель: ${order.customerName}<br>
                    Email: ${order.email}<br>
                    Телефон: ${order.phone}<br>
                    Адрес: ${order.address}<br>
                    Товары: ${items.map(item =>
                        `${item.name} × ${item.quantity}`
                    ).join(", ")}
                </div>

                <select class="status">
                    <option value="NEW">новый</option>
                    <option value="PROCESSING">в обработке</option>
                    <option value="SHIPPED">отправлен</option>
                    <option value="COMPLETED">завершен</option>
                </select>

                <button class="delete">УДАЛИТЬ</button>
            `;

            const select = card.querySelector("select");
            select.value = order.status;

            select.addEventListener("change", async () => {
    try {
        const response = await fetch(
            `http://localhost:8080/api/orders/${order.id}/status`,
            {
                method: "PATCH",
                headers: {
                    Authorization: adminAuth,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: select.value
                })
            }
        );

        if (!response.ok) {
            throw new Error("ошибка изменения статуса");
        }

        loadOrders();

    } 
    
    catch (error) {
        alert("не удалось изменить статус");
        console.error(error);
        select.value = order.status;
    }
});

    card.querySelector(".delete").addEventListener("click", async () => {
        if (!confirm("Точно удалить заказ " + order.orderNumber + "?")) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/orders/${order.id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: adminAuth
                }
            }
            );

            if (!response.ok) {
                throw new Error("ошибка удаления");
            }

            loadOrders();

        } catch (error) {
            alert("не получилось удалить заказ");
            console.error(error);
        }
    });

            ordersContainer.appendChild(card);
        });

    } catch (error) {
        ordersContainer.innerHTML =
            "<p>не удалось загрузить заказы</p>";
        console.error(error);
    }
}

loadOrders();
