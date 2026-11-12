const DB = {
    users: "caterpro_users",
    bookings: "caterpro_bookings",
    services: "caterpro_services",
    currentUser: "caterpro_current_user"
};

const defaultUsers = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@caterpro.com",
        phone: "9876543210",
        password: "admin123",
        role: "ADMIN"
    }
];

const defaultServices = [
    {
        id: 1,
        name: "Wedding Premium",
        price: 50000,
        description: "Premium wedding catering package.",
        icon: "💍"
    },
    {
        id: 2,
        name: "Birthday Special",
        price: 15000,
        description: "Complete birthday catering package.",
        icon: "🎂"
    },
    {
        id: 3,
        name: "Corporate Lunch",
        price: 25000,
        description: "Professional corporate catering.",
        icon: "💼"
    },
    {
        id: 4,
        name: "Engagement Package",
        price: 30000,
        description: "Elegant engagement catering.",
        icon: "💐"
    }
];

const defaultBookings = [
    {
        id: 1001,
        customer: "Rahul Kumar",
        email: "rahul@example.com",
        event: "Wedding",
        date: "2026-10-15",
        guests: 250,
        service: "Wedding Premium",
        amount: 50000,
        status: "Confirmed"
    },
    {
        id: 1002,
        customer: "Aman Singh",
        email: "aman@example.com",
        event: "Birthday",
        date: "2026-10-20",
        guests: 80,
        service: "Birthday Special",
        amount: 15000,
        status: "Pending"
    }
];

function getData(key, fallback) {

    const data = localStorage.getItem(key);

    if (!data) {

        localStorage.setItem(
            key,
            JSON.stringify(fallback)
        );

        return fallback;
    }

    try {
        return JSON.parse(data);
    }

    catch {
        return fallback;
    }
}

function setData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}

function getUsers() {

    return getData(
        DB.users,
        defaultUsers
    );
}

function getBookings() {

    return getData(
        DB.bookings,
        defaultBookings
    );
}

function getServices() {

    return getData(
        DB.services,
        defaultServices
    );
}

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(DB.currentUser)
        );

    } catch {

        return null;
    }
}

function setCurrentUser(user) {

    localStorage.setItem(
        DB.currentUser,
        JSON.stringify(user)
    );
}

function logout() {

    localStorage.removeItem(
        DB.currentUser
    );

    window.location.href =
        "login.html";
}

function money(value) {

    return "₹" +
        Number(value || 0)
        .toLocaleString("en-IN");
}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, function (char) {

            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return map[char];
        });
}

function statusClass(status) {

    return "status-" +
        status
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function requireAuth() {

    const user = getCurrentUser();

    if (!user) {

        window.location.href =
            "login.html";

        return null;
    }

    return user;
}

function layout(title, active) {

    const user = requireAuth();

    if (!user) {
        return "";
    }

    return `

    <aside class="sidebar" id="sidebar">

        <div class="sidebar-brand">
            🍽️ CaterPro
        </div>

        <nav class="sidebar-nav">

            <a
            href="dashboard.html"
            class="${active === "dashboard" ? "active" : ""}">
            📊 Dashboard
            </a>

            <a
            href="bookings.html"
            class="${active === "bookings" ? "active" : ""}">
            📅 Bookings
            </a>

            <a
            href="customers.html"
            class="${active === "customers" ? "active" : ""}">
            👥 Customers
            </a>

            <a
            href="services.html"
            class="${active === "services" ? "active" : ""}">
            🍴 Services
            </a>

            <a
            href="reports.html"
            class="${active === "reports" ? "active" : ""}">
            📈 Reports
            </a>

            ${
                user.role === "ADMIN"
                ?
                `
                <a
                href="users.html"
                class="${active === "users" ? "active" : ""}">
                🛡️ Users
                </a>
                `
                :
                ""
            }

        </nav>

        <button
        class="logout-btn"
        onclick="logout()">

        ↪ Logout

        </button>

    </aside>

    <div class="main-shell">

        <header class="app-header">

            <button
            onclick="document
            .getElementById('sidebar')
            .classList.toggle('open')">

            ☰

            </button>

            <div>

                <small>
                    Catering Management
                </small>

                <h2>
                    ${title}
                </h2>

            </div>

            <div class="profile-chip">

                <span class="avatar">
                    ${user.name.charAt(0)}
                </span>

                ${escapeHTML(user.name)}

            </div>

        </header>

        <main class="content">
    `;
}

function closeLayout() {

    return `
        </main>
    </div>
    `;
}