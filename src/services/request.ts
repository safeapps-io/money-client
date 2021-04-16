import { HTTPError, AuthError, FormError } from './errors';
import { apiPath } from './config';
import { dropUserData } from './auth/dropUserData';

type RequestParams = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path?: string;
  queryParams?: { [param: string]: string };
  headers?: { [header: string]: string };
  data?: Object;
  rootPath?: string;
};

export const get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  del = 'DELETE';

export const request = async <Res = {}>({
  method = get,
  path = '',
  queryParams,
  headers = {},
  data = {},
  rootPath = apiPath,
}: RequestParams) => {
  const fullPath = `${rootPath}${path}${queryParams ? '?' + new URLSearchParams(queryParams) : ''}`,
    body = method === get ? undefined : JSON.stringify(data),
    req = new Request(fullPath, {
      method,
      body,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
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
