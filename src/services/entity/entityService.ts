import { request, del, post } from '$services/request';
import { markAsRemoteDeleted } from '$stores/decr/deleted';
import { bulkSetEncrEntities } from '$stores/encr/operations';
import type { EncrEntity } from '$stores/encr/store';
import type { ClientChangesData } from './types';

export class EntityService {
  private static prefix = '/entity';

  static async delete(data: { [walletId: string]: { toDelete: string[]; ids: string[] } }) {
    const walletIdToToDelete: { [walletId: string]: string[] } = {},
      walletIdToIds: { [walletId: string]: string[] } = {};

    for (const [walletId, obj] of Object.entries(data)) {
      walletIdToToDelete[walletId] = obj.toDelete;
      walletIdToIds[walletId] = obj.ids;
    }

    await request({
      method: del,
      path: this.prefix,
      data: walletIdToToDelete,
    });
    markAsRemoteDeleted(walletIdToIds);
  }

  static async uploadEntities(clientId: string, data: ClientChangesData) {
    const { json } = await request<EncrEntity[]>({
      method: post,
      path: this.prefix,
      data: { clientId, data },
    });
    bulkSetEncrEntities(json);

    return json;
  }
}
