import { projects, imagePath } from '../data.js';

let currentIndex = 0;
let slides = [];
let counterEl = null;
let captionEl = null;
let projectData = null;

export function renderStory(slug) {
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return `<div class="text-page"><h1>Project not found</h1></div>`;
  }

  const total = String(project.images.length).padStart(2, '0');

  const slidesHTML = project.images
    .map((img, i) => {
      const src = imagePath(project.slug, img.file);
      const webp = src.replace(/\.[^.]+$/, '.webp');
      // Load first 2 slides eagerly; defer the rest
      const eager = i < 2;
      return `
    <div class="story-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <picture>
        <source ${eager ? `srcset="${webp}"` : `data-srcset="${webp}"`} type="image/webp">
        <img ${eager ? `src="${src}"` : `data-src="${src}"`} alt="${img.caption || ''}">
      </picture>
    </div>`;
    })
    .join('');

  return `
    <div class="story-viewer">
      <div class="story-header">
        <div class="breadcrumb">
          <a href="#/stories">Stories</a>
          <span class="sep">/</span>
          <span>${project.title}</span>
        </div>
      </div>
      <div class="story-stage">
        <button class="story-arrow story-arrow--prev" aria-label="Previous">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="story-images">
          ${slidesHTML}
        </div>
        <button class="story-arrow story-arrow--next" aria-label="Next">
          <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      </div>
      <div class="story-footer">
        <div class="story-caption"></div>
        <div class="story-counter">
          <span class="story-counter-current">01</span>&thinsp;/&thinsp;<span class="story-counter-total">${total}</span>
        </div>
      </div>
    </div>
    <div class="lightbox" id="story-lightbox" aria-hidden="true">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <div class="lightbox-img-wrap">
        <img class="lightbox-img" src="" alt="">
      </div>
    </div>
  `;
}

export function initStory() {
  currentIndex = 0;
  slides = document.querySelectorAll('.story-slide');
  counterEl = document.querySelector('.story-counter-current');
  captionEl = document.querySelector('.story-caption');

  const slug = window.location.hash.split('/').pop();
  projectData = projects.find((p) => p.slug === slug) || null;

  if (!slides.length) return;

  document.querySelector('.story-arrow--prev')?.addEventListener('click', prev);
  document.querySelector('.story-arrow--next')?.addEventListener('click', next);

  document.addEventListener('keydown', onKey);

  // Touch swipe — only fire when horizontal movement dominates
  const stage = document.querySelector('.story-stage');
  if (stage) {
    let touchStartX = 0;
    let touchStartY = 0;
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        dx > 0 ? next() : prev();
      }
    });
  }

  // Lightbox — open on click of the image area
  const imagesEl = document.querySelector('.story-images');
  imagesEl?.addEventListener('click', openLightbox);

  const lightbox = document.getElementById('story-lightbox');
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-img-wrap') || e.target.classList.contains('lightbox-img')) {
      closeLightbox();
    }
  });

  preloadAhead();
  updateCaption();
}

export function destroyStory() {
  document.removeEventListener('keydown', onKey);
  closeLightbox();
}

function onKey(e) {
  if (document.getElementById('story-lightbox')?.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    return;
  }
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
}

function goTo(index) {
  if (index === currentIndex || !slides.length) return;

  slides[currentIndex].classList.remove('active');
  currentIndex = index;

  const slideEl = slides[currentIndex];
  loadSlide(slideEl);
  slideEl.classList.add('active');

  if (counterEl) {
    counterEl.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  preloadAhead();
  updateCaption();
}

function next() {
  goTo((currentIndex + 1) % slides.length);
}

function prev() {
  goTo((currentIndex - 1 + slides.length) % slides.length);
}

function loadSlide(slideEl) {
  const img = slideEl.querySelector('img');
  const source = slideEl.querySelector('source[data-srcset]');
  if (img?.dataset.src) {
    img.src = img.dataset.src;
    delete img.dataset.src;
  }
  if (source?.dataset.srcset) {
    source.srcset = source.dataset.srcset;
    delete source.dataset.srcset;
  }
}

function preloadAhead() {
  for (let i = 1; i <= 2; i++) {
    const idx = (currentIndex + i) % slides.length;
    loadSlide(slides[idx]);
  }
}

function openLightbox() {
  const activeSlide = slides[currentIndex];
  const img = activeSlide?.querySelector('img');
  if (!img?.src) return;

  const lightbox = document.getElementById('story-lightbox');
  const lbImg = lightbox?.querySelector('.lightbox-img');
  if (!lightbox || !lbImg) return;

  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('story-lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateCaption() {
  if (!captionEl || !projectData) return;
  const img = projectData.images[currentIndex];
  captionEl.textContent = img?.caption || '';
}
