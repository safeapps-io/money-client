const sveltePreprocess = require('svelte-preprocess');

module.exports = {
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
