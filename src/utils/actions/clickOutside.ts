export const clickOutside: Action<{ enabled?: boolean; cb: Function }> = (node, params) => {
  const { cb } = params,
    handleOutsideClick = ({ target }: MouseEvent) => !node.contains(target as Node) && cb(),
    update = ({ enabled = true }: { enabled?: boolean }) =>
      enabled
        ? window.addEventListener('click', handleOutsideClick)
        : window.removeEventListener('click', handleOutsideClick);

  update(params);
  return {
    update,
    destroy() {
      update({ enabled: false });
    },
  };
};
