import { config } from 'dotenv';
config();

import express from 'express';
import * as sapper from '@sapper/server';

import { i18nInit } from '@/core/i18n/index';

const { PORT } = process.env;

i18nInit();

express()
  .use(express.static('static'))
  .use(sapper.middleware() as any)
  .listen(PORT);
