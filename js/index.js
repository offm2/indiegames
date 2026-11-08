(async () => {
  const container = document.getElementById('featured-games');
  try {
    const games = await loadAllGames();
    renderGames(games.slice(0, 3), container);
  } catch (err) {
    showError(container, '❌ ' + err.message);
  }
})();
