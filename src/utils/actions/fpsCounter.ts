import { Writable } from 'svelte/store';

export const fpsCounter: Action<{ counterStore: Writable<number>; enable: boolean }> = (
  _,
  { counterStore, enable },
) => {
  let lastCalledTime = 0,
    runNext = enable;

  const loop = () => {
    if (!lastCalledTime) {
      lastCalledTime = performance.now();
      counterStore.set(0);
      return runNext && requestAnimationFrame(loop);
    }
    const delta = (performance.now() - lastCalledTime) / 1000;
    lastCalledTime = performance.now();
    counterStore.set(1 / delta);
    runNext && requestAnimationFrame(loop);
  };
  runNext && loop();

  return {
    update: ({ enable }) => (runNext = enable),
    destroy: () => (runNext = false),
  };
};
