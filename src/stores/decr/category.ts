import { getSortedByTitleStore } from '@/utils/getSortedStore';

import { createDecrEntityStore } from './base';
import { Category, EntityTypes } from './types';

export const {
    store: categoryStore,
    currentWalletStore: currentWalletCategoryStore,
    add: categoryAdd,
    bulkAdd: categoryBulkAdd,
    overwrite: categoryOverwrite,
    update: categoryUpdate,
    deletedDataConsistencyGuardStore: categoryDeleteGuard,
  } = createDecrEntityStore<Category>(EntityTypes.category),
  categorySortedByTitleStore = getSortedByTitleStore(
    currentWalletCategoryStore,
    cat => cat.decr.name,
  );
