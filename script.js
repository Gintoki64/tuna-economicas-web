document.documentElement.classList.add('js');

// ===== WhatsApp con mensaje predefinido =====
document.querySelectorAll('a[data-wa]').forEach(link => {
  link.href = `https://wa.me/34680913100?text=${encodeURIComponent(link.dataset.wa)}`;
});

// ===== Navbar al hacer scroll + barra móvil =====
const navbar = document.getElementById('navbar');
const mobileBar = document.getElementById('mobile-bar');
const hero = document.getElementById('inicio');
const contacto = document.getElementById('contacto');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  const pastHero = window.scrollY > hero.offsetHeight * 0.6;
  const contactRect = contacto.getBoundingClientRect();
  const atContact = contactRect.top < window.innerHeight && contactRect.bottom > 0;
  mobileBar.classList.toggle('visible', pastHero && !atContact);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
document.body.classList.add('has-bar');

// ===== Menú hamburguesa =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

function setMenu(open) {
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navLinks.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  navbar.classList.toggle('scrolled', open || window.scrollY > 40);
}

hamburger.addEventListener('click', () => {
  setMenu(hamburger.getAttribute('aria-expanded') !== 'true');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    setMenu(false);
    hamburger.focus();
  }
});

// ===== Enlace activo según la sección visible =====
const navAnchors = [...navLinks.querySelectorAll('a[href^="#"]:not(.btn)')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });

navAnchors.forEach(a => {
  const section = document.querySelector(a.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

// ===== Aparición al hacer scroll =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Vídeos de YouTube: se cargan al pulsar =====
document.querySelectorAll('.video-thumb[data-yt]').forEach(btn => {
  btn.addEventListener('click', () => {
    const frame = document.createElement('div');
    frame.className = 'video-frame';
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0"
      title="Vídeo de la Tuna de Económicas" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    btn.replaceWith(frame);
  });
});

// ===== Galería con visor =====
const lightbox = document.getElementById('lightbox');
const lbStage = document.getElementById('lb-stage');
const lbCounter = document.getElementById('lb-counter');
const galleryItems = [...document.querySelectorAll('#gallery .gallery-item')];
let current = 0;
let lastFocus = null;

function showItem(index) {
  current = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[current];
  if (item.dataset.video) {
    lbStage.innerHTML = `<video src="${item.dataset.video}" controls autoplay playsinline></video>`;
  } else {
    const alt = item.querySelector('img').alt;
    lbStage.innerHTML = `<img src="${item.dataset.full}" alt="${alt}">`;
  }
  lbCounter.textContent = `${current + 1} / ${galleryItems.length}`;
}

function openLightbox(index) {
  lastFocus = document.activeElement;
  showItem(index);
  lightbox.showModal();
  document.body.classList.add('menu-open');
}

function closeLightbox() {
  lightbox.close();
}

lightbox.addEventListener('close', () => {
  lbStage.innerHTML = '';
  document.body.classList.remove('menu-open');
  if (lastFocus) lastFocus.focus();
});

galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click', () => showItem(current - 1));
lightbox.querySelector('.lb-next').addEventListener('click', () => showItem(current + 1));

lightbox.addEventListener('click', e => {
  if (e.target === lightbox || e.target === lbStage) closeLightbox();
});

lightbox.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showItem(current - 1);
  if (e.key === 'ArrowRight') showItem(current + 1);
});

// Deslizar con el dedo
let touchX = null;
lbStage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lbStage.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showItem(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ===== Año dinámico =====
document.getElementById('year').textContent = new Date().getFullYear();
