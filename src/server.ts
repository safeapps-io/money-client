import { config } from 'dotenv';
config();

import express from 'express';
import helmet from 'helmet';
import * as sapper from '@sapper/server';
import { nanoid } from 'nanoid';

import { i18nInit } from '@/core/i18n';
import { apiHostNoPath, wsHostNoPath } from '@/services/config';

const { PORT } = process.env,
  analyticsHost = `sa.${process.env.ROOT_HOST}`;

i18nInit();

express()
  .set('trust proxy', true)
  .use((_, res, next) => {
    res.locals.nonce = nanoid();
    next();
  })
  .use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // "unsafe-eval" should be removed once Sapper no longer relies on shimport
          // @ts-expect-error
          scriptSrc: ["'self' 'unsafe-eval'", (_req, res) => `'nonce-${res.locals.nonce}'`],
          styleSrc: ["'self' 'unsafe-inline'"],
          connectSrc: ["'self'", apiHostNoPath, wsHostNoPath, analyticsHost].concat(
            process.env.NODE_ENV == 'development' ? ['http://localhost:10000'] : [],
          ),
          imgSrc: ["'self'", 'data:', analyticsHost],
        },
      },
    }),
  )
  .use(express.static('static', { dotfiles: 'ignore' }))
  .use(sapper.middleware() as any)
  .listen(PORT);
