import { projects, imagePath } from '../data.js';

let currentIndex = 0;
let autoTimer = null;
let slides = [];
let progressBar = null;
let counterEl = null;
let labelLink = null;
let storyLink = null;

const allSlides = [];

export function renderHome() {
  allSlides.length = 0;

  projects.forEach((project) => {
    project.images.forEach((img) => {
      allSlides.push({
        src: imagePath(project.slug, img.file),
        project,
      });
    });
  });

  const slidesHTML = allSlides
    .map(
      (s, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <img ${i === 0 ? `src="${s.src}"` : ''} data-src="${s.src}" alt="">
    </div>`
    )
    .join('');

  const first = allSlides[0]?.project;
  const total = String(allSlides.length).padStart(2, '0');

  return `
    <div class="hero-slideshow">
      <div class="hero-loader"></div>
      <div class="slides-container">${slidesHTML}</div>
      <a class="slide-link" href="#/stories/${first?.slug || ''}" aria-label="View story"></a>
      <button class="slide-arrow slide-arrow--prev" aria-label="Previous">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="slide-arrow slide-arrow--next" aria-label="Next">
        <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
      <div class="slide-progress"></div>
      <div class="slide-counter">
        <span class="counter-current">01</span>&thinsp;/&thinsp;<span class="counter-total">${total}</span>
      </div>
      <div class="slide-label">
        <a href="#/stories/${first?.slug || ''}">
          <span>${first?.category || ''}</span>
          <span class="label-sep">/</span>
          <span>${first?.title || ''}</span>
        </a>
      </div>
    </div>
  `;
}

export function initHome() {
  currentIndex = 0;
  slides = document.querySelectorAll('.slide');
  progressBar = document.querySelector('.slide-progress');
  counterEl = document.querySelector('.counter-current');
  labelLink = document.querySelector('.slide-label a');
  storyLink = document.querySelector('.slide-link');

  if (!slides.length) return;

  const firstImg = slides[0].querySelector('img');
  const loader = document.querySelector('.hero-loader');

  function reveal() {
    loader?.classList.add('loaded');
    startProgress();
    startAuto();
    preloadAhead();
  }

  if (firstImg.complete && firstImg.naturalWidth) {
    reveal();
  } else {
    firstImg.addEventListener('load', reveal, { once: true });
    setTimeout(reveal, 4000);
  }

  // Arrow buttons
  document.querySelector('.slide-arrow--prev')?.addEventListener('click', prev);
  document.querySelector('.slide-arrow--next')?.addEventListener('click', next);

  // Keyboard
  document.addEventListener('keydown', onKey);
}

export function destroyHome() {
  clearInterval(autoTimer);
  autoTimer = null;
  document.removeEventListener('keydown', onKey);
}

function onKey(e) {
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
}

function goTo(index) {
  if (index === currentIndex || !slides.length) return;

  const outSlide = slides[currentIndex];
  outSlide.classList.remove('active');
  const outImg = outSlide.querySelector('img');
  outImg.style.animation = 'none';

  currentIndex = index;

  const inSlide = slides[currentIndex];
  const inImg = inSlide.querySelector('img');
  if (!inImg.src && inImg.dataset.src) {
    inImg.src = inImg.dataset.src;
  }

  inSlide.classList.add('active');

  inImg.style.animation = 'none';
  inImg.offsetHeight;
  inImg.style.animation = '';

  if (counterEl) {
    counterEl.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  const data = allSlides[currentIndex];
  if (labelLink && data) {
    labelLink.href = `#/stories/${data.project.slug}`;
    labelLink.innerHTML = `
      <span>${data.project.category}</span>
      <span class="label-sep">/</span>
      <span>${data.project.title}</span>
    `;
  }

  if (storyLink && data) {
    storyLink.href = `#/stories/${data.project.slug}`;
  }

  resetProgress();
  resetAuto();
  preloadAhead();
}

function next() {
  goTo((currentIndex + 1) % allSlides.length);
}

function prev() {
  goTo((currentIndex - 1 + allSlides.length) % allSlides.length);
}

function startAuto() {
  autoTimer = setInterval(next, 5000);
}

function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}

function startProgress() {
  if (!progressBar) return;
  progressBar.classList.add('running');
}

function resetProgress() {
  if (!progressBar) return;
  progressBar.classList.remove('running');
  progressBar.offsetHeight;
  progressBar.classList.add('running');
}

function preloadAhead() {
  for (let i = 1; i <= 3; i++) {
    const idx = (currentIndex + i) % allSlides.length;
    const img = slides[idx]?.querySelector('img');
    if (img && !img.src && img.dataset.src) {
      img.src = img.dataset.src;
    }
  }
}
