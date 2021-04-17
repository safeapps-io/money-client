const { config } = require('dotenv-flow');
config();

const sveltePreprocess = require('svelte-preprocess'),
  path = require('path'),
  node = require('@sveltejs/adapter-node'),
  pkg = require('./package.json');

const mode = process.env.NODE_ENV,
  dev = mode === 'development',
  version = `${pkg.version}${dev ? ' (dev)' : ''}`;

const envKeys = [
  'API_WS_SCHEME',
  'API_SCHEME',
  'API_HOST',
  'API_PORT',
  'SITE_SCHEME',
  'SITE_HOST',
  'SITE_PORT',
  'ROOT_HOST',
];

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
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
          $validators: path.resolve('src/components/strict/validators'),
          $core: path.resolve('src/core'),
          $services: path.resolve('src/services'),
          $stores: path.resolve('src/stores'),
          $utils: path.resolve('src/utils'),
        },
        dedupe: ['svelte'],
      },
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
