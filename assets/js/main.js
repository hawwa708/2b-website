/* ==========================================================================
   2B Business Booster â€” Script partagÃ© (toutes les pages)
   DÃ©pendances CDN : GSAP, ScrollTrigger, Lenis (voir <script> en bas du HTML)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeaderScrollState();
  initMobileNav();
  initRevealAnimations();
  initHeroVignette();
  initVignetteSlideshow();
  initPillarCarousels();
  initCursorGlow();
});

/* ---------- Lenis smooth scroll + sync GSAP ScrollTrigger ---------- */
function initSmoothScroll() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
}

/* ---------- Header : fond floutÃ© dÃ¨s le premier scroll ---------- */
function initHeaderScrollState() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const setState = () => {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  setState();
  window.addEventListener('scroll', setState, { passive: true });
}

/* ---------- Navigation mobile (burger + sous-menus accordÃ©on) ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  nav.querySelectorAll('.mobile-nav-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const submenu = btn.nextElementSibling;
      const wasOpen = submenu.classList.contains('open');
      nav.querySelectorAll('.mobile-submenu.open').forEach((el) => el.classList.remove('open'));
      if (!wasOpen) submenu.classList.add('open');
    });
  });
}

/* ---------- Reveal au scroll (fade + translateY) ---------- */
function initRevealAnimations() {
  if (typeof gsap === 'undefined') return;
  const items = document.querySelectorAll('.reveal');
  items.forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: (i % 3) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ----------------------------------------------------------------------
   Hero : la vignette insÃ©rÃ©e dans le titre grandit au scroll jusqu'au
   plein Ã©cran, puis SORT de l'Ã©cran par le haut pour libÃ©rer la page.
   Un espace rÃ©servÃ© (placeholder) invisible garde sa place dans le titre
   pour que le texte ne soit jamais recouvert.
   ---------------------------------------------------------------------- */
function initHeroVignette() {
  if (typeof gsap === 'undefined') return;
  const vignette = document.querySelector('.hero-vignette');
  const hero = document.querySelector('.hero');
  if (!vignette || !hero) return;

  // 1) Espace rÃ©servÃ© dans le H1 : conserve la mise en page du texte
  const rect0 = vignette.getBoundingClientRect();
  const placeholder = document.createElement('span');
  placeholder.className = 'hero-vignette-placeholder';
  placeholder.style.cssText =
    'display:inline-block;vertical-align:middle;margin:0 10px;visibility:hidden;' +
    'width:' + rect0.width + 'px;height:' + rect0.height + 'px;';
  vignette.after(placeholder);

  // 2) La vignette passe en fixed, superposÃ©e exactement au placeholder
  vignette.classList.add('hero-vignette-fixed');
  gsap.set(vignette, {
    position: 'fixed',
    margin: 0,
    top: rect0.top,
    left: rect0.left,
    width: rect0.width,
    height: rect0.height,
    borderRadius: 16,
  });

  // 3) Progression pilotÃ©e par le scroll :
  //    0 â†’ GROW_END        : croissance vers le grand bloc centrÃ©
  //    GROW_END â†’ EXIT_START : palier â€” le bloc reste affichÃ© Ã  sa taille
  //    EXIT_START â†’ 1      : sortie vers le haut (libÃ¨re la page)
  const GROW_END = 0.42;
  const EXIT_START = 0.72;
  const easeGrow = gsap.parseEase('power2.inOut');
  const lerp = gsap.utils.interpolate;

  const st = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: '+=170%',
    scrub: true,
    invalidateOnRefresh: true,
  });

  function update() {
    const p = st.progress;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Taille finale : grand bloc centrÃ© avec marges (rÃ©fÃ©rence upsunday),
    // PAS un plein Ã©cran â€” le header et les bords de page restent visibles.
    const isMobile = vw < 700;
    const fullW = isMobile ? vw - 24 : Math.min(vw * 0.76, 1500);
    const fullH = isMobile ? vh * 0.62 : vh * 0.72;
    const full = {
      top: isMobile ? 88 : 110,
      left: (vw - fullW) / 2,
      w: fullW,
      h: fullH,
      r: 28,
    };
    // Position vivante du placeholder : la vignette suit le texte tant
    // que la croissance n'a pas commencÃ©, puis s'en dÃ©tache en douceur.
    const startRect = placeholder.getBoundingClientRect();

    let top, left, w, h, r;
    if (p <= GROW_END) {
      // Croissance depuis la position dans le titre
      const t = easeGrow(p / GROW_END);
      top = lerp(startRect.top, full.top, t);
      left = lerp(startRect.left, full.left, t);
      w = lerp(startRect.width, full.w, t);
      h = lerp(startRect.height, full.h, t);
      r = lerp(16, full.r, t);
    } else if (p <= EXIT_START) {
      // Palier : le bloc reste affichÃ© Ã  sa taille finale
      top = full.top;
      left = full.left;
      w = full.w;
      h = full.h;
      r = full.r;
    } else {
      // Phase de sortie : le grand bloc glisse vers le haut et libÃ¨re la page
      const t = (p - EXIT_START) / (1 - EXIT_START);
      top = full.top - t * (full.top + full.h + 100);
      left = full.left;
      w = full.w;
      h = full.h;
      r = full.r;
    }

    gsap.set(vignette, { top: top, left: left, width: w, height: h, borderRadius: r });
    vignette.classList.toggle('is-full', p > GROW_END * 0.7 && p < 1);
  }

  gsap.ticker.add(update);
  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

