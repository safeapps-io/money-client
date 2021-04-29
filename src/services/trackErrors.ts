/**
 * Loosely based on CatchJS tracker. Stripped out most of the tracker's code.
 */

import { apiHost } from './config';

const request = (
  method: string,
  url: string,
  obj: string,
  onComplete?: (res: any) => void,
  contentType?: string,
) => {
  const r = new XMLHttpRequest();
  r.onload = function () {
    if (onComplete) {
      onComplete(r.responseText);
    }
  };
  r.open(method, url, true);
  r.setRequestHeader('Content-type', contentType || 'text/plain');
  r.send(obj);
};
const send = (path: string, obj: string, onComplete?: (res: any) => void, contentType?: string) =>
  request('POST', `${apiHost}/report-error/${path}`, obj, onComplete, contentType);

const sendError = (
  errorMsg: string,
  url: string,
  lineNumber?: number,
  columnNumber?: number,
  stack?: string,
  name?: string,
) => {
  const str =
    'msg=' +
    encodeURIComponent(errorMsg) +
    '&url=' +
    encodeURIComponent(url || '') +
    '&no=' +
    encodeURIComponent(lineNumber || '') +
    '&col=' +
    encodeURIComponent(columnNumber || '') +
    '&name=' +
    encodeURIComponent(name || '') +
    '&stack=' +
    encodeURIComponent(stack || '') +
    '&r=' +
    encodeURIComponent(location.href) +
    '&w=' +
    window.innerWidth +
    '&h=' +
    window.innerHeight;
  send('err', str, function (response) {
    if (response && response !== '"done"' && response.indexOf) {
      if (response.indexOf('c') !== -1 && lineNumber) {
        request('GET', url, '', function (html) {
          //the number 9 below gives us a context of 8 lines above and below
          const firstLineIdx = Math.max(0, lineNumber - 9);
          send(
            'lines',
            JSON.stringify({
              id: response,
              l: html.split('\n').slice(firstLineIdx, lineNumber + 9),
            }),
            undefined,
            'application/json',
          );
        });
      }
    }
  });
};

export const initTrackErrors = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const handler = (
    event: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
  ) => {
    const stack = error?.stack,
      name = error?.name,
      msg = error?.message || (event as string);
    sendError(msg, source!, lineno, colno, stack, name);
  };

  window.onerror = handler;
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) =>
    handler(e.reason, undefined, undefined, undefined, new Error()),
  );
};
