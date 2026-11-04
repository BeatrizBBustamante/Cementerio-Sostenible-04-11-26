/* Controles táctiles: adaptador de entrada, sin alterar game.js ni sus mecánicas. */
(() => {
  'use strict';
  const controls = document.getElementById('mobile-controls');
  if (!controls) return;
  const held = new Map();
  const buttons = controls.querySelectorAll('[data-key]');

  function send(key, down) {
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
      key, bubbles: true, cancelable: true
    }));
  }
  function release(button) {
    const pointerId = held.get(button);
    if (pointerId === undefined) return;
    held.delete(button);
    button.classList.remove('pressed');
    send(button.dataset.key, false);
    if (button.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
  }
  function releaseAll() { buttons.forEach(release); }

  buttons.forEach(button => {
    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      if (held.has(button)) return;
      held.set(button, event.pointerId);
      button.setPointerCapture(event.pointerId);
      button.classList.add('pressed');
      send(button.dataset.key, true);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, () => release(button));
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
