import { dev } from '$app/env';
import { nanoid } from 'nanoid';

const apiPort = process.env.API_PORT ? ':' + process.env.API_PORT : '',
  sitePort = dev ? `:${process.env.SITE_PORT}` : '',
  rootApiAppendix = 'money';

export const apiHostNoPath = `${process.env.API_SCHEME}://${process.env.API_HOST}${apiPort}`,
  apiHost = `${apiHostNoPath}/${rootApiAppendix}`;

export const siteHost = `${process.env.SITE_SCHEME}://${process.env.SITE_HOST}${sitePort}`;

export const apiPath = `${apiHost}/api`,
  billingPath = `${apiHost}/billing`;

let clientId: string | null = null;
export const getSSEClientId = () => clientId || (clientId = nanoid()),
  ssePath = `${apiPath}/sse?clientId=${getSSEClientId()}`;

export const supportEmail = 'hey@safeapps.io';
