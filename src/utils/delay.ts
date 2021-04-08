export const delay = (ms: number = 500) =>
  new Promise<void>(resolve => {
    setTimeout(function () {
      resolve();
    }, ms);
  });
