const lsKey = 'cookie-banner';

export const hasClosedBanner = () => !!localStorage.getItem(lsKey),
  setClosedBanner = () => localStorage.setItem(lsKey, '1');
