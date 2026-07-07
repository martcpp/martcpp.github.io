// year
document.getElementById('yr').textContent = new Date().getFullYear();

// mobile menu
var btn = document.getElementById('menuBtn');
var links = document.getElementById('navLinks');
btn.addEventListener('click', function(){
  var open = links.classList.toggle('open');
  btn.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){
    links.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  });
});

// scroll reveal
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce && 'IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
} else {
  document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
}

// active nav highlight
var navA = Array.prototype.slice.call(document.querySelectorAll('nav.links a[href^="#"]'));
var sections = navA.map(function(a){ return document.querySelector(a.getAttribute('href')); });
if ('IntersectionObserver' in window) {
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        navA.forEach(function(a){ a.classList.remove('active'); });
        var match = navA.find(function(a){ return a.getAttribute('href') === '#' + e.target.id; });
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function(s){ if (s) spy.observe(s); });
}

// theme toggle (light / system / dark)
(function(){
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  var buttons = Array.prototype.slice.call(toggle.querySelectorAll('button'));
  var state = window.__theme || {
    mode: 'system',
    mql: window.matchMedia('(prefers-color-scheme: dark)'),
    resolve: function(m){ return (m === 'dark' || (m === 'system' && this.mql.matches)) ? 'dark' : 'light'; }
  };

  function apply(mode){
    state.mode = mode;
    try{ localStorage.setItem('theme', mode); }catch(e){}
    var resolved = state.resolve(mode);
    root.setAttribute('data-theme', resolved);
    buttons.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.set === mode)); });
    document.dispatchEvent(new CustomEvent('themechange', { detail: { mode: mode, resolved: resolved } }));
  }

  buttons.forEach(function(b){
    b.addEventListener('click', function(){ apply(b.dataset.set); });
  });

  apply(state.mode);

  state.mql.addEventListener('change', function(){
    if (state.mode === 'system') apply('system');
  });
})();

// hero node lattice — rotating 3D wireframe on #bgfx canvas
(function(){
  var canvas = document.getElementById('bgfx');
  if (!canvas || typeof THREE === 'undefined') return;
  var hero = canvas.closest('.hero');
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var palette = { edge: '#CE422B', node: '#A2331F', dust: '#6B727A' };
  function readPalette(){
    var cs = getComputedStyle(root);
    palette.edge = cs.getPropertyValue('--rust').trim() || palette.edge;
    palette.node = cs.getPropertyValue('--rust-dark').trim() || palette.node;
    palette.dust = cs.getPropertyValue('--ink-2').trim() || palette.dust;
  }
  readPalette();

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 18);

  var group = new THREE.Group();
  scene.add(group);

  var edgeMat = new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.5 });
  var nodeMat = new THREE.PointsMaterial({ color: palette.node, size: 0.18, transparent: true, opacity: 0.9 });
  var ico = new THREE.IcosahedronGeometry(6.2, 1);
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(ico), edgeMat));
  group.add(new THREE.Points(ico, nodeMat));

  var edgeMatInner = new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.3 });
  var nodeMatInner = new THREE.PointsMaterial({ color: palette.node, size: 0.14, transparent: true, opacity: 0.7 });
  var icoInner = new THREE.IcosahedronGeometry(3.5, 0);
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(icoInner), edgeMatInner));
  group.add(new THREE.Points(icoInner, nodeMatInner));

  var dustCount = 140;
  var dustGeo = new THREE.BufferGeometry();
  var positions = new Float32Array(dustCount * 3);
  for (var i = 0; i < dustCount; i++){
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var dustMat = new THREE.PointsMaterial({ color: palette.dust, size: 0.08, transparent: true, opacity: 0.5 });
  var dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  function resize(){
    var rect = hero.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();

  function applyPalette(){
    readPalette();
    edgeMat.color.set(palette.edge);
    nodeMat.color.set(palette.node);
    edgeMatInner.color.set(palette.edge);
    nodeMatInner.color.set(palette.node);
    dustMat.color.set(palette.dust);
  }
  document.addEventListener('themechange', applyPalette);

  var running = false;
  var rafId = null;

  var spin = 0, spinx = 0;
  var tx = 0, ty = 0, cx = 0, cy = 0;
  if (!reduceMotion){
    window.addEventListener('pointermove', function(e){
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
  }

  function render(){
    spin += 0.0018;
    spinx += 0.0007;
    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    group.rotation.y = spin + cx * 0.6;
    group.rotation.x = spinx * 0.5 + cy * 0.4;
    dust.rotation.y -= 0.0004;
    renderer.render(scene, camera);
    if (running) rafId = requestAnimationFrame(render);
  }
  function start(){
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(render);
  }
  function stop(){
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  if (!reduceMotion && 'IntersectionObserver' in window){
    var vis = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.isIntersecting ? start() : stop(); });
    }, { threshold: 0 });
    vis.observe(hero);
  } else {
    renderer.render(scene, camera);
  }

  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){ resize(); if (!running) renderer.render(scene, camera); }, 150);
  });
})();
