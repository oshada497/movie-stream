// TMDB API Functions
const API = {
    // Get trending movies
    async getTrending(mediaType = 'movie', timeWindow = 'week') {
        const url = `${CONFIG.TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${CONFIG.TMDB_API_KEY}`;
        const response = await fetch(url);
        return response.json();
    },

    // Get popular movies
    async getPopular(mediaType = 'movie', page = 1) {
        const url = `${CONFIG.TMDB_BASE_URL}/${mediaType}/popular?api_key=${CONFIG.TMDB_API_KEY}&page=${page}`;
        const response = await fetch(url);
        return response.json();
    },

    // Get top rated
    async getTopRated(mediaType = 'movie', page = 1) {
        const url = `${CONFIG.TMDB_BASE_URL}/${mediaType}/top_rated?api_key=${CONFIG.TMDB_API_KEY}&page=${page}`;
        const response = await fetch(url);
        return response.json();
    },

    // Search movies/TV
    async search(query, mediaType = 'movie', page = 1) {
        const url = `${CONFIG.TMDB_BASE_URL}/search/${mediaType}?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(url);
        return response.json();
    },

    // Get movie/TV details
    async getDetails(id, mediaType = 'movie') {
        const url = `${CONFIG.TMDB_BASE_URL}/${mediaType}/${id}?api_key=${CONFIG.TMDB_API_KEY}&append_to_response=credits,videos,similar`;
        const response = await fetch(url);
        return response.json();
    },

    // Get TV show seasons
    async getSeasonDetails(tvId, seasonNumber) {
        const url = `${CONFIG.TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${CONFIG.TMDB_API_KEY}`;
        const response = await fetch(url);
        return response.json();
    },

    // Get genres list
    async getGenres(mediaType = 'movie') {
        const url = `${CONFIG.TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${CONFIG.TMDB_API_KEY}`;
        const response = await fetch(url);
        return response.json();
    },

    // Discover by genre
    async discoverByGenre(genreId, mediaType = 'movie', page = 1) {
        const url = `${CONFIG.TMDB_BASE_URL}/discover/${mediaType}?api_key=${CONFIG.TMDB_API_KEY}&with_genres=${genreId}&page=${page}`;
        const response = await fetch(url);
        return response.json();
    },

    // Get image URL
    getImageUrl(path, size = 'w500') {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `${CONFIG.TMDB_IMAGE_BASE}/${size}${path}`;
    },

    // Get backdrop URL
    getBackdropUrl(path, size = 'original') {
        if (!path) return '';
        return `${CONFIG.TMDB_IMAGE_BASE}/${size}${path}`;
    },

    // Get VidSrc embed URL for movies
    getMovieEmbedUrl(tmdbId) {
        return `${CONFIG.VIDSRC_BASE_URL}/movie/${tmdbId}`;
    },

    // Get VidSrc embed URL for TV shows
    getTVEmbedUrl(tmdbId, season = 1, episode = 1) {
        return `${CONFIG.VIDSRC_BASE_URL}/tv/${tmdbId}/${season}/${episode}`;
    }
};
