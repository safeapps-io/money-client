export const resize: Action<(el: HTMLElement) => void> = (node, cb) => {
  const ro = new ResizeObserver(() => cb(node));
  ro.observe(node);
  return {
    destroy: () => ro.disconnect(),
  };
};
