import { request } from '@/services/request';
import { markAsRemoteDeleted } from '@/stores/decr/deleted';

export class SyncService {
  private static prefix = '/data/';

  static async deleteEntities(data: { [walletId: string]: { toDelete: string[]; ids: string[] } }) {
    const walletIdToToDelete: { [walletId: string]: string[] } = {},
      walletIdToIds: { [walletId: string]: string[] } = {};

    for (const [walletId, obj] of Object.entries(data)) {
      walletIdToToDelete[walletId] = obj.toDelete;
      walletIdToIds[walletId] = obj.ids;
    }

    await request({
      method: 'DELETE',
      path: `${this.prefix}entity`,
      data: walletIdToToDelete,
    });
    markAsRemoteDeleted(walletIdToIds);
  }
}
