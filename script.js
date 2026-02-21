(function () {
  const SECTION_NAMES = {
    'editoriale': 'Editoriale',
    'ritratti': 'Ritratti',
    'street': 'Street',
    'reportage': 'Reportage',
    'still-life': 'Still Life'
  };

  // Pattern fisso: stessa posizione nel tempo (indice 0 = sempre stesso w/h, ecc.)
  const GRID_PATTERN = [
    { w: 1, h: 1 }, { w: 2, h: 1 }, { w: 1, h: 2 }, { w: 1, h: 1 }, { w: 2, h: 2 }, { w: 1, h: 1 },
    { w: 2, h: 1 }, { w: 1, h: 2 }, { w: 1, h: 1 }, { w: 1, h: 1 }, { w: 2, h: 1 },
    { w: 1, h: 1 }, { w: 1, h: 2 }, { w: 2, h: 1 }, { w: 1, h: 1 }, { w: 1, h: 1 }, { w: 2, h: 2 },
    { w: 2, h: 1 }, { w: 1, h: 1 }, { w: 1, h: 2 }, { w: 1, h: 1 }, { w: 2, h: 1 },
    { w: 1, h: 2 }, { w: 1, h: 1 }, { w: 2, h: 2 }, { w: 1, h: 1 }
  ];

  const SECTION_IDS = Object.keys(SECTION_NAMES);

  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const mosaicWrapper = document.getElementById('mosaicWrapper');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxSectionName = document.getElementById('lightboxSectionName');

  function getPattern(i) {
    const p = GRID_PATTERN[i % GRID_PATTERN.length];
    return { w: p.w, h: p.h };
  }

  function openMenu() {
    menuOverlay.classList.add('is-open');
    menuOverlay.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOverlay.classList.remove('is-open');
    menuOverlay.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openLightbox(src, sectionId) {
    lightboxImg.src = src;
    lightboxSectionName.textContent = SECTION_NAMES[sectionId] || sectionId;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', function () {
    if (menuOverlay.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  document.querySelectorAll('.menu-sections a[data-section]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.getAttribute('data-section');
      const section = document.getElementById(id);
      if (!section) return;
      closeMenu();
      requestAnimationFrame(function () {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  });

  menuOverlay.addEventListener('click', function (e) {
    if (e.target === menuOverlay) closeMenu();
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target.classList.contains('lightbox-backdrop') || e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('is-open')) closeLightbox();
      else if (menuOverlay.classList.contains('is-open')) closeMenu();
    }
  });

  function buildMosaic(data) {
    mosaicWrapper.innerHTML = '';
    const total = SECTION_IDS.reduce(function (n, id) { return n + (data[id] || []).length; }, 0);

    if (total === 0) {
      mosaicWrapper.innerHTML = '<p class="mosaic-empty">Aggiungi le tue foto nelle cartelle <code>photos/editoriale</code>, <code>photos/ritratti</code>, ecc. Poi esegui <code>node build.js</code> e ricarica la pagina.</p>';
      return;
    }

    SECTION_IDS.forEach(function (sectionId) {
      const paths = data[sectionId] || [];
      if (paths.length === 0) return;

      const section = document.createElement('section');
      section.className = 'mosaic-section';
      section.id = sectionId;

      const grid = document.createElement('div');
      grid.className = 'mosaic-grid';

      paths.forEach(function (src, i) {
        const pattern = getPattern(i);
        const item = document.createElement('div');
        item.className = 'mosaic-item';
        item.style.setProperty('--w', pattern.w);
        item.style.setProperty('--h', pattern.h);

        const img = document.createElement('img');
        img.src = src;
        img.alt = '';

        img.addEventListener('click', function () {
          openLightbox(src, sectionId);
        });

        item.appendChild(img);
        grid.appendChild(item);
      });

      section.appendChild(grid);
      mosaicWrapper.appendChild(section);
    });
  }

  fetch('images.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(buildMosaic)
    .catch(function () {
      buildMosaic({
        editoriale: [], ritratti: [], street: [], reportage: [], 'still-life': []
      });
    });
})();
