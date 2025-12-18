let currentSelection = null;
let currentEpisodes = [];

// Handle File Import
async function handleImport(input) {
    if (input.files.length > 0) {
        try {
            await DB.importData(input.files[0]);
            alert('Data imported successfully!');
            location.reload();
        } catch (e) {
            alert('Error importing data: ' + e);
        }
    }
}

// Search TMDB
async function searchTMDB() {
    const query = document.getElementById('tmdbSearch').value;
    const type = document.getElementById('mediaType').value;
    const resultsDiv = document.getElementById('searchResults');

    if (!query) return;

    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const data = await API.search(query, type);
        resultsDiv.innerHTML = data.results.map(item => `
            <div class="search-result-card" onclick="openEditor(${JSON.stringify(item).replace(/"/g, '&quot;')}, '${type}')">
                <img src="${API.getImageUrl(item.poster_path)}" alt="${item.title || item.name}">
                <div class="search-result-info">
                    <h4>${item.title || item.name}</h4>
                    <p>${(item.release_date || item.first_air_date || '').split('-')[0]}</p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        resultsDiv.innerHTML = '<p>Error searching TMDB</p>';
    }
}

// Open Editor
function openEditor(item, type) {
    currentSelection = item;
    currentSelection.media_type = type;

    document.getElementById('editorModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = `Edit: ${item.title || item.name}`;

    if (type === 'movie') {
        document.getElementById('movieEditor').style.display = 'block';
        document.getElementById('tvEditor').style.display = 'none';

        // Load existing
        const existing = DB.getMovie(item.id);
        document.getElementById('movieUrl').value = existing ? existing.url : '';
    } else {
        document.getElementById('movieEditor').style.display = 'none';
        document.getElementById('tvEditor').style.display = 'block';

        // Load existing
        const existing = DB.getTV(item.id);
        currentEpisodes = [];
        if (existing && existing.seasons) {
            existing.seasons.forEach(s => {
                s.episodes.forEach(e => {
                    currentEpisodes.push({
                        season: s.season_number,
                        episode: e.episode_number,
                        url: e.url
                    });
                });
            });
        }
        renderEpisodes();
    }
}

function closeModal() {
    document.getElementById('editorModal').style.display = 'none';
    currentSelection = null;
    currentEpisodes = [];
}

// TV Episode Logic
function addEpisodeTolist() {
    const s = document.getElementById('seasonNum').value;
    const e = document.getElementById('episodeNum').value;
    const u = document.getElementById('episodeUrl').value;

    if (s && e && u) {
        currentEpisodes.push({ season: parseInt(s), episode: parseInt(e), url: u });
        renderEpisodes();

        // Clear inputs
        document.getElementById('episodeNum').value = '';
        document.getElementById('episodeUrl').value = '';
    }
}

function removeEpisode(index) {
    currentEpisodes.splice(index, 1);
    renderEpisodes();
}

function renderEpisodes() {
    const container = document.getElementById('addedEpisodes');
    container.innerHTML = currentEpisodes.sort((a, b) => (a.season - b.season) || (a.episode - b.episode))
        .map((ep, idx) => `
        <div class="episode-item">
            <span>S${ep.season} E${ep.episode}</span>
            <input type="text" value="${ep.url}" readonly style="flex:1; background: #222;">
            <button onclick="removeEpisode(${idx})" class="btn btn-red" style="padding: 0.5rem;">x</button>
        </div>
    `).join('');
}

// Save
function saveContent() {
    if (!currentSelection) return;

    if (currentSelection.media_type === 'movie') {
        const url = document.getElementById('movieUrl').value;
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        DB.addMovie({
            tmdbId: currentSelection.id,
            url: url
        });
    } else {
        if (currentEpisodes.length === 0) {
            alert('Please add at least one episode');
            return;
        }

        // Transform flat list to season structure
        const seasons = [];
        currentEpisodes.forEach(ep => {
            let season = seasons.find(s => s.season_number === ep.season);
            if (!season) {
                season = { season_number: ep.season, episodes: [] };
                seasons.push(season);
            }
            season.episodes.push({ episode_number: ep.episode, url: ep.url });
        });

        DB.addTV({
            tmdbId: currentSelection.id,
            seasons: seasons
        });
    }

    alert('Saved successfully!');
    closeModal();
}
