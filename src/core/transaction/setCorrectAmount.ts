export type TransactionFieldsForm = {
  walletId?: string;

  sign: number;
  amount: number;
  categoryId: string;
  walletUserId?: string;
  datetime: number;
  description?: string;
  tags?: string[];

  currency: undefined;
  originalAmount: undefined;
};
export type PreprocessedTransactionFields = Omit<TransactionFieldsForm, 'sign'>;

export const setCorrectAmount = (
  dataFromForm: TransactionFieldsForm,
): PreprocessedTransactionFields => {
  const { sign, ...rest } = dataFromForm,
    amount = dataFromForm.amount * sign;

  return { ...rest, amount };
};
