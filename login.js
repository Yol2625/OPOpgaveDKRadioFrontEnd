Vue.createApp({
    data() {
        return {
            loginUsername: "",
            loginPassword: "",
            loginError: "",
            loggingIn: false,
            checkingSession: false
        };
    },

    created() {
        this.restoreLogin();
    },

    methods: {
        async login() {
            if (this.loggingIn || this.checkingSession) return;
            this.loginError = "";
            this.loggingIn = true;

            try {
                const response = await axios.post(authUri + "/login", {
                    username: this.loginUsername.trim(),
                    password: this.loginPassword
                });

                const token = response.data.token;
                if (typeof token !== "string" || !token) {
                    throw new Error("Login response did not contain a token.");
                }

                // Check access before saving the token and opening the collection.
                await axios.get(authUri + "/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                sessionStorage.setItem("token", token);
                window.location.replace("records.html");
            } catch (error) {
                sessionStorage.removeItem("token");
                if (error.response?.status === 401) {
                    this.loginError = "Login blev afvist. Kontrollér brugernavn og adgangskode.";
                } else if (error.response?.status === 403) {
                    this.loginError = "Din bruger har ikke adgang til musikarkivet.";
                } else {
                    this.loginError = "Kunne ikke logge ind. Kontrollér forbindelsen, og prøv igen.";
                }
            } finally {
                this.loginPassword = "";
                this.loggingIn = false;
            }
        },

        async restoreLogin() {
            const token = sessionStorage.getItem("token");
            if (!token) return;
            this.checkingSession = true;

            try {
                await axios.get(authUri + "/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                window.location.replace("records.html");
            } catch (error) {
                sessionStorage.removeItem("token");
                this.loginError = error.response?.status === 403
                    ? "Din bruger har ikke adgang til musikarkivet."
                    : error.response?.status === 401
                        ? "Din session er udløbet. Log ind igen."
                        : "Kunne ikke kontrollere dit login. Prøv at logge ind igen.";
            } finally {
                this.checkingSession = false;
            }
        }
    }
}).mount("#login-app");
