export let autofocus: Action<boolean> = (node, shouldFocus) => {
  const update = (should: boolean) => should && node.focus();
  update(shouldFocus);

  return {
    update,
  };
};
