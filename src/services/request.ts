import { HTTPError, AuthError, FormError } from './errors';
import { adminPath, apiPath } from './config';
import { dropUserData } from './auth/dropUserData';

type RequestParams = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path?: string;
  data?: Object;
  rootPath?: string;
};

export const request = async <Res = {}>({
  method = 'GET',
  path = '',
  data = {},
  rootPath = apiPath,
}: RequestParams) => {
  const body = method === 'GET' ? undefined : JSON.stringify(data),
    req = new Request(`${rootPath}${path}`, {
      method,
      body,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
    });

  let res: Response, json: Res;
  try {
    res = await fetch(req);
    json = await res.json();
  } catch (e) {
    throw new HTTPError(e.message, 1000);
  }
  if (!res.ok) {
    switch (res.status) {
      case 401:
      case 403:
        dropUserData();
        throw new AuthError();

      case 400:
        throw new FormError(json as any, true);

      default:
        throw new HTTPError(JSON.stringify(json), res.status);
    }
  }

  return { json, res };
};

export const adminRequest = <Res = {}>(params: RequestParams) =>
  request<Res>({ ...params, path: `${params.path}`, rootPath: adminPath });
