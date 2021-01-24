type Params = { duration?: number; cb: Function };

export const longpress: Action<Params> = (node, params) => {
  let timer: number,
    { duration = 1000, cb } = params;

  const handleMousedown = () => {
      timer = window.setTimeout(cb, duration);
    },
    handleMouseup = () => clearTimeout(timer);

  node.addEventListener('mousedown', handleMousedown);
  node.addEventListener('mouseup', handleMouseup);

  return {
    update: newParams => {
      cb = newParams.cb;
      if (newParams.duration) duration = newParams.duration;
    },
    destroy() {
      node.removeEventListener('mousedown', handleMousedown);
      node.removeEventListener('mouseup', handleMouseup);
    },
  };
};
