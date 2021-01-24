import { init, register, getLocaleFromNavigator } from 'svelte-i18n';

export const i18nInit = () => {
  register('en', () => import('./locales/en.json'));
  register('ru', () => import('./locales/ru.json'));

  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  });
};
