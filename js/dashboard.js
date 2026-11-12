document.addEventListener(
    "DOMContentLoaded",
    function () {

        const user =
            requireAuth();

        if (!user) {
            return;
        }

        document.getElementById(
            "app"
        ).innerHTML =
            layout(
                "Dashboard",
                "dashboard"
            )

            +

            `

            <div class="page-heading">

                <div>

                    <span class="eyebrow">
                        OVERVIEW
                    </span>

                    <h1>
                        Welcome,
                        ${escapeHTML(
                            user.name.split(" ")[0]
                        )} 👋
                    </h1>

                    <p>
                        Here's your catering business overview.
                    </p>

                </div>

                <a
                href="bookings.html"
                class="btn btn-primary">

                + New Booking

                </a>

            </div>

            <section class="kpi-grid">

                <div class="kpi-card">

                    <span>
                        Total Orders
                    </span>

                    <strong id="totalOrders">
                        0
                    </strong>

                </div>

                <div class="kpi-card">

                    <span>
                        Pending
                    </span>

                    <strong id="pendingOrders">
                        0
                    </strong>

                </div>

                <div class="kpi-card">

                    <span>
                        Confirmed
                    </span>

                    <strong id="confirmedOrders">
                        0
                    </strong>

                </div>

                <div class="kpi-card">

                    <span>
                        Revenue
                    </span>

                    <strong id="revenue">
                        ₹0
                    </strong>

                </div>

            </section>

            <div class="dashboard-grid">

                <div class="panel">

                    <div class="panel-head">

                        <h3>
                            Recent Bookings
                        </h3>

                    </div>

                    <div
                    id="recentBookings"
                    class="table-wrap">
                    </div>

                </div>

                <div class="panel">

                    <div class="panel-head">

                        <h3>
                            Order Status
                        </h3>

                    </div>

                    <div id="statusSummary">
                    </div>

                </div>

            </div>

            `

            +

            closeLayout();

        const bookings =
            getBookings();

        document.getElementById(
            "totalOrders"
        ).textContent =
            bookings.length;

        document.getElementById(
            "pendingOrders"
        ).textContent =
            bookings.filter(
                b => b.status === "Pending"
            ).length;

        document.getElementById(
            "confirmedOrders"
        ).textContent =
            bookings.filter(
                b => b.status === "Confirmed"
            ).length;

        document.getElementById(
            "revenue"
        ).textContent =
            money(
                bookings.reduce(
                    (sum, booking) =>
                        sum +
                        Number(
                            booking.amount
                        ),
                    0
                )
            );

        document.getElementById(
            "recentBookings"
        ).innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Customer</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>

                </tr>

            </thead>

            <tbody>

                ${
                    bookings
                    .slice(-5)
                    .reverse()
                    .map(
                        b => `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    b.customer
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    b.event
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    b.date
                                )}
                            </td>

                            <td>
                                ${money(
                                    b.amount
                                )}
                            </td>

                            <td>

                                <span
                                class="status
                                ${statusClass(
                                    b.status
                                )}">

                                ${escapeHTML(
                                    b.status
                                )}

                                </span>

                            </td>

                        </tr>

                        `
                    )
                    .join("")
                }

            </tbody>

        </table>
        `;

        const statuses = [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];

        document.getElementById(
            "statusSummary"
        ).innerHTML =

            statuses
            .map(
                status => {

                    const count =
                        bookings.filter(
                            b =>
                            b.status ===
                            status
                        ).length;

                    return `

                    <p>
                        <strong>
                            ${status}
                        </strong>

                        :
                        ${count}
                    </p>

                    `;
                }
            )
            .join("");

    }
);