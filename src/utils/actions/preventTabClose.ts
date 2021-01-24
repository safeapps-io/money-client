export const preventTabClose: Action = () => {
  const eventHandler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', eventHandler);

  return {
    destroy: () => window.removeEventListener('beforeunload', eventHandler),
  };
};
