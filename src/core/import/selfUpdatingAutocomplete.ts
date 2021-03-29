import {
  autocompleteDataStore,
  noNestedObjectsKey,
  transposeCountObjectToArray,
} from '$stores/decr/autocomplete';

export const getTransposedAutocomplete = (
  startingState: StoreValue<typeof autocompleteDataStore>,
) => ({
  mcc: transposeCountObjectToArray(startingState.mcc),
  merchant: transposeCountObjectToArray(startingState.merchant),
  accountNumber: transposeCountObjectToArray(startingState.accountNumber),
  categoryByPopularity: transposeCountObjectToArray(startingState.categoryByPopularity)[
    noNestedObjectsKey
  ],
});
