/* Encuadre móvil sin intervenir en las coordenadas ni las colisiones del juego. */
(() => {
  'use strict';
  const stage = document.getElementById('game-stage');
  const canvas = document.getElementById('game-canvas');
  const fullBtn = document.getElementById('fullscreen-button');
  const mobile = matchMedia('(pointer: coarse)');
  const landscape = matchMedia('(orientation: landscape)');
  let camera = 0;
  let height = 0;
  let imageHeight = 0;
  let frame = null;
  let lastTime = null;

  function update(timestamp) {
    const maxCrop = imageHeight - height;
    const playerY = window.cemeteryGame?.player?.y ?? canvas.height / 2;
    const target = Math.max(0, Math.min(maxCrop, playerY / canvas.height * imageHeight - height * .52));
    const elapsed = lastTime === null ? 1000 / 60 : Math.min(50, timestamp - lastTime);
    lastTime = timestamp;
    const next = Math.abs(target - camera) < .1
      ? target
      : camera + (target - camera) * (1 - Math.pow(.82, elapsed * .06));
    if (next !== camera) {
      camera = next;
      canvas.style.setProperty('--camera-y', `${-camera.toFixed(2)}px`);
    }
    frame = requestAnimationFrame(update);
  }

  function resize() {
    height = stage.clientHeight;
    imageHeight = stage.clientWidth * canvas.height / canvas.width;
    const cropped = mobile.matches && landscape.matches && imageHeight > height;
    canvas.classList.toggle('camera-crop', cropped);
    if (cropped) {
      if (frame === null) frame = requestAnimationFrame(update);
    } else {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = lastTime = null;
      camera = 0;
      canvas.style.removeProperty('--camera-y');
    }
  }

  new ResizeObserver(resize).observe(stage);
  for (const query of [mobile, landscape]) {
    if (query.addEventListener) query.addEventListener('change', resize);
    else query.addListener(resize);
  }
  resize();
  if (fullBtn) {
    fullBtn.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) {
          await (document.documentElement.requestFullscreen?.() ?? Promise.reject());
          try { await screen.orientation?.lock?.('landscape'); } catch (_) {}
        } else {
          await document.exitFullscreen?.();
        }
      } catch (_) {
        fullBtn.textContent = 'Pantalla completa no disponible';
      }
    });
  }
})();
