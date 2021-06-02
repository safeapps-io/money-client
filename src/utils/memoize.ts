export const memoize = <T1, T2, T3, A>(func: (a: T1, b?: T2, c?: T3) => A) => {
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
