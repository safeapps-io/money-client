import type { SearchFilter, WalletData, FullEntity } from '$stores/decr/types';

export const shouldShowBalance = ({
  walletData,
  searchFilter,
}: {
  walletData: FullEntity<WalletData>;
  searchFilter: FullEntity<SearchFilter>;
}) => {
  const { category, tag } = searchFilter.decr.parameters;

  return (
    walletData.decr.balance &&
    !(category.oneOf.length || category.noneOf.length || tag.oneOf.length || tag.noneOf.length)
  );
};
