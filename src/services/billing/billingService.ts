import type { PlanFull, Providers } from '$stores/billing';
import { post, request as apiRequest } from '$services/request';
import { billingPath } from '$services/config';

export class BillingService {
  private static request<T>(props: Omit<Parameters<typeof apiRequest>['0'], 'rootPath'>) {
    return apiRequest<T>({ ...props, rootPath: billingPath });
  }

  static getPlan() {
    return this.request<PlanFull>({ path: '/plan' });
  }

  static createCharge(provider: Providers) {
    return this.request<{ link: string }>({ method: post, path: `/charge/${provider}` });
  }
}
