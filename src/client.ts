import * as sapper from '@sapper/app';
import { i18nInit } from '@/core/i18n';
import { matchMediaInit } from '@/core/matchMedia';

i18nInit();
matchMediaInit();

sapper.start({
  target: document.querySelector('#app') as Node,
});
