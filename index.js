Vue.createApp({
    data() {
        return {
            records: [],
            error: null,
            searchTitle: "",
            searchArtist: "",
            loading: false,
            token: sessionStorage.getItem("token") || "",
            currentUser: null,
            checkingSession: true,
            loginError: ""
        };
    },

    created() {
        this.restoreLogin();
    },

    mounted() {
        // Check again if the browser restores this page from its back/forward cache.
        window.addEventListener("pageshow", this.onPageShow);
    },

    beforeUnmount() {
        window.removeEventListener("pageshow", this.onPageShow);
    },

    methods: {
        onPageShow(event) {
            if (event.persisted) this.restoreLogin();
        },

        async restoreLogin() {
            this.token = sessionStorage.getItem("token") || "";
            this.currentUser = null;
            this.records = [];
            this.loginError = "";
            this.checkingSession = true;
            if (!this.token) {
                this.logout();
                return;
            }

            try {
                const response = await axios.get(authUri + "/me", {
                    headers: this.authHeaders()
                });
                this.currentUser = response.data;
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.logout();
                } else {
                    this.loginError = "Kunne ikke kontrollere dit login. Kontrollér forbindelsen, og prøv igen.";
                }
            } finally {
                this.checkingSession = false;
            }

            // Do not request records until the backend has approved this session.
            if (this.currentUser) await this.getRecords(baseUri);
        },

        logout() {
            sessionStorage.removeItem("token");
            this.token = "";
            this.currentUser = null;
            this.records = [];
            window.location.replace("index.html");
        },

        authHeaders() {
            return { Authorization: `Bearer ${this.token}` };
        },

        async getRecords(uri) {
            if (!this.currentUser) return;
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(uri, { headers: this.authHeaders() });
                const records = response.status === 204 ? [] : response.data;
                if (!Array.isArray(records)) {
                    throw new Error("The API did not return a list of records.");
                }
                this.records = records;
            } catch (error) {
                this.records = [];
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.logout();
                    return;
                }
                this.error = error.response
                    ? `The API returned status ${error.response.status}. Check the API endpoint.`
                    : `${error.message}. Check your API URL, connection, and CORS settings.`;
            } finally {
                this.loading = false;
            }
        },

        cleanList() {
            this.records = [];
            this.error = null;
        },

        searchRecords() {
            const title = this.searchTitle.trim();
            const artist = this.searchArtist.trim();
            if (!title && !artist) {
                this.showAll();
                return;
            }
            const params = new URLSearchParams();
            if (title) params.append("title", title);
            if (artist) params.append("artist", artist);
            this.getRecords(baseUri + "?" + params.toString());
        },

        showAll() {
            this.searchTitle = "";
            this.searchArtist = "";
            this.getRecords(baseUri);
        }
    }
}).mount("#app");
