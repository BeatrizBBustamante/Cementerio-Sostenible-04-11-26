/* Controles táctiles: estado independiente del teclado físico. */
(() => {
  'use strict';
  const controls = document.getElementById('mobile-controls');
  if (!controls) return;
  const held = new Map();
  const buttons = controls.querySelectorAll('[data-key]');

  function release(button) {
    const pointerId = held.get(button);
    if (pointerId === undefined) return;
    held.delete(button);
    button.classList.remove('pressed');
    window.cemeteryGame?.touchKeys.delete(button.dataset.key);
    if (button.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
  }
  function releaseAll() { buttons.forEach(release); }

  buttons.forEach(button => {
    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      const game = window.cemeteryGame;
      if (!game?.ready || game.won || held.has(button)) return;
      held.set(button, event.pointerId);
      button.setPointerCapture(event.pointerId);
      button.classList.add('pressed');
      game.touchKeys.add(button.dataset.key);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, (event) => {
        if (held.get(button) === event.pointerId) release(button);
      });
    }
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  const endScreen = document.getElementById('end-screen');
  if (endScreen) {
    const sync = () => {
      const ended = !endScreen.classList.contains('hidden');
      controls.style.display = ended ? 'none' : '';
      if (ended) releaseAll();
    };
    new MutationObserver(sync).observe(endScreen, {attributes:true, attributeFilter:['class']});
    sync();
  }
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseAll();
  });
})();