/* ----------------------------------------------------------------------
   Diaporama interne de la vignette hero â€” boucle infinie, indÃ©pendante
   du scroll : 3 images en cuts bruts rapides, puis sÃ©quence de mots 2B
   en cascade diagonale sur fond dÃ©gradÃ© clair (style upsunday).
   ---------------------------------------------------------------------- */
function initVignetteSlideshow() {
  if (typeof gsap === 'undefined') return;
  const vignette = document.querySelector('.hero-vignette');
  if (!vignette) return;
  const slides = vignette.querySelectorAll('.v-slide');
  const shade = vignette.querySelector('.v-shade');
  const wordsPane = vignette.querySelector('.v-words');
  const track = vignette.querySelector('.v-words-track');
  const words = vignette.querySelectorAll('.v-words-track span');
  if (!slides.length || !wordsPane) return;

  const IMG_DUR = 0.4;      // cuts bruts et rapides : pas de fondu, juste une coupe
  const WORDS_SLIDE = 1.6;  // durÃ©e du trajet de chaque mot (gauche â†’ droite)
  const WORDS_STAGGER = 0.14; // dÃ©part dÃ©calÃ© : le mot du haut part en premier
  const WORDS_HOLD = 0.5;   // pause une fois la colonne alignÃ©e Ã  droite

  // Position de dÃ©part : TOUS les mots alignÃ©s en colonne au bord GAUCHE.
  // (le dÃ©calage ramÃ¨ne le bord gauche de chaque mot sur la marge gauche)
  const leftStart = (el) => -(wordsPane.clientWidth * 0.88 - el.offsetWidth);

  const tl = gsap.timeline({
    repeat: -1,
    // RÃ©-Ã©value les dÃ©calages Ã  chaque boucle (suit la taille rÃ©elle du bloc)
    onRepeat: function () { this.invalidate(); },
  });

  // Phase 1 : les 3 images en coupes sÃ¨ches
  slides.forEach((slide) => {
    tl.set(slide, { autoAlpha: 1 });
    tl.set(slide, { autoAlpha: 0 }, '+=' + IMG_DUR);
  });

  // Phase 2 : les mots dÃ©marrent TOUS alignÃ©s en colonne au bord gauche,
  // puis glissent un Ã  un vers la droite (celui du haut part en premier).
  // Ã€ mi-parcours l'ensemble dessine l'escalier diagonal, et tout finit
  // alignÃ© en colonne verticale au bord droit.
  tl.call(() => vignette.classList.add('words-on'));
  tl.set(shade, { display: 'none' });
  tl.set(wordsPane, { autoAlpha: 1 });
  tl.fromTo(words,
    { x: (i, el) => leftStart(el), autoAlpha: 1 },
    { x: 0, duration: WORDS_SLIDE, ease: 'power2.inOut', stagger: WORDS_STAGGER }
  );
  // LÃ©gÃ¨re descente de l'ensemble pendant le glissement (haut vers bas)
  tl.fromTo(track,
    { yPercent: -6 },
    { yPercent: 0, duration: WORDS_SLIDE + WORDS_STAGGER * (words.length - 1), ease: 'power2.inOut' },
    '<'
  );
  // Retour aux images SANS trou noir : la 1re image est rÃ©affichÃ©e
  // avant de masquer le calque des mots (coupe sÃ¨che, aucun frame vide)
  tl.set(slides[0], { autoAlpha: 1 }, '+=' + WORDS_HOLD);
  tl.set(shade, { display: 'block' });
  tl.set(wordsPane, { autoAlpha: 0 });
  tl.call(() => vignette.classList.remove('words-on'));
}

