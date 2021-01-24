export const /**
   * Get all items from array 1 that are present in array 2
   */
  getArraysOverlap = <T>(arr1: Array<T>, arr2: Array<T>): Array<T> =>
    arr1.filter(value => arr2.includes(value)),
  /**
   * Get all items from array 1 that are not present in array 2
   */
  getNonOverlappingItems = <T>(arr1: Array<T>, arr2: Array<T>) =>
    arr1.filter(value => !arr2.includes(value)),
  areArraysOverlapping = <T>(arr1: Array<T>, arr2: Array<T>) =>
    getArraysOverlap(arr1, arr2).length !== 0,
  areArraysTheSame = <T>(arr1: Array<T>, arr2: Array<T>): boolean =>
    arr1.length === arr2.length && getArraysOverlap(arr1, arr2).length === arr1.length;

export const choice = <T>(arr: Array<T>): T => arr[Math.floor(Math.random() * arr.length)];

export const range = (length: number) => Array(length).fill(null);
