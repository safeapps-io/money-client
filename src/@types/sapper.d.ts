declare module '@sapper/app' {
  import { Readable, Writable } from 'svelte/store';

  interface Redirect {
    statusCode: number;
    location: string;
  }

  function goto(href: string, opts?: { replaceState: boolean }): Promise<unknown>;
  function prefetch(href: string): Promise<{ redirect?: Redirect; data?: unknown }>;
  function prefetchRoutes(pathnames: string[]): Promise<unknown>;
  function start(opts: { target: Node }): Promise<unknown>;
  const stores: () => {
    session: Writable<any>;
    preloading: Readable<boolean>;
    page: Readable<{
      host: string;
      path: string;
      params: { [key: string]: string };
      query: { [key: string]: string };
    }>;
  };

  export { goto, prefetch, prefetchRoutes, start, stores };
}

declare module '@sapper/server' {
  import { RequestHandler } from 'express';

  interface MiddlewareOptions {
    session?: (req: Express.Request, res: Express.Response) => unknown;
    ignore?: unknown;
  }

  function middleware(opts: MiddlewareOptions): RequestHandler;

  export { middleware };
}

declare module '@sapper/service-worker' {
  const timestamp: number;
  const files: string[];
  const shell: string[];
  const routes: { pattern: RegExp }[];

  export { timestamp, files, files as assets, shell, routes };
}
