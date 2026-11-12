'use strict';
(() => {
  const cards = Array.from(document.querySelectorAll('.memory-card'));
  const track = document.getElementById('gallery-track');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const counter = document.getElementById('gallery-counter');
  const dialog = document.getElementById('lightbox');
  const fullImage = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  const photoCount = document.getElementById('lightbox-count');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activePhoto = 0;
  let previousFocus = null;
  let touchStart = null;

  const photos = cards.map(card => ({src: card.querySelector('img').getAttribute('src'), alt: card.querySelector('img').alt, caption: card.querySelector('i').textContent}));
  const showPhoto = index => {
    activePhoto = (index + photos.length) % photos.length;
    const photo = photos[activePhoto];
    fullImage.src = photo.src;
    fullImage.alt = photo.alt;
    caption.textContent = photo.caption;
    photoCount.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${photos.length}`;
  };
  document.querySelectorAll('[data-photo]').forEach(button => {
    button.addEventListener('click', () => {
      previousFocus = button;
      showPhoto(Number(button.dataset.photo));
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  document.getElementById('lightbox-close').addEventListener('click', () => dialog.close());
  document.getElementById('lightbox-prev').addEventListener('click', () => showPhoto(activePhoto - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => showPhoto(activePhoto + 1));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    previousFocus?.focus({preventScroll: true});
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList.contains('lightbox-shell')) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(activePhoto - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(activePhoto + 1); }
  });
  fullImage.addEventListener('touchstart', event => {touchStart = event.changedTouches[0].clientX;}, {passive: true});
  fullImage.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 50) showPhoto(activePhoto + (delta < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});

  const updateGallery = () => {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const index = Math.min(photos.length - 1, Math.max(0, Math.round(track.scrollLeft / step)));
    counter.textContent = `${String(index + 1).padStart(2, '0')} — ${photos.length}`;
    galleryPrev.disabled = track.scrollLeft <= 2;
    galleryNext.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 3;
  };
  const moveGallery = direction => {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    track.scrollBy({left: direction * step, behavior: reduceMotion.matches ? 'instant' : 'smooth'});
  };
  galleryPrev.addEventListener('click', () => moveGallery(-1));
  galleryNext.addEventListener('click', () => moveGallery(1));
  track.addEventListener('scroll', updateGallery, {passive: true});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1);}
  });
  window.addEventListener('resize', updateGallery);
  updateGallery();

  const surprise = document.getElementById('little-surprise');
  surprise.addEventListener('click', () => {
    document.getElementById('surprise-message').hidden = false;
    surprise.textContent = 'Siempre tú y yo ♡';
    if (reduceMotion.matches || document.querySelector('.heart-confetti')) return;
    for (let i = 0; i < 18; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-confetti';
      heart.textContent = '♡';
      heart.setAttribute('aria-hidden', 'true');
      heart.style.left = `${4 + Math.random() * 90}%`;
      heart.style.fontSize = `${17 + Math.random() * 22}px`;
      heart.style.setProperty('--drift', `${Math.round(Math.random() * 160 - 80)}px`);
      heart.style.animationDelay = `${Math.random() * .5}s`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 3500);
    }
  });
})();
