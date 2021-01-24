const keys = ['ArrowUp', 'ArrowDown', 'Space', 'Left', 'Right'],
  wheelOpt = { passive: false };

export const restrictBodyScroll: Action<boolean | void> = (node, active = true) => {
  const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel',
    preventEvent = (e: Event) => {
      if (!node.contains(e.target as Node)) e.preventDefault();
    },
    preventKeyEvent = (e: KeyboardEvent) => keys.includes(e.key) && preventEvent(e);

  const update = (shouldPrevent: boolean) => {
    if (shouldPrevent) {
      window.addEventListener(wheelEvent, preventEvent, wheelOpt);
      window.addEventListener('touchmove', preventEvent, wheelOpt);
      window.addEventListener('keydown', preventKeyEvent, false);
    } else {
      window.removeEventListener(wheelEvent, preventEvent);
      window.removeEventListener('touchmove', preventEvent);
      window.removeEventListener('keydown', preventKeyEvent);
    }
  };

  update(active as boolean);

  return {
    update,
    destroy: () => update(false),
  };
};
