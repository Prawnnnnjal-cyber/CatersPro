const user = requireAuth();

if (user) {

    document.getElementById("app").innerHTML =
        layout("Booking Management", "bookings") +
        `

        <div class="toolbar">

            <input
                type="text"
                id="searchBooking"
                placeholder="Search booking..."
                oninput="renderBookings()"
            >

            <select
                id="statusFilter"
                onchange="renderBookings()"
            >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>

            <button
                class="btn btn-primary"
                onclick="openBookingModal()"
            >
                + New Booking
            </button>

        </div>


        <div class="panel">

            <div class="panel-header">
                <h3>All Bookings</h3>
            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Guests</th>
                            <th>Service</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody id="bookingTable"></tbody>

                </table>

            </div>

        </div>


        <!-- BOOKING MODAL -->

        <div id="bookingModal" class="modal">

            <div class="modal-card">

                <div class="modal-header">

                    <h3 id="bookingModalTitle">
                        New Booking
                    </h3>

                   <button type="button" onclick="closeBookingModal()">✕</button>

                </div>


                <input
                    type="hidden"
                    id="bookingId"
                >


                <label>Customer Name</label>

                <input
                    type="text"
                    id="customerName"
                    placeholder="Enter customer name"
                >


                <label>Email</label>

                <input
                    type="email"
                    id="customerEmail"
                    placeholder="Enter email"
                >


                <label>Event</label>

                <input
                    type="text"
                    id="eventType"
                    placeholder="Wedding / Birthday / Party"
                >


                <label>Event Date</label>

                <input
                    type="date"
                    id="eventDate"
                >


                <label>Number of Guests</label>

                <input
                    type="number"
                    id="guestCount"
                    min="1"
                    placeholder="Number of guests"
                >


                <label>Service</label>

                <select
                    id="bookingService"
                    onchange="updateAmount()"
                ></select>


                <label>Amount</label>

                <input
                    type="number"
                    id="bookingAmount"
                    min="0"
                >


                <label>Status</label>

                <select id="bookingStatus">

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Confirmed">
                        Confirmed
                    </option>

                    <option value="Preparing">
                        Preparing
                    </option>

                    <option value="Completed">
                        Completed
                    </option>

                    <option value="Cancelled">
                        Cancelled
                    </option>

                </select>


                <div class="modal-actions">

                    <button
                        class="btn btn-secondary"
                        onclick="closeBookingModal()"
                    >
                        Cancel
                    </button>

                    <button
                        class="btn btn-primary"
                        onclick="saveBooking()"
                    >
                        Save Booking
                    </button>

                </div>

            </div>

        </div>

        ` +
        closeLayout();


    renderBookings();
}


// ==========================================
// RENDER BOOKINGS
// ==========================================

