## Validation

Validation process is split up into two phases: cleaning and validating.

Clean process is when we make sure we put the raw data into an appropriate format. E.g., we transform text input into a number. If clean methods return undefined, validation is ommited, meaning the value is completely optional.

Validation is when the valid data is checked on its form. If it returns undefined, the validation check has been passed. Otherwise it should return **error code**.

## Error codes

Our idea is that we need to localize error messages. There's no other way to do this but to use `svelte-i18n` messages.

All the common errors should be stored in `common.errors.field` object. The validation function should return a string, which we would concatinate with `common.errors.field.` string to get a key to localized value.

Validation function can also return an object if it needs interpolation of any kind.
