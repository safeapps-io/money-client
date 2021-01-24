export const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(function () {
      resolve();
    }, ms);
  });
