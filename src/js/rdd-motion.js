(function () {
  "use strict";

  var style = document.createElement('style');
  style.id = 'rdd-motion-style';
  style.textContent = "\n:root {\n  --rdd-pointer-x: 50vw;\n  --rdd-pointer-y: 18vh;\n  --rdd-ease: cubic-bezier(0.22, 1, 0.36, 1);\n  --rdd-spring: cubic-bezier(0.16, 1, 0.3, 1);\n}\n\nhtml {\n  scroll-behavior: smooth;\n}\n\nbody {\n  position: relative;\n  overflow-x: hidden;\n  isolation: isolate;\n  background:\n    radial-gradient(circle at var(--rdd-pointer-x) var(--rdd-pointer-y), rgba(95, 179, 255, 0.11), transparent 28rem),\n    radial-gradient(circle at 10% 90%, rgba(71, 114, 255, 0.07), transparent 25rem),\n    linear-gradient(135deg, #080a0e 0%, #0b0d10 46%, #091118 100%);\n}\n\nbody::before,\nbody::after {\n  position: fixed;\n  inset: 0;\n  z-index: -3;\n  pointer-events: none;\n  content: \"\";\n}\n\nbody::before {\n  background:\n    radial-gradient(circle at var(--rdd-pointer-x) var(--rdd-pointer-y), rgba(112, 198, 255, 0.085), transparent 20rem),\n    linear-gradient(115deg, transparent 0 40%, rgba(95, 179, 255, 0.025) 50%, transparent 60%);\n  mix-blend-mode: screen;\n  transition: background 500ms ease;\n}\n\nbody::after {\n  z-index: -4;\n  background: conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(95, 179, 255, 0.04) 80deg, transparent 155deg, rgba(110, 83, 255, 0.035) 250deg, transparent 320deg);\n  animation: rdd-aurora 18s linear infinite;\n}\n\n.page {\n  position: relative;\n  z-index: 1;\n}\n\n.app-shell {\n  position: relative;\n  perspective: 1400px;\n}\n\n.app-shell::before {\n  position: fixed;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  content: \"\";\n  opacity: 0.23;\n  background-image:\n    linear-gradient(rgba(95, 179, 255, 0.035) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(95, 179, 255, 0.035) 1px, transparent 1px);\n  background-size: 42px 42px;\n  mask-image: linear-gradient(to bottom, black, transparent 84%);\n}\n\n.topbar,\n.intro {\n  position: relative;\n  overflow: hidden;\n  transform-style: preserve-3d;\n  animation: rdd-surface-in 850ms var(--rdd-spring) both;\n}\n\n.topbar {\n  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(95, 179, 255, 0.025);\n}\n\n.intro {\n  animation-delay: 80ms;\n}\n\n.topbar::before,\n.intro::after {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  content: \"\";\n}\n\n.topbar::before {\n  background: linear-gradient(110deg, transparent 18%, rgba(255, 255, 255, 0.07) 38%, transparent 56%);\n  transform: translateX(-120%);\n  animation: rdd-sheen 1.6s 850ms var(--rdd-ease) both;\n}\n\n.intro::after {\n  inset: -50% -15%;\n  background: linear-gradient(115deg, transparent 42%, rgba(95, 179, 255, 0.09) 50%, transparent 58%);\n  transform: translateX(-60%) rotate(8deg);\n  animation: rdd-hero-sweep 2.4s 420ms var(--rdd-ease) both;\n}\n\n.brand-mark {\n  position: relative;\n  overflow: hidden;\n  background: linear-gradient(145deg, #182534, #11171f 55%, #0d1117);\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(95, 179, 255, 0.05), 0 8px 24px rgba(20, 102, 158, 0.16);\n  animation: rdd-mark-float 4.5s ease-in-out infinite;\n}\n\n.brand-mark::before,\n.brand-mark::after {\n  position: absolute;\n  pointer-events: none;\n  content: \"\";\n}\n\n.brand-mark::before {\n  inset: -70%;\n  background: conic-gradient(from 90deg, transparent, rgba(95, 179, 255, 0.34), transparent 25%);\n  animation: rdd-mark-spin 5s linear infinite;\n}\n\n.brand-mark::after {\n  inset: 1px;\n  border-radius: inherit;\n  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent 45%);\n}\n\n.brand-mark {\n  isolation: isolate;\n}\n\n.brand-mark,\n.brand-mark::after {\n  z-index: 0;\n}\n\n.brand-mark::before {\n  z-index: -1;\n}\n\n.brand-title {\n  transition: color 240ms ease, text-shadow 240ms ease;\n}\n\n.topbar:hover .brand-title {\n  color: #ffffff;\n  text-shadow: 0 0 24px rgba(95, 179, 255, 0.25);\n}\n\n.kicker {\n  text-shadow: 0 0 18px rgba(95, 179, 255, 0.25);\n}\n\nh1 {\n  background: linear-gradient(110deg, #ffffff 8%, #d9efff 42%, #7fc8ff 72%, #ffffff 96%);\n  background-size: 220% auto;\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  animation: rdd-title-shimmer 8s ease-in-out infinite;\n}\n\n.panel {\n  --rdd-rx: 0deg;\n  --rdd-ry: 0deg;\n  position: relative;\n  transform: perspective(1400px) rotateX(var(--rdd-rx)) rotateY(var(--rdd-ry)) translateY(0);\n  transform-style: preserve-3d;\n  will-change: transform;\n  animation: rdd-panel-in 760ms var(--rdd-spring) var(--rdd-delay, 170ms) both;\n  transition:\n    transform 500ms var(--rdd-spring),\n    border-color 260ms ease,\n    box-shadow 500ms var(--rdd-spring);\n}\n\n.panel::before {\n  position: absolute;\n  inset: 0;\n  z-index: 2;\n  pointer-events: none;\n  content: \"\";\n  border-radius: inherit;\n  opacity: 0;\n  background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 28%, transparent 72%, rgba(95, 179, 255, 0.06));\n  transition: opacity 350ms ease;\n}\n\n.panel::after {\n  position: absolute;\n  top: 0;\n  right: 12%;\n  left: 12%;\n  height: 1px;\n  pointer-events: none;\n  content: \"\";\n  opacity: 0;\n  background: linear-gradient(90deg, transparent, rgba(120, 204, 255, 0.8), transparent);\n  box-shadow: 0 0 16px rgba(95, 179, 255, 0.35);\n  transition: opacity 350ms ease;\n}\n\n.panel:hover {\n  border-color: rgba(95, 179, 255, 0.34);\n  box-shadow: 0 20px 58px rgba(0, 0, 0, 0.24), 0 0 34px rgba(46, 132, 202, 0.08);\n  transform: perspective(1400px) rotateX(var(--rdd-rx)) rotateY(var(--rdd-ry)) translateY(-4px);\n}\n\n.panel:hover::before,\n.panel:hover::after {\n  opacity: 1;\n}\n\n.panel-head {\n  position: relative;\n  z-index: 3;\n  transition: background 260ms ease;\n}\n\n.panel:hover .panel-head {\n  background: linear-gradient(105deg, var(--panel-2), rgba(25, 34, 45, 0.92));\n}\n\n.panel-title h2 {\n  transition: letter-spacing 260ms ease, color 260ms ease;\n}\n\n.panel:hover .panel-title h2 {\n  color: #ffffff;\n  letter-spacing: 0.005em;\n}\n\n.info-card,\n.permalink-box,\n.rdd-recent-row,\n.rdd-package {\n  animation: rdd-card-in 560ms var(--rdd-spring) var(--rdd-delay, 180ms) both;\n  transition:\n    transform 320ms var(--rdd-spring),\n    border-color 220ms ease,\n    background 220ms ease,\n    box-shadow 320ms var(--rdd-spring);\n}\n\n.info-card:hover,\n.permalink-box:hover,\n.rdd-recent-row:hover {\n  border-color: rgba(95, 179, 255, 0.33);\n  background: linear-gradient(135deg, var(--panel-3), rgba(22, 39, 55, 0.82));\n  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18), 0 0 22px rgba(95, 179, 255, 0.06);\n  transform: translateY(-3px);\n}\n\n.info-card__value {\n  transition: color 220ms ease, text-shadow 220ms ease;\n}\n\n.info-card:hover .info-card__value {\n  color: #dff3ff;\n  text-shadow: 0 0 18px rgba(95, 179, 255, 0.18);\n}\n\nbutton {\n  position: relative;\n  overflow: hidden;\n  transform: translateZ(0);\n  transition:\n    transform 240ms var(--rdd-spring),\n    background 180ms ease,\n    border-color 180ms ease,\n    box-shadow 240ms var(--rdd-spring),\n    color 180ms ease;\n}\n\nbutton:not(:disabled):hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18), 0 0 18px rgba(95, 179, 255, 0.06);\n}\n\nbutton:not(:disabled):active {\n  transform: translateY(0) scale(0.975);\n  transition-duration: 80ms;\n}\n\n.btn-primary {\n  box-shadow: 0 8px 24px rgba(23, 99, 148, 0.18);\n}\n\n.btn-primary:not(:disabled):hover {\n  box-shadow: 0 10px 30px rgba(23, 99, 148, 0.32), 0 0 22px rgba(95, 179, 255, 0.17);\n}\n\n.rdd-ripple {\n  position: absolute;\n  width: 12px;\n  height: 12px;\n  pointer-events: none;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.42);\n  transform: translate(-50%, -50%) scale(0);\n  animation: rdd-ripple 620ms ease-out forwards;\n}\n\nselect,\ninput[type=\"text\"],\ninput[type=\"number\"] {\n  transition: border-color 220ms ease, box-shadow 260ms var(--rdd-spring), transform 220ms var(--rdd-spring), background 220ms ease;\n}\n\nselect:focus,\ninput[type=\"text\"]:focus,\ninput[type=\"number\"]:focus {\n  transform: translateY(-1px);\n  background: #0d141b;\n  box-shadow: 0 0 0 2px rgba(95, 179, 255, 0.12), 0 8px 24px rgba(20, 102, 158, 0.1);\n}\n\n.toggle {\n  transition: border-color 220ms ease, background 220ms ease, transform 220ms var(--rdd-spring), box-shadow 220ms ease;\n}\n\n.toggle:hover {\n  border-color: rgba(95, 179, 255, 0.3);\n  background: #101922;\n  transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);\n}\n\ninput[type=\"checkbox\"] {\n  transition: filter 220ms ease, transform 220ms var(--rdd-spring);\n}\n\n.toggle:hover input[type=\"checkbox\"] {\n  filter: drop-shadow(0 0 6px rgba(95, 179, 255, 0.45));\n  transform: scale(1.08);\n}\n\n.status-pill {\n  transition: border-color 260ms ease, color 260ms ease, background 260ms ease, transform 360ms var(--rdd-spring), box-shadow 360ms var(--rdd-spring);\n}\n\n.status-pill.rdd-status-flash {\n  animation: rdd-status-flash 520ms var(--rdd-spring);\n}\n\n.status-pill[data-state=\"running\"] {\n  box-shadow: 0 0 0 1px rgba(95, 179, 255, 0.08), 0 0 26px rgba(95, 179, 255, 0.08);\n}\n\n.status-pill[data-state=\"done\"] {\n  box-shadow: 0 0 0 1px rgba(72, 199, 116, 0.08), 0 0 26px rgba(72, 199, 116, 0.08);\n}\n\n.status-pill[data-state=\"error\"] {\n  box-shadow: 0 0 0 1px rgba(245, 108, 122, 0.08), 0 0 26px rgba(245, 108, 122, 0.08);\n}\n\n.status-pill[data-state=\"running\"] .status-dot {\n  animation: rdd-dot-pulse 1.15s ease-in-out infinite;\n  box-shadow: 0 0 12px currentColor;\n}\n\n.progress-track {\n  position: relative;\n  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.32);\n}\n\n.progress-track::before {\n  position: absolute;\n  inset: -4px 0;\n  pointer-events: none;\n  content: \"\";\n  opacity: 0;\n  background: linear-gradient(90deg, transparent, rgba(95, 179, 255, 0.17), transparent);\n  transform: translateX(-100%);\n}\n\n.progress-track.rdd-active::before {\n  opacity: 1;\n  animation: rdd-progress-scan 1.8s ease-in-out infinite;\n}\n\n.progress-bar {\n  position: relative;\n  overflow: hidden;\n  background: linear-gradient(90deg, #3c9be1, #7ac8ff 52%, #4d9ef0);\n  box-shadow: 0 0 16px rgba(95, 179, 255, 0.36);\n}\n\n.progress-bar::after {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  content: \"\";\n  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%);\n  transform: translateX(-120%);\n}\n\n.progress-bar.rdd-active::after {\n  animation: rdd-progress-shine 1.3s ease-in-out infinite;\n}\n\n#progressPercent {\n  transition: color 220ms ease, text-shadow 220ms ease;\n}\n\n.progress-shell:has(.progress-bar.rdd-active) #progressPercent {\n  color: #dff3ff;\n  text-shadow: 0 0 14px rgba(95, 179, 255, 0.32);\n}\n\n.toast {\n  transform: translateY(5px);\n}\n\n.toast.show {\n  animation: rdd-toast-in 420ms var(--rdd-spring);\n}\n\n#consoleText {\n  position: relative;\n  transition: color 220ms ease, box-shadow 300ms ease;\n}\n\n.log-panel.rdd-log-pulse #consoleText {\n  color: #c5e0f2;\n  box-shadow: inset 0 0 28px rgba(52, 128, 183, 0.06);\n}\n\n.log-panel.rdd-log-pulse .log-chip {\n  animation: rdd-chip-pulse 520ms var(--rdd-spring);\n}\n\n.rdd-recent-row,\n.rdd-package {\n  animation-delay: var(--rdd-delay, 120ms);\n}\n\n.rdd-recent-row:nth-child(2),\n.rdd-package:nth-child(2) {\n  --rdd-delay: 80ms;\n}\n\n.rdd-recent-row:nth-child(3),\n.rdd-package:nth-child(3) {\n  --rdd-delay: 140ms;\n}\n\n.rdd-recent-row:nth-child(4),\n.rdd-package:nth-child(4) {\n  --rdd-delay: 200ms;\n}\n\n.rdd-particle-field {\n  position: fixed;\n  inset: 0;\n  z-index: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.rdd-particle {\n  position: absolute;\n  left: calc(var(--rdd-x) * 1vw);\n  top: calc(var(--rdd-y) * 1vh);\n  width: var(--rdd-size);\n  height: var(--rdd-size);\n  border-radius: 50%;\n  opacity: 0;\n  background: #91d5ff;\n  box-shadow: 0 0 12px rgba(95, 179, 255, 0.72);\n  animation: rdd-particle-float var(--rdd-duration) ease-in-out var(--rdd-delay) infinite;\n}\n\n.rdd-scroll-progress {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 10000;\n  width: 100%;\n  height: 2px;\n  pointer-events: none;\n  transform-origin: left center;\n  background: linear-gradient(90deg, #3a94d8, #a1dcff 45%, #5b8cff);\n  box-shadow: 0 0 14px rgba(95, 179, 255, 0.55);\n  transform: scaleX(0);\n}\n\n.rdd-cursor {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 10001;\n  width: 22px;\n  height: 22px;\n  pointer-events: none;\n  border: 1px solid rgba(160, 221, 255, 0.7);\n  border-radius: 50%;\n  opacity: 0;\n  mix-blend-mode: screen;\n  transform: translate3d(-50px, -50px, 0);\n  transition: width 180ms var(--rdd-spring), height 180ms var(--rdd-spring), border-color 180ms ease, opacity 180ms ease;\n}\n\n.rdd-cursor::after {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  content: \"\";\n  background: #dff6ff;\n  box-shadow: 0 0 12px #7ccfff;\n  transform: translate(-50%, -50%);\n}\n\n.rdd-cursor.is-visible {\n  opacity: 0.75;\n}\n\n.rdd-cursor.is-down {\n  width: 34px;\n  height: 34px;\n  border-color: rgba(255, 255, 255, 0.95);\n}\n\n@keyframes rdd-aurora {\n  to { transform: rotate(360deg) scale(1.12); }\n}\n\n@keyframes rdd-surface-in {\n  from { opacity: 0; transform: translateY(18px) scale(0.985); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n\n@keyframes rdd-panel-in {\n  from { opacity: 0; transform: perspective(1400px) rotateX(3deg) translateY(22px) scale(0.985); }\n  to { opacity: 1; transform: perspective(1400px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1); }\n}\n\n@keyframes rdd-card-in {\n  from { opacity: 0; transform: translateY(12px) scale(0.985); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n\n@keyframes rdd-sheen {\n  to { transform: translateX(120%); }\n}\n\n@keyframes rdd-hero-sweep {\n  to { transform: translateX(70%) rotate(8deg); }\n}\n\n@keyframes rdd-mark-float {\n  0%, 100% { transform: translateY(0) rotate(0deg); }\n  50% { transform: translateY(-2px) rotate(-1deg); }\n}\n\n@keyframes rdd-mark-spin {\n  to { transform: rotate(360deg); }\n}\n\n@keyframes rdd-title-shimmer {\n  0%, 100% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n}\n\n@keyframes rdd-ripple {\n  to { opacity: 0; transform: translate(-50%, -50%) scale(24); }\n}\n\n@keyframes rdd-status-flash {\n  0% { transform: scale(1); }\n  45% { transform: scale(1.045); }\n  100% { transform: scale(1); }\n}\n\n@keyframes rdd-dot-pulse {\n  0%, 100% { transform: scale(0.78); opacity: 0.65; }\n  50% { transform: scale(1.28); opacity: 1; }\n}\n\n@keyframes rdd-progress-scan {\n  to { transform: translateX(100%); }\n}\n\n@keyframes rdd-progress-shine {\n  to { transform: translateX(120%); }\n}\n\n@keyframes rdd-toast-in {\n  from { opacity: 0; transform: translateY(10px) scale(0.96); }\n  60% { opacity: 1; transform: translateY(-2px) scale(1.015); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n\n@keyframes rdd-chip-pulse {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.08); color: #dff3ff; }\n  100% { transform: scale(1); }\n}\n\n@keyframes rdd-particle-float {\n  0%, 100% { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.7); }\n  18%, 78% { opacity: var(--rdd-opacity); }\n  50% { transform: translate3d(var(--rdd-drift), -34px, 0) scale(1); }\n}\n\n@media (max-width: 720px) {\n  .rdd-cursor {\n    display: none;\n  }\n\n  .app-shell::before {\n    background-size: 30px 30px;\n  }\n\n  .panel:hover {\n    transform: translateY(-2px);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html {\n    scroll-behavior: auto;\n  }\n\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.001ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.001ms !important;\n  }\n\n  body::after,\n  .rdd-particle-field,\n  .rdd-cursor,\n  .rdd-scroll-progress {\n    display: none !important;\n  }\n\n  .panel:hover,\n  .info-card:hover,\n  .permalink-box:hover,\n  .rdd-recent-row:hover {\n    transform: none;\n  }\n}\n";
  document.head.appendChild(style);

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setStagger() {
    var targets = all('.panel, .info-card, .permalink-box, .rdd-recent-row, .rdd-package');
    targets.forEach(function (node, index) {
      node.style.setProperty('--rdd-delay', Math.min(index * 54, 720) + 'ms');
    });
  }

  function createParticles() {
    if (reducedMotion() || document.querySelector('.rdd-particle-field')) return;
    var field = document.createElement('div');
    field.className = 'rdd-particle-field';
    field.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 24; i += 1) {
      var particle = document.createElement('span');
      particle.className = 'rdd-particle';
      particle.style.setProperty('--rdd-x', (i * 41 + 7) % 101);
      particle.style.setProperty('--rdd-y', (i * 67 + 13) % 101);
      particle.style.setProperty('--rdd-size', (i % 4 === 0 ? 3 : 2) + 'px');
      particle.style.setProperty('--rdd-opacity', (0.22 + (i % 5) * 0.1).toFixed(2));
      particle.style.setProperty('--rdd-drift', ((i % 2 ? -1 : 1) * (8 + (i % 5) * 5)) + 'px');
      particle.style.setProperty('--rdd-duration', (5.2 + (i % 6) * 0.85) + 's');
      particle.style.setProperty('--rdd-delay', ((i % 8) * -0.7) + 's');
      field.appendChild(particle);
    }
    document.body.appendChild(field);
  }

  function createScrollProgress() {
    if (document.querySelector('.rdd-scroll-progress')) return;
    var bar = document.createElement('div');
    bar.className = 'rdd-scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var amount = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + amount + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function createCursor() {
    if (reducedMotion() || !window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
    var root = document.documentElement;
    var cursor = document.createElement('div');
    cursor.className = 'rdd-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    var x = -50, y = -50, frame = 0;
    function draw() {
      root.style.setProperty('--rdd-pointer-x', x + 'px');
      root.style.setProperty('--rdd-pointer-y', y + 'px');
      cursor.style.transform = 'translate3d(' + (x - 11) + 'px, ' + (y - 11) + 'px, 0)';
      frame = 0;
    }
    document.addEventListener('pointermove', function (event) {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add('is-visible');
      if (!frame) frame = window.requestAnimationFrame(draw);
    }, { passive: true });
    document.addEventListener('pointerdown', function () { cursor.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { cursor.classList.remove('is-down'); });
    document.addEventListener('pointerleave', function () { cursor.classList.remove('is-visible'); });
  }

  function bindTilt() {
    if (reducedMotion() || !window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
    all('.panel').forEach(function (panel) {
      panel.addEventListener('pointermove', function (event) {
        var rect = panel.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        panel.style.setProperty('--rdd-rx', (-y * 2.8).toFixed(2) + 'deg');
        panel.style.setProperty('--rdd-ry', (x * 3.2).toFixed(2) + 'deg');
      });
      panel.addEventListener('pointerleave', function () {
        panel.style.setProperty('--rdd-rx', '0deg');
        panel.style.setProperty('--rdd-ry', '0deg');
      });
    });
  }

  function bindRipples() {
    document.addEventListener('pointerdown', function (event) {
      var button = event.target.closest && event.target.closest('button');
      if (!button || button.disabled || reducedMotion()) return;
      var rect = button.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'rdd-ripple';
      ripple.style.left = (event.clientX - rect.left) + 'px';
      ripple.style.top = (event.clientY - rect.top) + 'px';
      button.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  function bindLiveFeedback() {
    var status = document.getElementById('statusPill');
    if (status && window.MutationObserver) {
      new MutationObserver(function () {
        status.classList.remove('rdd-status-flash');
        void status.offsetWidth;
        status.classList.add('rdd-status-flash');
      }).observe(status, { attributes: true, attributeFilter: ['data-state'] });
    }

    var progressBar = document.getElementById('progressBar');
    var progressTrack = document.querySelector('.progress-track');
    if (progressBar && progressTrack && window.MutationObserver) {
      function syncProgress() {
        var width = parseFloat(progressBar.style.width) || 0;
        progressBar.classList.toggle('rdd-active', width > 0 && width < 100);
        progressTrack.classList.toggle('rdd-active', width > 0 && width < 100);
      }
      new MutationObserver(syncProgress).observe(progressBar, { attributes: true, attributeFilter: ['style'] });
      syncProgress();
    }

    var consoleBox = document.getElementById('consoleText');
    var logPanel = document.querySelector('.log-panel');
    if (consoleBox && logPanel && window.MutationObserver) {
      var timer;
      new MutationObserver(function () {
        logPanel.classList.remove('rdd-log-pulse');
        void logPanel.offsetWidth;
        logPanel.classList.add('rdd-log-pulse');
        clearTimeout(timer);
        timer = setTimeout(function () { logPanel.classList.remove('rdd-log-pulse'); }, 560);
      }).observe(consoleBox, { childList: true, characterData: true, subtree: true });
    }
  }

  function init() {
    document.body.classList.add('rdd-motion-ready');
    setStagger();
    createParticles();
    createScrollProgress();
    createCursor();
    bindTilt();
    bindRipples();
    bindLiveFeedback();
  }

  window.setTimeout(init, 25);
})();