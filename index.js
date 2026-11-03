// Replace 7123 with the HTTPS port used by your ASP.NET Core API.
// Example endpoint: https://localhost:7123/api/musicrecords
const baseUri = "https://localhost:7123/api/musicrecords";

Vue.createApp({
    data() {
        return {
            records: [],
            error: null,
            searchTitle: "",
            searchArtist: "",
            loading: false
        };
    },

    // Like your teacher's example: load data when Vue is created.
    created() {
        this.getRecords(baseUri);
    },

    methods: {
        // Reusable GET request (same idea as your teacher's getPosts(uri)).
        async getRecords(uri) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(uri);
                if (!Array.isArray(response.data)) {
                    throw new Error("The API did not return a list of records.");
                }
                this.records = response.data;
            } catch (ex) {
                this.records = [];
                this.error = ex.response
                    ? `The API returned status ${ex.response.status}. Check the API endpoint.`
                    : `${ex.message}. Check your API URL, connection, and CORS settings.`;
            } finally {
                this.loading = false;
            }
        },

        // Same functionality as your teacher's cleanList().
        cleanList() {
            this.records = [];
            this.error = null;
        },

        // Like getByUserId(), but filtering by title and/or artist.
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
