// CHANGE THIS URL to your own running ASP.NET Core API endpoint.
// Example: https://localhost:7123/api/musicrecords
const baseUri = "https://localhost:PORT/api/musicrecords";

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

    created() {
        // Automatically runs when Vue creates the component.
        console.log("created method called");
        this.getRecords(baseUri);
    },

    methods: {
        // Reusable GET request, based on the teacher's getPosts(uri).
        async getRecords(uri) {
            this.loading = true;
            try {
                const response = await axios.get(uri);
                this.records = response.data;
                this.error = null;
            } catch (ex) {
                this.records = [];
                this.error = ex.message;
            } finally {
                this.loading = false;
            }
        },

        cleanList() {
            this.records = [];
            this.error = null;
        },

        // Similar to the teacher's getByUserId(uid), but searches music records.
        // The API must support optional ?title=... and ?artist=... parameters.
        searchRecords() {
            const title = this.searchTitle.trim();
            const artist = this.searchArtist.trim();

            if (title === "" && artist === "") {
                this.error = "Enter a title or artist before searching.";
                this.records = [];
                return;
            }

            const params = new URLSearchParams();
            if (title !== "") params.append("title", title);
            if (artist !== "") params.append("artist", artist);

            const uri = baseUri + "?" + params.toString();
            console.log("searchRecords: " + uri);
            this.getRecords(uri);
        },

        showAll() {
            this.searchTitle = "";
            this.searchArtist = "";
            this.getRecords(baseUri);
        }
    }
}).mount("#app");
