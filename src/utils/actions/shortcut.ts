export type ShortcutSetting = {
  control?: boolean;
  shift?: boolean;
  alt?: boolean;

  code: string | string[];

  fireWithFocus?: boolean;
  callback?: () => void;
};

export const shortcut: Action<ShortcutSetting> = (node, params) => {
  let handler: ((e: KeyboardEvent) => void) | undefined;

  const removeHandler = () => window.removeEventListener('keydown', handler!),
    setHandler = () => {
      removeHandler();
      if (!params) return;

      handler = (e: KeyboardEvent) => {
        if (params.fireWithFocus && document.activeElement != node) return;

        const matches = Array.isArray(params.code)
          ? params.code.includes(e.code)
          : params.code == e.code;

        if (
          (params.alt && !e.altKey) ||
          (params.shift && !e.shiftKey) ||
          (params.control && !(e.ctrlKey || e.metaKey)) ||
          !matches
        )
          return;

        e.preventDefault();
        params.callback ? params.callback() : node.click();
      };
      window.addEventListener('keydown', handler);
    };

  setHandler();

  return {
    update: setHandler,
    destroy: removeHandler,
  };
};

export const focusableShortcut: Action = node =>
  shortcut(node, { code: ['Space', 'Enter'], fireWithFocus: true }) as ReturnType<Action>;
