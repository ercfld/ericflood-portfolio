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
    .map(
      (img, i) => `
    <div class="story-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <img src="${imagePath(project.slug, img.file)}" alt="${img.caption || ''}">
    </div>`
    )
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
  `;
}

export function initStory() {
  currentIndex = 0;
  slides = document.querySelectorAll('.story-slide');
  counterEl = document.querySelector('.story-counter-current');
  captionEl = document.querySelector('.story-caption');

  // Find the current project from the URL
  const slug = window.location.hash.split('/').pop();
  projectData = projects.find((p) => p.slug === slug) || null;

  if (!slides.length) return;

  document
    .querySelector('.story-arrow--prev')
    ?.addEventListener('click', prev);
  document
    .querySelector('.story-arrow--next')
    ?.addEventListener('click', next);

  document.addEventListener('keydown', onKey);

  updateCaption();
}

export function destroyStory() {
  document.removeEventListener('keydown', onKey);
}

function onKey(e) {
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
}

function goTo(index) {
  if (index === currentIndex || !slides.length) return;

  slides[currentIndex].classList.remove('active');
  currentIndex = index;
  slides[currentIndex].classList.add('active');

  if (counterEl) {
    counterEl.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  updateCaption();
}

function next() {
  goTo((currentIndex + 1) % slides.length);
}

function prev() {
  goTo((currentIndex - 1 + slides.length) % slides.length);
}

function updateCaption() {
  if (!captionEl || !projectData) return;
  const img = projectData.images[currentIndex];
  captionEl.textContent = img?.caption || '';
}
