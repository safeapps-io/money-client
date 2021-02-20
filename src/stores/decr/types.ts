export enum EntityTypes {
  walletData = 'w',

  asset = 'a',

  walletUser = 'wu',
  category = 'c',
  searchFilter = 'sf',

  correctionTransaction = 'bct',
  referenceTransaction = 'brt',

  transaction = 't',
  ignoredTransaction = 'it',

  deleted = 'd',
}

export type CommonDecrEntity = {
  type: EntityTypes;
  created: number;
  updated: number;
  _v: [number, number];
};
export type OmitCommonFields<T> = Omit<T, 'created' | 'updated' | 'type' | '_v'>;
export type BaseDecrEntity = Omit<CommonDecrEntity, 'type'>;
export type FullEntity<S extends CommonDecrEntity> =
  | {
      id: string;
      created: number;
      updated: number;
      walletId: string;
      decr: S;
    }
  | {
      id: string;
      walletId: string;
      decr: S;
    };

export type WalletData = BaseDecrEntity & {
  type: EntityTypes.walletData;

  name: string;
  balance: boolean;
  activeTransactionId?: string;
};

export type Asset = BaseDecrEntity & {
  type: EntityTypes.asset;

  /**
   * For now we name it like this. This is some form of asset identification.
   * It can be currency code ticker or some hardcoded string. A thing to think in future.
   */
  code: string;
};

export type WalletUser = BaseDecrEntity & {
  type: EntityTypes.walletUser;

  name: string;
  color: string;
};

export type Category = BaseDecrEntity & {
  type: EntityTypes.category;

  isIncome: boolean;
  name: string;
  color: string;

  metaId?: string;
};

export enum SearchFilterDatePeriods {
  month = 'month',
  quarter = 'quarter',
  year = 'year',
  all = 'all',
}
export type SearchFilter = BaseDecrEntity & {
  type: EntityTypes.searchFilter;
  name: string;
  // It will be stored in every filter, but it is kind of easier to work with if it is treated as optional
  // Same result anyways
  protected?: boolean;
  group: SearchFilterDatePeriods;
  parameters: {
    datetime?: { startDate?: number; endDate?: number };
    category: {
      oneOf: string[];
      noneOf: string[];
    };
    tag: {
      oneOf: string[];
      noneOf: string[];
    };
  };
};

export type CorrectionTransaction = BaseDecrEntity & {
  type: EntityTypes.correctionTransaction;

  assetId: string;

  amount: number;
  datetime: number;
  userId: string;
};

export type ReferenceTransaction = BaseDecrEntity & {
  type: EntityTypes.referenceTransaction;

  assetId: string;

  amount: number;
  datetime: number;
};

type BaseTransaction = BaseDecrEntity & {
  type: EntityTypes.transaction;

  amount: number;
  datetime: number;
  isDraft: boolean;
  // WalletUser associated to the transaction
  walletUserId: string;
  // Latest updated by this User (not WalletUser)
  userId: string;

  assetId: string;

  categoryId?: string | null;
  description?: string | null;
  tags?: string[] | null;

  autocomplete: {
    mcc?: string;
    accountNumber?: string;
    merchant?: string;
    sourceDataHash?: string;
    id?: string;
  };

  imported?: {
    scheme?: string | null;
    rowData?: string[];
    ofxEl?: string;
  };
};
export type ForeignCurrencyTransactionProps =
  | { originalAmount: undefined; currency: undefined }
  | {
      originalAmount: number;
      currency: string;
    };
export type Transaction = BaseTransaction & ForeignCurrencyTransactionProps;

export type IgnoredTransaction = BaseDecrEntity & {
  type: EntityTypes.ignoredTransaction;

  hash?: string;
  id?: string;
};

export type DeletedEntity = BaseDecrEntity & {
  type: EntityTypes.deleted;
  ids: string[];
  remoteDeleted: boolean;
  initiatorId: string;
};

export type AllEntities =
  | Asset
  | WalletData
  | WalletUser
  | Category
  | SearchFilter
  | CorrectionTransaction
  | ReferenceTransaction
  | Transaction
  | IgnoredTransaction
  | DeletedEntity;

export type AllEntitiesAsHash = {
  [EntityTypes.asset]: Asset;
  [EntityTypes.walletData]: WalletData;
  [EntityTypes.walletUser]: WalletUser;
  [EntityTypes.category]: Category;
  [EntityTypes.searchFilter]: SearchFilter;
  [EntityTypes.correctionTransaction]: CorrectionTransaction;
  [EntityTypes.referenceTransaction]: ReferenceTransaction;
  [EntityTypes.transaction]: Transaction;
  [EntityTypes.ignoredTransaction]: IgnoredTransaction;
  [EntityTypes.deleted]: DeletedEntity;
};

export type JointWallet = { id: string; name: string; walletIds: string[] };
