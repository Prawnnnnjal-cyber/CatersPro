const reportUser = requireAuth();

if (reportUser) {

    document.getElementById("app").innerHTML =
        layout("Reports & Analytics", "reports") +
        `
        <div class="toolbar">
            <button
                class="btn btn-primary"
                onclick="window.print()">
                🖨️ Print Report
            </button>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <span>Total Bookings</span>
                <strong id="reportBookings">0</strong>
            </div>

            <div class="stat-card">
                <span>Confirmed</span>
                <strong id="reportConfirmed">0</strong>
            </div>

            <div class="stat-card">
                <span>Completed</span>
                <strong id="reportCompleted">0</strong>
            </div>

            <div class="stat-card">
                <span>Total Revenue</span>
                <strong id="reportRevenue">₹0</strong>
            </div>

        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Booking Status Report</h3>
            </div>

            <div id="statusReport"></div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>Service Revenue Report</h3>
            </div>

            <div class="table-wrap">
                <table>

                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Bookings</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>

                    <tbody id="serviceReport"></tbody>

                </table>
            </div>
        </div>
        ` +
        closeLayout();

    renderReports();
}

function renderReports() {

    let bookings = getBookings();

    if (reportUser.role !== "ADMIN") {

        bookings =
            bookings.filter(
                b => b.email.toLowerCase() ===
                reportUser.email.toLowerCase()
            );
    }

    const total =
        bookings.length;

    const confirmed =
        bookings.filter(
            b => b.status === "Confirmed"
        ).length;

    const completed =
        bookings.filter(
            b => b.status === "Completed"
        ).length;

    const revenue =
        bookings
            .filter(
                b =>
                    b.status !== "Cancelled"
            )
            .reduce(
                (sum, b) =>
                    sum + Number(b.amount || 0),
                0
            );

    document.getElementById("reportBookings")
        .innerText = total;

    document.getElementById("reportConfirmed")
        .innerText = confirmed;

    document.getElementById("reportCompleted")
        .innerText = completed;

    document.getElementById("reportRevenue")
        .innerText = money(revenue);

    renderStatusReport(bookings);

    renderServiceReport(bookings);
}

function renderStatusReport(bookings) {

    const statuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Completed",
        "Cancelled"
    ];

    const container =
        document.getElementById("statusReport");

    container.innerHTML = statuses.map(status => {

        const count =
            bookings.filter(
                b => b.status === status
            ).length;

        const percentage =
            bookings.length
                ? Math.round(
                    (count / bookings.length) * 100
                )
                : 0;

        return `
            <div style="margin:18px 0;">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:6px;
                ">
                    <strong>${status}</strong>
                    <span>${count}</span>
                </div>

                <div style="
                    background:#e9edf1;
                    height:10px;
                    border-radius:10px;
                    overflow:hidden;
                ">
                    <div style="
                        width:${percentage}%;
                        height:100%;
                        background:#f57e12;
                    "></div>
                </div>

            </div>
        `;

    }).join("");
}

function renderServiceReport(bookings) {

    const data = {};

    bookings.forEach(booking => {

        if (!data[booking.service]) {

            data[booking.service] = {
                count: 0,
                revenue: 0
            };
        }

        data[booking.service].count++;

        if (booking.status !== "Cancelled") {
            data[booking.service].revenue +=
                Number(booking.amount || 0);
        }
    });

    const table =
        document.getElementById("serviceReport");

    const entries =
        Object.entries(data);

    if (!entries.length) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    No data available
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = entries.map(
        ([service, value]) => `
            <tr>

                <td>
                    ${escapeHTML(service)}
                </td>

                <td>
                    ${value.count}
                </td>

                <td>
                    ${money(value.revenue)}
                </td>

            </tr>
        `
    ).join("");
}