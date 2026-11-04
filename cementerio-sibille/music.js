/* Música ambiental del minijuego. Independiente de los sonidos y la lógica de game.js. */
(() => {
  'use strict';
  const audio = document.getElementById('graveyard-music');
  const button = document.getElementById('music-toggle');
  const loading = document.getElementById('loading-screen');
  const ending = document.getElementById('end-screen');
  const restart = document.getElementById('restart-button');
  if (!audio || !button || !loading || !ending || !restart) return;

  audio.volume = 0.20;
  let enabled = true;
  let hasStarted = false;

  function isPlayingScene() {
    return loading.classList.contains('hidden') && ending.classList.contains('hidden');
  }

  function updateButton() {
    button.textContent = enabled ? '♫ Música: ON' : '♫ Música: OFF';
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Silenciar música de fondo' : 'Activar música de fondo');
    button.title = enabled ? 'Silenciar música' : 'Activar música';
  }

  function playIfAllowed() {
    if (!enabled || !isPlayingScene() || document.hidden) return;
    audio.play().then(() => {
      hasStarted = true;
    }).catch(() => {
      // El navegador todavía puede requerir una interacción explícita.
    });
  }

  // El navegador exige un gesto del usuario para reproducir audio con sonido.
  // No hacemos nada con los clics del botón: su controlador ya se encarga.
  function onInteraction(event) {
    if (button.contains(event.target)) return;
    if (!hasStarted && enabled) playIfAllowed();
  }
  document.addEventListener('pointerdown', onInteraction, { capture: true });
  document.addEventListener('keydown', onInteraction, { capture: true });

  button.addEventListener('click', () => {
    enabled = !enabled;
    if (enabled) playIfAllowed();
    else audio.pause();
    updateButton();
  });

  // Silenciar la música en la pantalla final (sin detener las voces ni efectos).
  new MutationObserver(() => {
    if (!ending.classList.contains('hidden')) audio.pause();
  }).observe(ending, { attributes: true, attributeFilter: ['class'] });

  restart.addEventListener('click', () => {
    // El controlador del juego también oculta la pantalla final en este clic.
    if (enabled) audio.play().then(() => { hasStarted = true; }).catch(() => {});
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.pause();
    else if (hasStarted) playIfAllowed();
  });
  window.addEventListener('pagehide', () => audio.pause());
  updateButton();
})();
