import { site, social, projects } from '../data.js';

export function renderNav(activePage = '') {
  const dropdownItems = projects
    .map(
      (p) =>
        `<a href="#/stories/${p.slug}" class="dropdown-item">${p.title}</a>`
    )
    .join('');

  return `
    <nav class="site-nav">
      <a href="#/" class="nav-logo">${site.name}</a>
      <div class="nav-links">
        <div class="nav-item">
          <a href="#/stories" class="nav-link ${activePage === 'stories' ? 'active' : ''}">Stories</a>
          <div class="dropdown">${dropdownItems}</div>
        </div>
        <a href="#/bio" class="nav-link ${activePage === 'bio' ? 'active' : ''}">Bio</a>
        <a href="${social.instagram.url}" class="nav-social" target="_blank" rel="noopener" aria-label="Instagram">
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg>
        </a>
      </div>
      <button class="nav-hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
    <div class="mobile-menu-overlay"></div>
    <div class="mobile-menu">
      <a href="#/stories">Stories</a>
      ${projects
        .map(
          (p) => `
        <div class="mobile-subnav">
          <a href="#/stories/${p.slug}">${p.title}</a>
        </div>`
        )
        .join('')}
      <a href="#/bio">Bio</a>
      <a href="${social.instagram.url}" target="_blank" rel="noopener">Instagram</a>
    </div>
  `;
}

export function initNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('active')) {
      close();
    } else {
      open();
    }
  });

  overlay?.addEventListener('click', close);

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  function open() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('visible');
    overlay?.classList.add('visible');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mobileMenu.classList.add('open');
        overlay?.classList.add('open');
      });
    });
  }

  function close() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    overlay?.classList.remove('open');
    setTimeout(() => {
      mobileMenu.classList.remove('visible');
      overlay?.classList.remove('visible');
    }, 450);
  }
}
