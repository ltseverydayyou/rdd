(function () {
  "use strict";
  if (window.__RDD_MOTION__) return;
  window.__RDD_MOTION__ = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  requestAnimationFrame(() => document.body.classList.add("rdd-ready"));
})();
