import { config } from 'dotenv-flow';

const mode = process.env.NODE_ENV,
  dev = mode === 'development';

config(process.env.STAGE ? { node_env: 'stage' } : undefined);

import sveltePreprocess from 'svelte-preprocess';
import path from 'path';
import { readFileSync } from 'fs';
import node from '@sveltejs/adapter-node';
import helmet from 'helmet';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

const version = `${pkg.version}${dev ? ' (dev)' : ''}`;

const envKeys = [
    'API_WS_SCHEME',
    'API_SCHEME',
    'API_HOST',
    'API_PORT',
    'SITE_SCHEME',
    'SITE_HOST',
    'SITE_PORT',
    'ROOT_HOST',
  ],
  apiHost = `${process.env.API_SCHEME}://${process.env.API_HOST}:${process.env.API_PORT}`,
  analyticsHost = `sa.${process.env.ROOT_HOST}`;

export default {
  kit: {
    adapter: node(),
    vite: () => ({
      define: {
        'process.env.VERSION': JSON.stringify(version),
        ...envKeys.reduce(
          (acc, key) => ((acc[`process.env.${key}`] = JSON.stringify(process.env[key])), acc),
          {},
        ),
      },
      resolve: {
        alias: {
          $components: path.resolve('src/components'),
          $strict: path.resolve('src/components/strict'),
          $static: path.resolve('static/static'),
          $validators: path.resolve('src/components/strict/validators'),
          $core: path.resolve('src/core'),
          $services: path.resolve('src/services'),
          $stores: path.resolve('src/stores'),
          $utils: path.resolve('src/utils'),
        },
        dedupe: ['svelte'],
      },
      plugins: [
        (() => ({
          name: 'configure-server',
          configureServer(server) {
            server.middlewares.use(
              helmet({
                contentSecurityPolicy: {
                  // TODO: those are not restricting at all. Rework after Kit adds support for it.
                  // https://github.com/sveltejs/kit/issues/887
                  // Same headers are applied in nginx config.
                  directives: {
                    defaultSrc: ["'self' 'unsafe-inline'"],
                    scriptSrc: ["'self' 'unsafe-inline'"],
                    styleSrc: ["'self' 'unsafe-inline'"],
                    connectSrc: ["'self'", apiHost, analyticsHost, 'ws://localhost:24678/'],
                    imgSrc: ["'self' data:", analyticsHost],
                  },
                },
              }),
            );
          },
        }))(),
      ],
      ssr: {
        /**
         * Currently we have problems with 3 deps:
         * 1. direct one: emoji-regex. It has some problems with ESM.
         * 2. and two deps of svelte-i18n: fast-memoize, deepmerge. They also have problems with ESM.
         * 3. nanoid. It keeps throwing errors, because SSR has no secure random generator, lol.
         */
        noExternal: Object.keys(pkg.dependencies || {}).filter(
          name => !['emoji-regex', 'svelte-i18n', 'nanoid'].includes(name),
        ),
      },
      optimizeDeps: {
        include: ['d3'],
      },
      build: { sourcemap: true },
    }),
  },
  preprocess: sveltePreprocess({
    sourceMap: true,
    defaults: {
      script: 'typescript',
      /**
       * For now it is meaningless, because we still need to add lang='scss' to every component.
       * Reason: https://github.com/sveltejs/language-tools/issues/747
       *
       * But it is still a little simpler to remember we always have scss everywhere.
       */
      style: 'scss',
    },
    postcss: true,
    scss: {
      prependData: `@import 'src/styles/importable';`,
    },
  }),
};
