import { config } from 'dotenv';
config();

import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { i18nInit } from '@/core/i18n/index';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

i18nInit();

polka() // You can also use Express
  .use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware({}))
  .listen(PORT, (err: any) => {
    if (err) console.log('error', err);
  });
