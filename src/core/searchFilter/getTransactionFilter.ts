import { areArraysOverlapping } from '@/utils/array';
import {
  SearchFilter,
  FullEntity,
  CorrectionTransaction,
  ReferenceTransaction,
  Transaction,
  EntityTypes,
} from '@/stores/decr/types';

export const getTransactionFilter = ({
  searchFilter,
  shouldShowBalance,
}: {
  searchFilter: FullEntity<SearchFilter>;
  shouldShowBalance: boolean;
}) => {
  const { category, tag } = searchFilter.decr.parameters;

  return (transaction: FullEntity<Transaction | CorrectionTransaction | ReferenceTransaction>) => {
    const { decr } = transaction;

    /**
     * Balance transaction. They basically ignore categories and tags, but are not shown, if
     * filter has any narrowing parameters at all.
     */
    if (decr.type !== EntityTypes.transaction) return shouldShowBalance;

    // Drafts are always excluded from all analytics
    if (decr.isDraft) return false;

    const categoryId = decr.categoryId || '',
      tags = decr.tags || [];

    return (
      (!category.oneOf.length || category.oneOf.includes(categoryId)) &&
      (!category.noneOf.length || !category.noneOf.includes(categoryId)) &&
      (!tag.oneOf.length || areArraysOverlapping(tag.oneOf, tags)) &&
      (!tag.noneOf.length || !areArraysOverlapping(tag.noneOf, tags))
    );
  };
};
