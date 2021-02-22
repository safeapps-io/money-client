import { config as dotenvConfig } from 'dotenv-flow';
dotenvConfig();

import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import sveltePreprocess from 'svelte-preprocess';
import pkg from './package.json';

const mode = process.env.NODE_ENV,
  dev = mode === 'development',
  legacy = !!process.env.SAPPER_LEGACY_BUILD,
  sourcemap = dev ? 'inline' : true,
  version = `${pkg.version}${dev ? ' (dev)' : ''}`;

const onwarn = (warning, onwarn) =>
  // Shows up after I added svelte-i18n for some reason, safe to ignore
  warning.code === 'THIS_IS_UNDEFINED' ||
  // Defaults from sapper template: https://github.com/sveltejs/sapper-template/blob/master/rollup.config.js#L14
  (warning.code === 'MISSING_EXPORT' && /'preload'/.test(warning.message)) ||
  // Strange issue with bundler making a warning, that I do not use this import, which is not true
  warning.message.includes(`svelte-css-vars`) ||
  (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) ||
  onwarn(warning);

const preprocess = sveltePreprocess({
  sourceMap: true,
  defaults: {
    script: 'typescript',
    style: 'scss',
  },
  postcss: true,
  scss: {
    prependData: `@import 'src/styles/importable';`,
  },
});

const commonReplace = {
  'process.env.NODE_ENV': JSON.stringify(mode),
  'process.env.VERSION': JSON.stringify(version),
  'process.env.API_WS_SCHEME': JSON.stringify(process.env.API_WS_SCHEME),
  'process.env.API_SCHEME': JSON.stringify(process.env.API_SCHEME),
  'process.env.API_HOST': JSON.stringify(process.env.API_HOST),
  'process.env.API_PORT': JSON.stringify(process.env.API_PORT),
  'process.env.SITE_SCHEME': JSON.stringify(process.env.SITE_SCHEME),
  'process.env.SITE_HOST': JSON.stringify(process.env.SITE_HOST),
  'process.env.SITE_PORT': JSON.stringify(process.env.SITE_PORT),
};

export default {
  client: {
    input: config.client.input().replace(/\.js$/, '.ts'),
    output: { ...config.client.output(), sourcemap },
    plugins: [
      replace({
        'process.browser': true,
        // process.browser raises a TS error
        'process.env.BROWSER': true,
        ...commonReplace,
      }),
      url({
        sourceDir: path.resolve(__dirname, 'src/node_modules/images'),
        publicPath: '/client/',
      }),
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
      }),
      resolve({
        browser: true,
        dedupe: ['svelte'],
        moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
      }),
      json(),
      commonjs(),
      typescript({ sourceMap: true }),
      svelte({
        preprocess,
        compilerOptions: {
          dev,
          hydratable: true,
        },
      }),

      legacy &&
        babel({
          extensions: ['.js', '.ts', '.mjs', '.html', '.svelte'],
          babelHelpers: 'runtime',
          exclude: ['node_modules/@babel/**'],
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            [
              '@babel/plugin-transform-runtime',
              {
                useESModules: true,
              },
            ],
          ],
        }),

      !dev &&
        terser({
          module: true,
        }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: { server: config.server.input().server.replace(/\.js$/, '.ts') },
    output: { ...config.server.output(), sourcemap },
    plugins: [
      replace({
        'process.browser': false,
        ...commonReplace,
      }),
      resolve({
        dedupe: ['svelte'],
        moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
      }),
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
      }),
      url({
        sourceDir: path.resolve(__dirname, 'src/node_modules/images'),
        publicPath: '/client/',
        emitFiles: false, // already emitted by client build
      }),
      json(),
      commonjs(),
      typescript({ sourceMap: true }),
      svelte({
        preprocess,
        emitCss: false,
        compilerOptions: {
          generate: 'ssr',
          dev,
        },
      }),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require('module').builtinModules || Object.keys(process.binding('natives')),
    ),

    preserveEntrySignatures: 'strict',
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input().replace(/\.js$/, '.ts'),
    output: { ...config.serviceworker.output(), sourcemap },
    plugins: [
      replace({
        'process.browser': true,
        ...commonReplace,
      }),
      resolve(),
      commonjs(),
      typescript({ sourceMap: true }),
      !dev && terser(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },
};
