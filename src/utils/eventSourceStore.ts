import { readable } from 'svelte/store';

export const eventSourceStoreConstructor = <
  T extends { type: string; data: Object | string | number }
>({
  path,
  credentials = true,
  handler,
  onOpen,
}: {
  path: string;
  credentials?: boolean;
  handler: (message: T) => void;
  onOpen?: () => void;
}) =>
  readable<null | string>(null, set => {
    const evt = new EventSource(path, { withCredentials: credentials });

    evt.onmessage = event => {
      const message = JSON.parse(event.data) as T;
      if (message.type == 'clientId') set(message.data as string);
      else handler(message);
    };

    evt.onerror = err => console.error(`SSE error: ${path}`, err);
    if (onOpen) evt.onopen = onOpen;

    return () => evt.close();
  });
