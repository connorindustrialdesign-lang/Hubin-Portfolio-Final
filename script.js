function setActiveNavLink() {
  const page = document.body.getAttribute('data-page');
  const navLinks = document.querySelectorAll('.nav a[data-link]');
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute('data-link');
    if (linkPage === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setActiveCategoryLink() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;

  const pageName = page.toLowerCase();
  const categoryPageMap = {
    'shope-concrete': 'engineering',
    'engineering-design-1-2': 'engineering',
    'shope-portfolio': 'engineering',
    'letter-recommendation': 'engineering'
  };

  let resolvedCategoryPage = pageName;
  
  // portfolio-wheel has its own scroll detection, skip
  if (pageName === 'portfolio-wheel') {
    return;
  }
  
  if (pageName.startsWith('project-')) {
    resolvedCategoryPage = 'industrial-design';
  } else if (pageName.startsWith('fabrication')) {
    resolvedCategoryPage = 'fabrication';
  } else if (pageName.startsWith('fine-arts')) {
    resolvedCategoryPage = 'fine-arts';
  } else {
    resolvedCategoryPage = categoryPageMap[pageName] || pageName;
  }

  const categoryLinks = document.querySelectorAll('.category-bar a');
  categoryLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const hrefName = href.toLowerCase().replace('.html', '').replace('#', '-');
    if (hrefName.includes(resolvedCategoryPage)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = /** @type {HTMLInputElement|null} */ (document.getElementById('name'))?.value.trim();
    const email = /** @type {HTMLInputElement|null} */ (document.getElementById('email'))?.value.trim();
    const message = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('message'))?.value.trim();

    if (!name || !email || !message) {
      if (status) {
        status.textContent = 'Please fill in all fields before sending.';
        status.classList.remove('success');
        status.classList.add('error');
      }
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (status) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.remove('success');
        status.classList.add('error');
      }
      return;
    }

    if (status) {
      status.textContent = 'Thanks! Your message has been captured locally (no data is sent anywhere).';
      status.classList.remove('error');
      status.classList.add('success');
    }

    form.reset();
  });
}

function initYear() {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear().toString();
}

function initPortfolioWheelVersionQuery() {
  const version = '20260307b';
  const links = document.querySelectorAll('a[href*="portfolio-wheel.html"]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const [pathAndQuery, hash = ''] = href.split('#');
    if (!pathAndQuery.includes('portfolio-wheel.html')) return;

    if (pathAndQuery.includes('v=')) return;

    const joiner = pathAndQuery.includes('?') ? '&' : '?';
    const updated = `${pathAndQuery}${joiner}v=${version}${hash ? `#${hash}` : ''}`;
    link.setAttribute('href', updated);
  });
}

function initFineArtsCategoryBarSync() {
  const page = (document.body.getAttribute('data-page') || '').toLowerCase();
  if (page !== 'fine-arts') return;

  const currentPath = (window.location.pathname || '').toLowerCase();
  const isFineArtsDetail = currentPath.includes('fine-arts-') && currentPath.includes('-detail.html');
  if (!isFineArtsDetail) return;

  const header = document.querySelector('.site-header');
  const categoryBar = document.querySelector('.category-bar');
  if (!categoryBar) return;

  const syncOffsets = () => {
    const barHeight = Math.ceil(categoryBar.getBoundingClientRect().height);

    if (header) {
      header.style.display = 'none';
    }

    categoryBar.style.top = '0px';
    categoryBar.style.position = 'fixed';
    document.body.style.paddingTop = `${barHeight}px`;
  };

  syncOffsets();
  window.addEventListener('resize', syncOffsets);
  window.addEventListener('orientationchange', syncOffsets);
  window.addEventListener('load', syncOffsets);
}

function initHomeOffsetSync() {
  const page = (document.body.getAttribute('data-page') || '').toLowerCase();
  if (page !== 'home') return;

  const header = document.querySelector('.site-header');
  const categoryBar = document.querySelector('.category-bar');
  if (!header || !categoryBar) return;

  const syncOffsets = () => {
    const headerHeight = Math.ceil(header.getBoundingClientRect().height);
    const barHeight = Math.ceil(categoryBar.getBoundingClientRect().height);

    document.documentElement.style.setProperty('--home-header-h', `${headerHeight}px`);
    document.documentElement.style.setProperty('--home-bar-h', `${barHeight}px`);
    categoryBar.style.top = `${headerHeight}px`;
  };

  syncOffsets();
  window.addEventListener('resize', syncOffsets);
  window.addEventListener('orientationchange', syncOffsets);
  window.addEventListener('load', syncOffsets);
}

