import { get } from 'svelte/store';

import { tokenStore, TokenState } from '@/stores/token';
import { HTTPError, AuthError, FormError } from './errors';
import { adminPath, apiPath } from './config';

let tokens: TokenState | null, tokenSubscription: () => void;

type RequestParams = {
  method?: string;
  path?: string;
  data?: Object;
  credentials?: boolean;
  rootPath?: string;
};

export const request = async <Res = {}>({
  method = 'GET',
  path = '',
  data = {},
  credentials = true,
  rootPath = apiPath,
}: RequestParams) => {
  if (!tokenSubscription) {
    tokens = get(tokenStore);
    tokenSubscription = tokenStore.subscribe(val => (tokens = val));
  }

  const body = method === 'GET' ? undefined : JSON.stringify(data),
    req = new Request(`${rootPath}${path}`, {
      method,
      body,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

  if (credentials && tokens && tokens.accessToken)
    req.headers.set('Authorization', tokens.accessToken);

  let res, json;
  try {
    res = await fetch(req);
    json = (await res.json()) as Res;
  } catch (e) {
    throw new HTTPError(e.message, 1000);
  }
  if (!res.ok) {
    switch (res.status) {
      case 401:
      case 403:
        throw new AuthError();

      case 400:
        throw new FormError(json as any);

      default:
        throw new HTTPError(JSON.stringify(json), res.status);
    }
  }

  return { json, res };
};

export const adminRequest = <Res = {}>(params: Exclude<RequestParams, 'credentials'>) =>
  request<Res>({ ...params, path: `${params.path}`, rootPath: adminPath });