function renderBookings() {

    let bookings = getBookings();

    const search =
        document.getElementById("searchBooking")
        ?.value
        .toLowerCase() || "";

    const filter =
        document.getElementById("statusFilter")
        ?.value || "";


    // CUSTOMER CAN ONLY SEE OWN BOOKINGS

    if (user.role !== "ADMIN") {

        bookings = bookings.filter(
            booking =>
                booking.email.toLowerCase() ===
                user.email.toLowerCase()
        );

    }


    bookings = bookings.filter(booking => {

        const text =
            (
                booking.customer +
                " " +
                booking.event +
                " " +
                booking.service
            ).toLowerCase();


        const searchMatch =
            text.includes(search);


        const statusMatch =
            !filter ||
            booking.status === filter;


        return searchMatch && statusMatch;

    });


    const table =
        document.getElementById("bookingTable");


    if (bookings.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    style="text-align:center;"
                >
                    No bookings found
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        bookings.map(booking => `

            <tr>

                <td>
                    #${booking.id}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(booking.customer)}
                    </strong>
                    <br>
                    <small>
                        ${escapeHTML(booking.email)}
                    </small>
                </td>

                <td>
                    ${escapeHTML(booking.event)}
                </td>

                <td>
                    ${booking.date}
                </td>

                <td>
                    ${booking.guests}
                </td>

                <td>
                    ${escapeHTML(booking.service)}
                </td>

                <td>
                    ${money(booking.amount)}
                </td>

                <td>

                    <span class="
                        status
                        ${statusClass(booking.status)}
                    ">
                        ${booking.status}
                    </span>

                </td>

                <td>

                    <button
                        class="btn btn-small"
                        onclick="editBooking(${booking.id})"
                    >
                        Edit
                    </button>

                    ${
                        user.role === "ADMIN"
                        ?
                        `
                        <button
                            class="btn btn-danger btn-small"
                            onclick="deleteBooking(${booking.id})"
                        >
                            Delete
                        </button>
                        `
                        :
                        ""
                    }

                </td>

            </tr>

        `).join("");

}


// ==========================================
// LOAD SERVICES
// ==========================================

function loadServices(selected = "") {

    const services = getServices();

    const select =
        document.getElementById("bookingService");


    if (!services.length) {

        select.innerHTML = `
            <option value="">
                No service available
            </option>
        `;

        return;
    }


    select.innerHTML =
        services.map(service => `

            <option
                value="${escapeHTML(service.name)}"
                ${
                    service.name === selected
                    ? "selected"
                    : ""
                }
            >
                ${escapeHTML(service.name)}
                - ${money(service.price)}
            </option>

        `).join("");

}


// ==========================================
// AUTO AMOUNT
// ==========================================

function updateAmount() {

    const selected =
        document.getElementById(
            "bookingService"
        ).value;


    const service =
        getServices().find(
            item => item.name === selected
        );


    if (service) {

        document.getElementById(
            "bookingAmount"
        ).value = service.price;

    }

}


// ==========================================
// OPEN MODAL
// ==========================================

function openBookingModal(id = null) {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    loadServices();


    // RESET

    document.getElementById(
        "bookingId"
    ).value = "";


    document.getElementById(
        "customerName"
    ).value = "";


    document.getElementById(
        "customerEmail"
    ).value = "";


    document.getElementById(
        "eventType"
    ).value = "";


    document.getElementById(
        "eventDate"
    ).value = "";


    document.getElementById(
        "guestCount"
    ).value = "";


    document.getElementById(
        "bookingAmount"
    ).value = "";


    document.getElementById(
        "bookingStatus"
    ).value = "Pending";


    // NEW BOOKING

    if (!id) {

        document.getElementById(
            "bookingModalTitle"
        ).innerText = "New Booking";


        if (user.role !== "ADMIN") {

            document.getElementById(
                "customerName"
            ).value = user.name;


            document.getElementById(
                "customerEmail"
            ).value = user.email;


            document.getElementById(
                "customerName"
            ).readOnly = true;


            document.getElementById(
                "customerEmail"
            ).readOnly = true;


            document.getElementById(
                "bookingStatus"
            ).disabled = true;

        } else {

            document.getElementById(
                "customerName"
            ).readOnly = false;


            document.getElementById(
                "customerEmail"
            ).readOnly = false;


            document.getElementById(
                "bookingStatus"
            ).disabled = false;

        }

    }


    // EDIT

    else {

        const booking =
            getBookings().find(
                item => item.id === id
            );


        if (!booking) {

            alert("Booking not found.");

            return;
        }


        if (
            user.role !== "ADMIN" &&
            booking.email.toLowerCase() !==
            user.email.toLowerCase()
        ) {

            alert(
                "You cannot edit this booking."
            );

            return;
        }


        document.getElementById(
            "bookingModalTitle"
        ).innerText = "Edit Booking";


        document.getElementById(
            "bookingId"
        ).value = booking.id;


        document.getElementById(
            "customerName"
        ).value = booking.customer;


        document.getElementById(
            "customerEmail"
        ).value = booking.email;


        document.getElementById(
            "eventType"
        ).value = booking.event;


        document.getElementById(
            "eventDate"
        ).value = booking.date;


        document.getElementById(
            "guestCount"
        ).value = booking.guests;


        loadServices(
            booking.service
        );


        document.getElementById(
            "bookingAmount"
        ).value = booking.amount;


        document.getElementById(
            "bookingStatus"
        ).value = booking.status;


        if (user.role !== "ADMIN") {

            document.getElementById(
                "customerName"
            ).readOnly = true;


            document.getElementById(
                "customerEmail"
            ).readOnly = true;


            document.getElementById(
                "bookingStatus"
            ).disabled = true;

        } else {

            document.getElementById(
                "customerName"
            ).readOnly = false;


            document.getElementById(
                "customerEmail"
            ).readOnly = false;


            document.getElementById(
                "bookingStatus"
            ).disabled = false;

        }

    }


    modal.style.display = "flex";
modal.classList.add("show");

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeBookingModal() {
    const modal = document.getElementById("bookingModal");

    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "none";
    }
}


// ==========================================
// SAVE BOOKING
// ==========================================

function saveBooking() {

    const id =
        document.getElementById(
            "bookingId"
        ).value;


    const customer =
        document.getElementById(
            "customerName"
        ).value.trim();


    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();


    const event =
        document.getElementById(
            "eventType"
        ).value.trim();


    const date =
        document.getElementById(
            "eventDate"
        ).value;


    const guests =
        Number(
            document.getElementById(
                "guestCount"
            ).value
        );


    const service =
        document.getElementById(
            "bookingService"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "bookingAmount"
            ).value
        );


    const status =
        document.getElementById(
            "bookingStatus"
        ).value;


    // VALIDATION

    if (
        !customer ||
        !email ||
        !event ||
        !date ||
        !guests ||
        !service
    ) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        alert(
            "Enter a valid email."
        );

        return;
    }


    if (guests < 1) {

        alert(
            "Guests must be at least 1."
        );

        return;
    }


    let bookings = getBookings();


    // EDIT EXISTING

    if (id) {

        const index =
            bookings.findIndex(
                booking =>
                    booking.id == id
            );


        if (index === -1) {

            alert(
                "Booking not found."
            );

            return;
        }


        bookings[index] = {

            ...bookings[index],

            customer,
            email,
            event,
            date,
            guests,
            service,
            amount,

            status:
                user.role === "ADMIN"
                ? status
                : bookings[index].status

        };

    }


    // CREATE NEW

    else {

        bookings.push({

            id: Date.now(),

            customer,

            email,

            event,

            date,

            guests,

            service,

            amount,

            status: "Pending"

        });

    }


    setData(
        DB.bookings,
        bookings
    );


    closeBookingModal();

    renderBookings();


    alert(
        "Booking saved successfully! ✅"
    );

}


// ==========================================
// EDIT
// ==========================================

function editBooking(id) {

    openBookingModal(id);

}


// ==========================================
// DELETE
// ==========================================

function deleteBooking(id) {

    if (user.role !== "ADMIN") {

        alert(
            "Only admin can delete bookings."
        );

        return;
    }


    if (
        !confirm(
            "Are you sure you want to delete this booking?"
        )
    ) {

        return;
    }


    let bookings = getBookings();


    bookings =
        bookings.filter(
            booking =>
                booking.id !== id
        );


    setData(
        DB.bookings,
        bookings
    );


    renderBookings();


    alert(
        "Booking deleted successfully."
    );

}