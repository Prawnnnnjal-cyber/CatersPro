document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    const email =
                        document
                        .getElementById(
                            "loginEmail"
                        )
                        .value
                        .trim()
                        .toLowerCase();

                    const password =
                        document
                        .getElementById(
                            "loginPassword"
                        )
                        .value;

                    const users =
                        getUsers();

                    const user =
                        users.find(
                            function (u) {

                                return (
                                    u.email
                                    .toLowerCase()
                                    === email
                                    &&
                                    u.password
                                    === password
                                );

                            }
                        );

                    if (!user) {

                        const error =
                            document
                            .getElementById(
                                "loginError"
                            );

                        error.textContent =
                            "Invalid email or password.";

                        error.classList.remove(
                            "hidden"
                        );

                        return;
                    }

                    setCurrentUser({

                        id: user.id,

                        name: user.name,

                        email: user.email,

                        role: user.role

                    });

                    window.location.href =
                        "dashboard.html";
                }
            );
        }

        const registerForm =
            document.getElementById(
                "registerForm"
            );

        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    const name =
                        document
                        .getElementById(
                            "regName"
                        )
                        .value
                        .trim();

                    const email =
                        document
                        .getElementById(
                            "regEmail"
                        )
                        .value
                        .trim()
                        .toLowerCase();

                    const phone =
                        document
                        .getElementById(
                            "regPhone"
                        )
                        .value
                        .trim();

                    const password =
                        document
                        .getElementById(
                            "regPassword"
                        )
                        .value;

                    const confirm =
                        document
                        .getElementById(
                            "regConfirm"
                        )
                        .value;

                    const message =
                        document
                        .getElementById(
                            "registerMessage"
                        );

                    if (password !== confirm) {

                        message.textContent =
                            "Passwords do not match.";

                        message.className =
                            "form-message error";

                        return;
                    }

                    if (!/^\d{10}$/.test(phone)) {

                        message.textContent =
                            "Phone number must contain 10 digits.";

                        message.className =
                            "form-message error";

                        return;
                    }

                    const users =
                        getUsers();

                    if (
                        users.some(
                            u =>
                            u.email
                            .toLowerCase()
                            === email
                        )
                    ) {

                        message.textContent =
                            "Email already registered.";

                        message.className =
                            "form-message error";

                        return;
                    }

                    users.push({

                        id: Date.now(),

                        name: name,

                        email: email,

                        phone: phone,

                        password: password,

                        role: "CUSTOMER"

                    });

                    setData(
                        DB.users,
                        users
                    );

                    message.textContent =
                        "Account created successfully.";

                    message.className =
                        "form-message success";

                    setTimeout(
                        function () {

                            window.location.href =
                                "login.html";

                        },
                        1000
                    );

                }
            );
        }

    }
);