const MANIFEST_URL = 'data/games.json';
const GAMES_DIR    = 'data/games/';

/* ---------- Loading ---------- */
async function loadManifest() {
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`Manifest not found (${res.status})`);
  return res.json();
}

async function loadGame(filename) {
  const res = await fetch(GAMES_DIR + filename);
  if (!res.ok) throw new Error(`Failed to load "${filename}"`);
  return res.json();
}

async function loadAllGames() {
  const files = await loadManifest();
  return Promise.all(files.map(loadGame));
}

/* ---------- Card ---------- */
function createGameCard(game) {
  const card = document.createElement('article');
  card.className = 'game-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Play ${game.title}`);

  // Thumbnail
  const thumb = document.createElement('div');
  thumb.className = 'game-thumb';
  if (game.thumbnail) {
    thumb.style.backgroundImage = `url('${game.thumbnail}')`;
    thumb.style.backgroundSize = 'cover';
    thumb.style.backgroundPosition = 'center';
  } else {
    thumb.style.background = game.color || 'linear-gradient(135deg,#6366f1,#8b5cf6)';
    thumb.textContent = game.icon || '🎮';
  }

  if (game.mobileFriendly) {
    const badge = document.createElement('span');
    badge.className = 'badge-mobile';
    badge.textContent = '📱 Mobile';
    thumb.appendChild(badge);
  }

  // Body
  const body = document.createElement('div');
  body.className = 'game-body';

  const title = document.createElement('h3');
  title.textContent = game.title;

  const desc = document.createElement('p');
  desc.textContent = game.description || '';

  const tags = document.createElement('div');
  tags.className = 'tags';
  (game.tags || []).forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tags.appendChild(span);
  });

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = '▶ Play';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    openGameModal(game);
  });

  body.append(title, desc, tags, btn);
  card.append(thumb, body);

  card.addEventListener('click', () => openGameModal(game));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGameModal(game);
    }
  });

  return card;
}

function renderGames(games, container) {
  container.innerHTML = '';
  if (!games.length) {
    container.innerHTML = '<p class="loading">No games found.</p>';
    return;
  }
  games.forEach(g => container.appendChild(createGameCard(g)));
}

function showError(container, msg) {
  container.innerHTML = `<p class="error">${msg}</p>`;
}

/* ---------- Modal ---------- */
function ensureModal() {
  if (document.getElementById('game-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'game-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header class="modal-header">
        <h2 id="modal-title"></h2>
        <div class="modal-actions">
          <a id="modal-external" class="btn btn-ghost" href="#" target="_blank" rel="noopener">
            Open on itch.io ↗
          </a>
          <button type="button" class="btn-close" aria-label="Close" data-close>✕</button>
        </div>
      </header>
      <div id="modal-body" class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('[data-close]').forEach(el =>
    el.addEventListener('click', closeGameModal)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGameModal();
  });
}

function openGameModal(game) {
  ensureModal();

  const modal   = document.getElementById('game-modal');
  const body    = document.getElementById('modal-body');
  const titleEl = document.getElementById('modal-title');
  const ext     = document.getElementById('modal-external');

  titleEl.textContent = game.title;

  if (game.itchPageUrl) {
    ext.href = game.itchPageUrl;
    ext.style.display = '';
  } else {
    ext.style.display = 'none';
  }

  body.style.aspectRatio = game.aspectRatio || '16 / 9';
  body.innerHTML = '';

  if (game.itchEmbedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = game.itchEmbedUrl;
    iframe.className = 'game-iframe';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('loading', 'eager');
    iframe.title = game.title;
    body.appendChild(iframe);
  } else {
    body.innerHTML = `<p class="error" style="padding:2rem">This game has no embed URL configured yet.</p>`;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGameModal() {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  document.getElementById('modal-body').innerHTML = '';
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
