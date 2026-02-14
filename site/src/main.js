import './style.css';
import { projects, imagePath } from './data.js';
import { renderNav, initNav } from './components/nav.js';
import { renderHome, initHome, destroyHome } from './views/home.js';
import { renderStory, initStory, destroyStory } from './views/story.js';
import { renderBio, initBio } from './views/bio.js';

const app = document.getElementById('app');
let cleanup = null;

function parseRoute() {
  const hash = (window.location.hash || '#/').slice(2);
  return hash.split('/').filter(Boolean);
}

function route() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const segments = parseRoute();
  const page = segments[0] || '';

  let html = '';
  let isHome = false;
  let activePage = page;

  switch (page) {
    case '':
      html = renderHome();
      isHome = true;
      break;
    case 'stories':
      if (segments[1]) {
        html = renderStory(segments[1]);
      } else {
        html = renderStoriesIndex();
      }
      activePage = 'stories';
      break;
    case 'bio':
      html = renderBio();
      break;
    default:
      html = renderHome();
      isHome = true;
  }

  app.innerHTML =
    renderNav(activePage) + `<main>${html}</main>`;

  initNav();

  if (isHome) {
    initHome();
    cleanup = destroyHome;
  }

  if (page === 'stories' && segments[1]) {
    initStory();
    cleanup = destroyStory;
  }

  if (page === 'bio') {
    initBio();
  }

  window.scrollTo(0, 0);
}

function renderStoriesIndex() {
  const cards = projects
    .map(
      (p) => `
    <a href="#/stories/${p.slug}" class="project-card">
      <div class="project-card__image">
        <img src="${imagePath(p.slug, p.images[0].file)}" alt="${p.title}" loading="lazy">
      </div>
      <h2 class="project-card__title">${p.title}</h2>
    </a>`
    )
    .join('');

  return `
    <div class="stories-page">
      <div class="stories-grid">${cards}</div>
    </div>
  `;
}

window.addEventListener('hashchange', route);
route();
