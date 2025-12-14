// MovieStream - Main Application Logic

// Global state
let heroMovie = null;
let genres = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadGenres();
    await loadHero();
    await loadAllSections();
    setupEventListeners();
});

// Load genres for dropdown
async function loadGenres() {
    try {
        const data = await API.getGenres('movie');
        genres = data.genres;

        const dropdown = document.getElementById('genreDropdown');
        if (dropdown) {
            dropdown.innerHTML = genres.map(genre =>
                `<div class="dropdown-item" onclick="filterByGenre(${genre.id}, '${genre.name}')">${genre.name}</div>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

// Load hero section with featured movie
async function loadHero() {
    try {
        const data = await API.getTrending('movie', 'week');
        const movies = data.results.filter(m => m.backdrop_path && m.overview);

        if (movies.length > 0) {
            // Pick a random featured movie from top 5
            heroMovie = movies[Math.floor(Math.random() * Math.min(5, movies.length))];
            updateHero(heroMovie);
        }
    } catch (error) {
        console.error('Error loading hero:', error);
    }
}

// Update hero section
function updateHero(movie) {
    document.getElementById('heroImage').src = API.getBackdropUrl(movie.backdrop_path);
    document.getElementById('heroTitle').textContent = movie.title || movie.name;
    document.getElementById('heroDescription').textContent = movie.overview;
    document.getElementById('heroRating').querySelector('span:last-child').textContent = movie.vote_average.toFixed(1);
    document.getElementById('heroYear').textContent = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';

    // Load genres
    const genreNames = movie.genre_ids.map(id => {
        const genre = genres.find(g => g.id === id);
        return genre ? `<span class="genre-tag">${genre.name}</span>` : '';
    }).join('');
    document.getElementById('heroGenres').innerHTML = genreNames;

    // Update buttons
    const mediaType = movie.title ? 'movie' : 'tv';
    document.getElementById('heroWatchBtn').onclick = () => {
        window.location.href = `${mediaType}.html?id=${movie.id}`;
    };
    document.getElementById('heroInfoBtn').onclick = () => {
        window.location.href = `${mediaType}.html?id=${movie.id}`;
    };
}

// Load all content sections
async function loadAllSections() {
    try {
        // Load trending
        const trending = await API.getTrending('all', 'week');
        displayCards('trendingGrid', trending.results.slice(0, 8));

        // Load popular movies
        const movies = await API.getPopular('movie');
        displayCards('moviesGrid', movies.results.slice(0, 8), 'movie');

        // Load popular TV shows
        const tvShows = await API.getPopular('tv');
        displayCards('tvGrid', tvShows.results.slice(0, 8), 'tv');

        // Load top rated
        const topRated = await API.getTopRated('movie');
        displayCards('topRatedGrid', topRated.results.slice(0, 8), 'movie');

    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

// Display movie/TV cards
function displayCards(containerId, items, forceMediaType = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No content available.</p>';
        return;
    }

    container.innerHTML = items.map(item => {
        const mediaType = forceMediaType || item.media_type || 'movie';
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date;
        const link = `${mediaType}.html?id=${item.id}`;

        return `
            <a href="${link}" class="card">
                <div class="card-poster">
                    <img src="${API.getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
                    <div class="card-overlay">
                        <div class="play-button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </div>
                    </div>
                    <div class="card-rating">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${item.vote_average?.toFixed(1) || 'N/A'}
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${title}</h3>
                    <p class="card-meta">${date?.split('-')[0] || 'N/A'}</p>
                </div>
            </a>
        `;
    }).join('');
}

// Filter by genre
async function filterByGenre(genreId, genreName) {
    try {
        const data = await API.discoverByGenre(genreId, 'movie');
        document.querySelector('#trending .section-title').textContent = genreName;
        displayCards('trendingGrid', data.results.slice(0, 16), 'movie');

        // Scroll to section
        document.getElementById('trending').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error filtering by genre:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Dropdown toggle for mobile
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownToggle.parentElement.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
        });
    }
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}
