import { differenceInMilliseconds } from 'date-fns';

export type TokenParsed = {
  id: string;
  exp: number;
};

export class TokenService {
  private static parseToken(accessToken: string) {
    const base64Url = accessToken.split('.')[1],
      base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'),
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
      { exp, id } = JSON.parse(jsonPayload) as TokenParsed;

    return { id, exp: exp * 1000 };
  }

  static isTokenSafeToUse(accessToken: string) {
    const parsed = this.parseToken(accessToken);

    // 5 seconds to expiration
    return differenceInMilliseconds(parsed.exp, new Date()) > 5000;
  }

  static timeoutToRefreshToken(accessToken: string) {
    const parsed = this.parseToken(accessToken);

    // 1 minute before expiration
    return differenceInMilliseconds(parsed.exp, new Date()) - 60 * 1000;
  }
}
