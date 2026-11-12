const adminUser = requireAuth();

if (adminUser) {

    if (adminUser.role !== "ADMIN") {

        alert("Access denied. Admin only.");

        window.location.href = "dashboard.html";

    } else {

        document.getElementById("app").innerHTML =
            layout("User Management", "users") +

            `
            <div class="toolbar">

                <input
                    type="text"
                    id="userSearch"
                    placeholder="Search users..."
                    oninput="renderUsers()"
                >

                <button
                    class="btn btn-primary"
                    onclick="openUserModal()">
                    + Add User
                </button>

            </div>

            <div class="panel">

                <div class="panel-header">
                    <h3>System Users</h3>
                </div>

                <div class="table-wrap">

                    <table>

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody id="userTable"></tbody>

                    </table>

                </div>

            </div>

            <div id="userModal" class="modal">

                <div class="modal-card">

                    <div class="modal-header">

                        <h3 id="userModalTitle">
                            Add User
                        </h3>

                        <button onclick="closeUserModal()">
                            ✕
                        </button>

                    </div>

                    <input
                        type="hidden"
                        id="userId"
                    >

                    <label>Name</label>

                    <input
                        type="text"
                        id="userName"
                    >

                    <label>Email</label>

                    <input
                        type="email"
                        id="userEmail"
                    >

                    <label>Phone</label>

                    <input
                        type="text"
                        id="userPhone"
                    >

                    <label>Password</label>

                    <input
                        type="password"
                        id="userPassword"
                    >

                    <label>Role</label>

                    <select id="userRole">

                        <option value="CUSTOMER">
                            Customer
                        </option>

                        <option value="ADMIN">
                            Admin
                        </option>

                    </select>

                    <div class="modal-actions">

                        <button
                            class="btn btn-secondary"
                            onclick="closeUserModal()">
                            Cancel
                        </button>

                        <button
                            class="btn btn-primary"
                            onclick="saveUser()">
                            Save
                        </button>

                    </div>

                </div>

            </div>
            ` +

            closeLayout();

        renderUsers();
    }
}

function renderUsers() {

    let users = getUsers();

    const search =
        document.getElementById("userSearch")
            ?.value.toLowerCase() || "";

    users = users.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search)
    );

    const table =
        document.getElementById("userTable");

    table.innerHTML = users.map(user => `
        <tr>

            <td>
                <strong>
                    ${escapeHTML(user.name)}
                </strong>
            </td>

            <td>
                ${escapeHTML(user.email)}
            </td>

            <td>
                ${escapeHTML(user.phone)}
            </td>

            <td>
                <span class="status ${
                    user.role === "ADMIN"
                        ? "status-confirmed"
                        : "status-pending"
                }">
                    ${user.role}
                </span>
            </td>

            <td>

                <button
                    class="btn btn-small"
                    onclick="editUser(${user.id})">
                    Edit
                </button>

                ${
                    user.id !== adminUser.id
                        ? `
                        <button
                            class="btn btn-danger btn-small"
                            onclick="deleteUser(${user.id})">
                            Delete
                        </button>
                        `
                        : ""
                }

            </td>

        </tr>
    `).join("");
}

function openUserModal(id = null) {

    document.getElementById("userId").value = "";

    if (id) {

        const user =
            getUsers().find(u => u.id === id);

        if (!user) return;

        document.getElementById("userModalTitle")
            .innerText = "Edit User";

        document.getElementById("userId").value =
            user.id;

        document.getElementById("userName").value =
            user.name;

        document.getElementById("userEmail").value =
            user.email;

        document.getElementById("userPhone").value =
            user.phone;

        document.getElementById("userPassword").value =
            user.password;

        document.getElementById("userRole").value =
            user.role;

    } else {

        document.getElementById("userModalTitle")
            .innerText = "Add User";

        document.getElementById("userName").value = "";

        document.getElementById("userEmail").value = "";

        document.getElementById("userPhone").value = "";

        document.getElementById("userPassword").value = "";

        document.getElementById("userRole").value =
            "CUSTOMER";
    }

    document
        .getElementById("userModal")
        .classList.add("show");
}

function closeUserModal() {

    document
        .getElementById("userModal")
        .classList.remove("show");
}

function saveUser() {

    const id =
        document.getElementById("userId").value;

    const name =
        document.getElementById("userName").value.trim();

    const email =
        document.getElementById("userEmail")
            .value.trim()
            .toLowerCase();

    const phone =
        document.getElementById("userPhone")
            .value.trim();

    const password =
        document.getElementById("userPassword").value;

    const role =
        document.getElementById("userRole").value;

    if (!name || !email || !phone || !password) {

        alert("Please fill all fields.");
        return;
    }

    if (!/^\d{10}$/.test(phone)) {

        alert("Phone number must contain 10 digits.");
        return;
    }

    let users = getUsers();

    const duplicate =
        users.find(
            u =>
                u.email === email &&
                u.id != id
        );

    if (duplicate) {

        alert("Email already exists.");
        return;
    }

    if (id) {

        const index =
            users.findIndex(
                u => u.id == id
            );

        users[index] = {
            ...users[index],
            name,
            email,
            phone,
            password,
            role
        };

    } else {

        users.push({
            id: Date.now(),
            name,
            email,
            phone,
            password,
            role
        });
    }

    setData(DB.users, users);

    closeUserModal();

    renderUsers();

    alert("User saved successfully!");
}

function editUser(id) {

    openUserModal(id);
}

function deleteUser(id) {

    if (id === adminUser.id) {

        alert("You cannot delete your own account.");
        return;
    }

    if (!confirm("Delete this user?")) {
        return;
    }

    let users = getUsers();

    users =
        users.filter(
            user => user.id !== id
        );

    setData(DB.users, users);

    renderUsers();

    alert("User deleted.");
}