import { getSortedByTitleStore } from '$utils/getSortedStore';

import { createDecrEntityStore } from './base';
import type { Category } from './types';
import { EntityTypes } from './types';

export const {
    store: categoryStore,
    currentWalletStore: currentWalletCategoryStore,
    add: categoryAdd,
    bulkAdd: categoryBulkAdd,
    overwrite: categoryOverwrite,
    update: categoryUpdate,
    reset: categoryReset,
    deletedDataConsistencyGuardStore: categoryDeleteGuard,
  } = createDecrEntityStore<Category>(EntityTypes.category),
  categorySortedByTitleStore = getSortedByTitleStore(
    currentWalletCategoryStore,
    cat => cat.decr.name,
  );
