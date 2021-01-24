/**
 * Generate a number between start and end.
 * Will return a float, so floor it if you need.
 */
export const randBetween = (start: number, end: number) => Math.random() * (end - start) + start;
