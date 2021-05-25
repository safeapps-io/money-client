import { areArraysOverlapping } from '$utils/array';
import type {
  SearchFilter,
  FullEntity,
  CorrectionTransaction,
  ReferenceTransaction,
  Transaction,
} from '$stores/decr/types';
import { EntityTypes } from '$stores/decr/types';

export const getTransactionFilter = ({
  searchFilter,
  shouldShowBalance,
}: {
  searchFilter: FullEntity<SearchFilter>;
  shouldShowBalance: boolean;
}) => {
  const { category, tag, query } = searchFilter.decr.parameters;

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

    // We build a huge string in which we can look stuff up with a single `.includes`.
    const stringToSearchIn = `${decr.description || ''}${decr.currency || ''}${(
      decr.tags || []
    ).join()}${decr.autocomplete.accountNumber || ''}${decr.autocomplete.merchant || ''}`;

    return (
      stringToSearchIn.includes(query || '') &&
      (!category.oneOf.length || category.oneOf.includes(categoryId)) &&
      (!category.noneOf.length || !category.noneOf.includes(categoryId)) &&
      (!tag.oneOf.length || areArraysOverlapping(tag.oneOf, tags)) &&
      (!tag.noneOf.length || !areArraysOverlapping(tag.noneOf, tags))
    );
  };
};
