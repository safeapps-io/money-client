/**
 * Some generic network error. Both network level and request level.
 */
export class HTTPError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}

/**
 * Problems with refresh/access tokens.
 */
export class AuthError extends Error {
  constructor() {
    super();
  }
}

/**
 * Holds error config for form fields. Should be handled by form components separately.
 */
export class FormError extends Error {
  constructor(
    public errors: {
      code: number;
      fieldErrors?: { [fieldname: string]: string[] };
      message?: string;
    },
    public remote = false,
  ) {
    super();
  }
}
