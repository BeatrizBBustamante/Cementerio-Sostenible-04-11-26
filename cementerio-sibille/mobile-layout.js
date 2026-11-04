/* Encuadre móvil sin intervenir en las coordenadas ni las colisiones del juego. */
(() => {
  'use strict';
  const stage = document.getElementById('game-stage');
  const canvas = document.getElementById('game-canvas');
  const fullBtn = document.getElementById('fullscreen-button');
  const mobile = matchMedia('(pointer: coarse)');
  let camera = 0;
  function update() {
    if (mobile.matches && matchMedia('(orientation: landscape)').matches) {
      const vh = stage.clientHeight;
      const w = stage.clientWidth;
      const imageHeight = w * 941 / 1672;
      if (imageHeight > vh) {
        const maxCrop = imageHeight - vh;
        const playerY = window.cemeteryGame?.player?.y ?? 941 / 2;
        const target = Math.max(0, Math.min(maxCrop, playerY / 941 * imageHeight - vh * .52));
        camera += (target - camera) * .18;
        canvas.style.transform = '';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.left = '0';
        canvas.style.top = '0';
        stage.style.setProperty('--camera-y', `${-camera.toFixed(2)}px`);
      } else {
        // Dispositivos de proporción 16:9 o menos anchos: mostrar todo el mapa.
        camera = 0;
        canvas.style.width = 'auto';
        canvas.style.height = '100%';
        canvas.style.left = '50%';
        canvas.style.top = '0';
        canvas.style.transform = 'translateX(-50%)';
        stage.style.removeProperty('--camera-y');
      }
    } else {
      camera = 0;
      canvas.style.width = '';
      canvas.style.height = '';
      canvas.style.left = '';
      canvas.style.top = '';
      canvas.style.transform = '';
      stage.style.removeProperty('--camera-y');
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
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