function initCategoryBarMode() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;

  const pageName = page.toLowerCase();
  const projectPages = new Set([
    'shope-concrete',
    'engineering-design-1-2',
    'shope-portfolio',
    'letter-recommendation'
  ]);

  const currentPath = window.location.pathname;
  const isProjectDetailPage = currentPath.includes('-detail.html') || 
                               pageName.startsWith('project-') || 
                               projectPages.has(pageName);
  
  if (isProjectDetailPage) {
    document.body.classList.add('project-detail-page');

    const categoryBar = document.querySelector('.category-bar');
    if (!categoryBar) return;

    const barContent = categoryBar.querySelector('.category-bar-content') || categoryBar;

    // Keep links to portfolio-wheel.html with anchors
    const links = Array.from(barContent.querySelectorAll('a'));
    links.forEach((link) => {
      const href = (link.getAttribute('href') || '').trim();
      // Keep category links (portfolio-wheel.html#...), details, and logo
      const shouldKeep = href.includes('portfolio-wheel.html#') || 
                        href === 'about.html' || 
                        link.classList.contains('category-logo');
      if (!shouldKeep) {
        link.remove();
      }

      if (href === 'about.html') {
        link.textContent = 'Details';
      }
    });

    if (!barContent.querySelector('a[href="about.html"]')) {
      const detailsLink = document.createElement('a');
      detailsLink.href = 'about.html';
      detailsLink.textContent = 'Details';
      barContent.appendChild(detailsLink);
    }

    if (barContent.querySelector('.category-logo')) return;

    const logoLink = document.createElement('a');
    logoLink.href = 'index.html';
    logoLink.className = 'category-logo';
    logoLink.textContent = 'Connor Hubin';
    barContent.prepend(logoLink);
  }
}

// Project tiles (portfolio-wheel.html): on touch devices there's no real
// hover, so briefly reveal the title overlay before navigating on tap.
// Desktop just uses the CSS :hover rule - no JS needed there.
function initTileHoverTitles() {
  // Clear any stuck "tapped" state before anything else - when the browser
  // restores this page from cache after the user hits Back, the .tile-tapped
  // class (and the click handler's in-progress navigating flag) come back
  // frozen exactly as they were at the moment of tapping, leaving that tile's
  // title stuck visible (and stacking up with more tiles each time Back is
  // used again).
  const clearTappedState = () => {
    document.querySelectorAll('.tile.tile-tapped').forEach((tile) => {
      tile.classList.remove('tile-tapped');
      delete tile.dataset.navigating;
    });
  };
  clearTappedState();
  window.addEventListener('pageshow', clearTappedState);

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isTouch) return;

  document.querySelectorAll('.tile').forEach((tile) => {
    if (!tile.querySelector('.tile-hover-title')) return;

    tile.addEventListener('click', (e) => {
      if (tile.dataset.navigating) return;
      e.preventDefault();
      tile.classList.add('tile-tapped');
      tile.dataset.navigating = '1';
      const href = tile.getAttribute('href');
      setTimeout(() => { window.location.href = href; }, 450);
    });
  });
}


// Reliably autoplay/loop any <video autoplay> on the page - mobile browsers
// often reject the very first play() attempt right after page load (even
// muted) but accept a retry moments later, so we retry immediately, at
// several readiness events/short delays, on scroll into view, and on the
// first user gesture - whichever succeeds first gets it playing without
// requiring the user to scroll first.
function initAutoplayVideos() {
  const videos = document.querySelectorAll('video[autoplay]');
  if (!videos.length) return;

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
  });

  function isInViewport(video) {
    const r = video.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
  }

  function tryPlay(video) {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  }

  videos.forEach((video) => {
    tryPlay(video);
    ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach((evt) => {
      video.addEventListener(evt, () => { if (video.paused) tryPlay(video); });
    });
    [50, 250, 750, 1500].forEach((delay) => {
      setTimeout(() => {
        if (video.paused && isInViewport(video)) tryPlay(video);
      }, delay);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tryPlay(entry.target);
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.1 });
    videos.forEach((video) => observer.observe(video));
  }

  // Fallback: some mobile browsers only unlock autoplay after a genuine
  // user gesture anywhere on the page - retry any videos still paused.
  const retryOnInteraction = () => {
    videos.forEach((video) => { if (video.paused) tryPlay(video); });
  };
  ['touchstart', 'click', 'scroll'].forEach((evt) => {
    document.addEventListener(evt, retryOnInteraction, { once: true, passive: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCategoryBarMode();
  initPortfolioWheelVersionQuery();
  initFineArtsCategoryBarSync();
  initHomeOffsetSync();
  setActiveNavLink();
  setActiveCategoryLink();
  initContactForm();
  initYear();
  initTileHoverTitles();
  initAutoplayVideos();
});

