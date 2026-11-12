const customerPageUser = requireAuth();

if (customerPageUser) {

    document.getElementById("app").innerHTML =
        layout("Customer Management", "customers") +
        `

        <div class="toolbar">

            <input
                type="text"
                id="customerSearch"
                placeholder="Search customer..."
                oninput="renderCustomers()"
            >

        </div>


        <div class="panel">

            <div class="panel-header">

                <h3>Customers</h3>

            </div>


            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Email</th>

                            <th>Phone</th>

                            <th>Total Bookings</th>

                            <th>Total Spent</th>

                        </tr>

                    </thead>


                    <tbody
                        id="customerTable"
                    ></tbody>

                </table>

            </div>

        </div>

        ` +
        closeLayout();


    renderCustomers();
}


// ==========================================
// RENDER CUSTOMERS
// ==========================================

function renderCustomers() {

    let customers =
        getUsers().filter(
            user =>
                user.role === "CUSTOMER"
        );


    const search =
        document.getElementById(
            "customerSearch"
        )
        ?.value
        .toLowerCase()
        .trim() || "";


    // SEARCH

    customers =
        customers.filter(
            customer =>

                customer.name
                    .toLowerCase()
                    .includes(search)

                ||

                customer.email
                    .toLowerCase()
                    .includes(search)

                ||

                customer.phone
                    .includes(search)
        );


    // NORMAL CUSTOMER ONLY SEES SELF

    if (
        customerPageUser.role !== "ADMIN"
    ) {

        customers =
            customers.filter(
                customer =>
                    customer.email.toLowerCase() ===
                    customerPageUser.email.toLowerCase()
            );

    }


    const bookings =
        getBookings();


    const table =
        document.getElementById(
            "customerTable"
        );


    if (customers.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="5"
                    style="text-align:center;"
                >
                    No customers found
                </td>

            </tr>
        `;

        return;
    }


    table.innerHTML =
        customers.map(customer => {

            const customerBookings =
                bookings.filter(
                    booking =>
                        booking.email.toLowerCase() ===
                        customer.email.toLowerCase()
                );


            const totalSpent =
                customerBookings.reduce(
                    (total, booking) => {

                        if (
                            booking.status ===
                            "Cancelled"
                        ) {
                            return total;
                        }

                        return (
                            total +
                            Number(
                                booking.amount || 0
                            )
                        );

                    },
                    0
                );


            return `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(
                                customer.name
                            )}
                        </strong>

                    </td>


                    <td>
                        ${escapeHTML(
                            customer.email
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            customer.phone
                        )}
                    </td>


                    <td>
                        ${customerBookings.length}
                    </td>


                    <td>
                        ${money(
                            totalSpent
                        )}
                    </td>

                </tr>

            `;

        }).join("");

}