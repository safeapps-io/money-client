const apiPort = process.env.API_PORT ? ':' + process.env.API_PORT : '',
  sitePort = process.env.NODE_ENV == ('development' as string) ? `:${process.env.SITE_PORT}` : '',
  rootApiAppendix = 'money';

export const apiHostNoPath = `${process.env.API_SCHEME}://${process.env.API_HOST}${apiPort}`,
  apiHost = `${apiHostNoPath}/${rootApiAppendix}`;

export const wsHostNoPath = `${process.env.API_WS_SCHEME}://${process.env.API_HOST}${apiPort}`,
  wsHost = `${wsHostNoPath}/${rootApiAppendix}`;

export const siteHost = `${process.env.SITE_SCHEME}://${process.env.SITE_HOST}${sitePort}`;

export const apiPath = `${apiHost}/api`,
  adminPath = `${apiHost}/admin`,
  wsPath = `${wsHost}/ws`;
