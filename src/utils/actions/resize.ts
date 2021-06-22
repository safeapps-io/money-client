import ResizeObserver from 'resize-observer-polyfill';

export const resize: Action<(el: Element) => void, Element> = (node, cb) => {
  const ro = new ResizeObserver(() => cb(node));
  ro.observe(node);
  return {
    destroy: () => ro.disconnect(),
  };
};
