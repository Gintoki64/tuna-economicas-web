// ===== Configuration =====
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEvxWj0iBW_X2M8i7PZT5SPxCyQOrKajLtGLgguIiiKxX6j0puPBRJETKP5nXcrdNDHg/exec';
const PASSWORD_HASH = 'd0831be887ef7f9c740cb3f8a721a4bc4fe5d644b9b327f9cbd442999d1c2bdc';

// ===== DOM Elements =====
const overlay = document.getElementById('password-overlay');
const main = document.getElementById('cancionero-main');
const passwordInput = document.getElementById('password-input');
const passwordBtn = document.getElementById('password-btn');
const passwordError = document.getElementById('password-error');
const searchInput = document.getElementById('search-input');
const songsContainer = document.getElementById('songs-container');

let allSongs = [];

// ===== Password =====
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function checkPassword() {
  const password = passwordInput.value.trim();
  if (!password) return;

  const hash = await hashPassword(password);
  if (hash === PASSWORD_HASH) {
    sessionStorage.setItem('cancionero_auth', 'true');
    showContent();
  } else {
    passwordError.classList.add('visible');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

function showContent() {
  overlay.style.display = 'none';
  main.style.display = 'block';
  loadSongs();
}

// Check session on load
if (sessionStorage.getItem('cancionero_auth') === 'true') {
  showContent();
} else {
  passwordInput.focus();
}

passwordBtn.addEventListener('click', checkPassword);
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkPassword();
});

// ===== Songs =====
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function loadSongs() {
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    if (!response.ok) throw new Error('Error al cargar');
    allSongs = await response.json();
    renderSongs(allSongs);
  } catch (err) {
    songsContainer.innerHTML = '<p class="songs-error">Error al cargar las canciones. Inténtalo de nuevo más tarde.</p>';
  }
}

function renderSongs(songs) {
  if (songs.length === 0) {
    songsContainer.innerHTML = '<p class="songs-empty">No se encontraron canciones.</p>';
    return;
  }

  songsContainer.innerHTML = songs.map(song => {
    const audioHTML = song.mp3
      ? `<div class="song-audio">
           <iframe src="https://drive.google.com/file/d/${song.mp3}/preview" allow="autoplay" class="audio-iframe" loading="lazy" title="Audio de ${escapeHTML(song.name)}"></iframe>
         </div>`
      : '<span class="song-no-audio">Sin audio</span>';

    const pdfIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM14 9h-1v3h1V9z"/>
    </svg>`;

    const pdfs = song.pdfs || (song.pdf ? [{ id: song.pdf, name: 'Partitura' }] : []);
    let pdfHTML = '';
    if (pdfs.length === 1) {
      pdfHTML = `<a href="https://drive.google.com/file/d/${pdfs[0].id}/preview" target="_blank" rel="noopener noreferrer" class="song-pdf">
        ${pdfIcon} Partitura
      </a>`;
    } else if (pdfs.length > 1) {
      pdfHTML = `<div class="song-pdfs-dropdown">
        <button class="song-pdfs-toggle" onclick="this.parentElement.classList.toggle('open')">
          ${pdfIcon} Partituras (${pdfs.length})
          <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        <div class="song-pdfs-list">
          ${pdfs.map(p =>
            `<a href="https://drive.google.com/file/d/${p.id}/preview" target="_blank" rel="noopener noreferrer" class="song-pdf-item">
              ${pdfIcon} ${escapeHTML(p.name)}
            </a>`
          ).join('')}
        </div>
      </div>`;
    }

    return `<div class="song-card">
      <span class="song-name">${escapeHTML(song.name)}</span>
      ${audioHTML}
      ${pdfHTML}
    </div>`;
  }).join('');
}

// ===== Close dropdowns on outside click =====
document.addEventListener('click', (e) => {
  if (!e.target.closest('.song-pdfs-dropdown')) {
    document.querySelectorAll('.song-pdfs-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

// ===== Search =====
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = allSongs.filter(song => song.name.toLowerCase().includes(query));
  renderSongs(filtered);
});
