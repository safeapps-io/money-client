const { config } = require('dotenv-flow');
config();

const sveltePreprocess = require('svelte-preprocess'),
  path = require('path'),
  node = require('@sveltejs/adapter-node'),
  pkg = require('./package.json');

const mode = process.env.NODE_ENV,
  dev = mode === 'development',
  version = `${pkg.version}${dev ? ' (dev)' : ''}`;

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: node(),
    vite: () => ({
      define: {
        'process.env.VERSION': JSON.stringify(version),
        'process.env.API_WS_SCHEME': JSON.stringify(process.env.API_WS_SCHEME),
        'process.env.API_SCHEME': JSON.stringify(process.env.API_SCHEME),
        'process.env.API_HOST': JSON.stringify(process.env.API_HOST),
        'process.env.API_PORT': JSON.stringify(process.env.API_PORT),
        'process.env.SITE_SCHEME': JSON.stringify(process.env.SITE_SCHEME),
        'process.env.SITE_HOST': JSON.stringify(process.env.SITE_HOST),
        'process.env.SITE_PORT': JSON.stringify(process.env.SITE_PORT),
        'process.env.ROOT_HOST': JSON.stringify(process.env.ROOT_HOST),
      },
      resolve: {
        alias: {
          $core: path.resolve('src/core'),
        },
        dedupe: ['svelte'],
      },
      ssr: {
        noExternal: Object.keys(pkg.dependencies || {}),
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
