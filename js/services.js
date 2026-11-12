const serviceUser = requireAuth();

if (serviceUser) {

    document.getElementById("app").innerHTML =
        layout("Catering Services", "services") +
        `
        <div class="toolbar">
            <input
                type="text"
                id="serviceSearch"
                placeholder="Search service..."
                oninput="renderServices()"
            >

            ${
                serviceUser.role === "ADMIN"
                    ? `
                    <button
                        class="btn btn-primary"
                        onclick="openServiceModal()">
                        + Add Service
                    </button>
                    `
                    : ""
            }
        </div>

        <div id="serviceGrid" class="service-grid"></div>

        ${
            serviceUser.role === "ADMIN"
                ? `
                <div id="serviceModal" class="modal">
                    <div class="modal-card">

                        <div class="modal-header">
                            <h3 id="serviceModalTitle">
                                Add Service
                            </h3>

                            <button onclick="closeServiceModal()">
                                ✕
                            </button>
                        </div>

                        <input type="hidden" id="serviceId">

                        <label>Service Name</label>
                        <input
                            type="text"
                            id="serviceName"
                            placeholder="Wedding Premium"
                        >

                        <label>Price</label>
                        <input
                            type="number"
                            id="servicePrice"
                            min="0"
                        >

                        <label>Description</label>
                        <textarea
                            id="serviceDescription"
                            rows="4">
                        </textarea>

                        <label>Icon</label>
                        <input
                            type="text"
                            id="serviceIcon"
                            placeholder="🍽️"
                        >

                        <div class="modal-actions">

                            <button
                                class="btn btn-secondary"
                                onclick="closeServiceModal()">
                                Cancel
                            </button>

                            <button
                                class="btn btn-primary"
                                onclick="saveService()">
                                Save
                            </button>

                        </div>

                    </div>
                </div>
                `
                : ""
        }
        ` +
        closeLayout();

    renderServices();
}

function renderServices() {

    let services = getServices();

    const search =
        document.getElementById("serviceSearch")
            ?.value.toLowerCase() || "";

    services = services.filter(service =>
        service.name.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search)
    );

    const grid =
        document.getElementById("serviceGrid");

    grid.innerHTML = services.map(service => `
        <div class="service-card">

            <div class="service-icon">
                ${service.icon}
            </div>

            <h3>
                ${escapeHTML(service.name)}
            </h3>

            <p>
                ${escapeHTML(service.description)}
            </p>

            <h4>
                ${money(service.price)}
            </h4>

            ${
                serviceUser.role === "ADMIN"
                    ? `
                    <div style="margin-top:15px;">

                        <button
                            class="btn btn-small"
                            onclick="editService(${service.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-small"
                            onclick="deleteService(${service.id})">
                            Delete
                        </button>

                    </div>
                    `
                    : ""
            }

        </div>
    `).join("");
}

function openServiceModal(id = null) {

    if (serviceUser.role !== "ADMIN") return;

    document.getElementById("serviceId").value = "";

    if (id) {

        const service =
            getServices().find(s => s.id === id);

        if (!service) return;

        document.getElementById("serviceModalTitle")
            .innerText = "Edit Service";

        document.getElementById("serviceId").value =
            service.id;

        document.getElementById("serviceName").value =
            service.name;

        document.getElementById("servicePrice").value =
            service.price;

        document.getElementById("serviceDescription").value =
            service.description;

        document.getElementById("serviceIcon").value =
            service.icon;

    } else {

        document.getElementById("serviceModalTitle")
            .innerText = "Add Service";

        document.getElementById("serviceName").value = "";

        document.getElementById("servicePrice").value = "";

        document.getElementById("serviceDescription").value = "";

        document.getElementById("serviceIcon").value = "🍽️";
    }

    document
        .getElementById("serviceModal")
        .classList.add("show");
}

function closeServiceModal() {

    document
        .getElementById("serviceModal")
        .classList.remove("show");
}

function saveService() {

    const id =
        document.getElementById("serviceId").value;

    const name =
        document.getElementById("serviceName").value.trim();

    const price =
        Number(document.getElementById("servicePrice").value);

    const description =
        document.getElementById("serviceDescription").value.trim();

    const icon =
        document.getElementById("serviceIcon").value.trim();

    if (!name || !price || !description) {

        alert("Please fill all fields.");
        return;
    }

    let services = getServices();

    if (id) {

        const index =
            services.findIndex(s => s.id == id);

        services[index] = {
            ...services[index],
            name,
            price,
            description,
            icon
        };

    } else {

        services.push({
            id: Date.now(),
            name,
            price,
            description,
            icon: icon || "🍽️"
        });
    }

    setData(DB.services, services);

    closeServiceModal();

    renderServices();

    alert("Service saved successfully!");
}

function editService(id) {
    openServiceModal(id);
}

function deleteService(id) {

    if (!confirm("Delete this service?")) {
        return;
    }

    let services = getServices();

    services =
        services.filter(service => service.id !== id);

    setData(DB.services, services);

    renderServices();

    alert("Service deleted.");
}