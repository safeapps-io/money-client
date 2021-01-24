export const memoize = <T, A>(func: (t: T) => A) => {
  let cache: { [key: string]: A } = {};

  const memoized: typeof func = (...args) => {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];

    return (cache[key] = func(...args));
  };

  return {
    memoized,
    clear: () => (cache = {}),
  };
};
