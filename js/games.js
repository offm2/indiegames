let allGames = [];

function applyFilters() {
  const query      = document.getElementById('search').value.toLowerCase().trim();
  const genre      = document.getElementById('genre-filter').value;
  const mobileOnly = document.getElementById('mobile-only').checked;

  const filtered = allGames.filter(g => {
    const matchesQuery =
      !query ||
      g.title.toLowerCase().includes(query) ||
      (g.description || '').toLowerCase().includes(query) ||
      (g.tags || []).some(t => t.toLowerCase().includes(query));
    const matchesGenre  = !genre || g.genre === genre;
    const matchesMobile = !mobileOnly || g.mobileFriendly === true;
    return matchesQuery && matchesGenre && matchesMobile;
  });

  renderGames(filtered, document.getElementById('all-games'));
}

(async () => {
  const container = document.getElementById('all-games');
  try {
    allGames = await loadAllGames();

    const genres = [...new Set(allGames.map(g => g.genre).filter(Boolean))].sort();
    const select = document.getElementById('genre-filter');
    genres.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      select.appendChild(opt);
    });

    renderGames(allGames, container);

    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('genre-filter').addEventListener('change', applyFilters);
    document.getElementById('mobile-only').addEventListener('change', applyFilters);
  } catch (err) {
    showError(container, '❌ ' + err.message);
  }
})();