/* ---------- Cartes piliers : carrousel automatique du texte interne ---------- */
function initPillarCarousels() {
  document.querySelectorAll('.pillar-rotator').forEach((rotator) => {
    const items = rotator.querySelectorAll('span');
    if (items.length < 2) return;
    let index = 0;
    let timer = setInterval(rotate, 3200);

    function rotate() {
      items[index].classList.remove('active');
      index = (index + 1) % items.length;
      items[index].classList.add('active');
    }

    rotator.closest('.pillar-card').addEventListener('mouseenter', () => clearInterval(timer));
    rotator.closest('.pillar-card').addEventListener('mouseleave', () => {
      timer = setInterval(rotate, 3200);
    });
  });
}

/* ----------------------------------------------------------------------
   Curseur "film d'eau" — simulation de fluide WebGL (webgl-fluid-enhanced).
   Deux verrous rendent le "disco" impossible :
   - brightness : plafonne la luminosité du rendu, quelle que soit la
     quantité d'encre accumulée en repassant au même endroit ;
   - colorPalette : uniquement l'orange 2B et ses déclinaisons claires.
   Combiné au mix-blend-mode multiply (CSS), le calque ne peut que
   teinter/assombrir la page — jamais l'éclairer.
   ---------------------------------------------------------------------- */
function initCursorGlow() {
  const container = document.getElementById('cursor-glow');
  if (!container || typeof WebGLFluidEnhanced === 'undefined') return;

  // Le bundle UMD expose un objet { WebGLFluidEnhanced, default, ... }
  const Ctor = WebGLFluidEnhanced.WebGLFluidEnhanced || WebGLFluidEnhanced.default || WebGLFluidEnhanced;

  let fluid;
  try {
    fluid = new Ctor(container);
    fluid.setConfig({
      hover: true,                // réagit au survol, sans clic
      simResolution: 128,
      dyeResolution: 1024,
      densityDissipation: 1.0,    // la nappe s'étale puis s'estompe
      velocityDissipation: 2.3,   // le courant s'amortit vite (pas de volutes)
      pressure: 0.8,              // comportement liquide, incompressible
      curl: 3,                    // très peu de turbulence
      splatRadius: 0.5,           // grandes injections → nappe large et douce
      splatForce: 5500,
      colorful: false,            // pas de dérive de teinte : palette stricte
      colorPalette: ['#E25B3B', '#E8825F', '#F2A98E', '#F6C4B0'],
      brightness: 0.22,           // PLAFOND de luminosité : tue le "disco"
      colorUpdateSpeed: 6,
      shading: true,              // relief liquide (ombres douces)
      bloom: false,
      sunrays: false,
      transparent: true,          // canvas transparent au-dessus de la page
    });
    fluid.start();
  } catch (err) {
    return; // WebGL indisponible : pas d'effet, le site reste fonctionnel
  }

  // La librairie écoute sur SON canvas (créé dans le conteneur), qui est en
  // pointer-events:none pour ne jamais bloquer les clics : on lui
  // retransmet les mouvements de souris captés au niveau de la fenêtre.
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  window.addEventListener('mousemove', (e) => {
    if (!e.isTrusted) return; // évite de re-capter nos propres événements
    const ev = new MouseEvent('mousemove', {
      clientX: e.clientX,
      clientY: e.clientY,
      bubbles: false,
    });
    // La librairie lit offsetX/offsetY ; le canvas couvrant tout l'écran,
    // ils correspondent aux coordonnées client.
    Object.defineProperty(ev, 'offsetX', { get: () => e.clientX });
    Object.defineProperty(ev, 'offsetY', { get: () => e.clientY });
    canvas.dispatchEvent(ev);
  });
}