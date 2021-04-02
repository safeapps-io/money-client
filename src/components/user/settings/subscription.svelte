<script>
  import { CheckboxInput, Field, Form } from '$components/strict';

  import { _ } from 'svelte-i18n';

  import { ensureBoolean } from '$core/strict/boolean';
  import { userEncrStore } from '$stores/user';
  import { AuthService } from '$services/auth/authService';

  $: field = {
    name: 'isSubscribed',
    inputValue: $userEncrStore!.isSubscribed,
    hideLabel: true,
    label: $_('cmps.user.signup.subscribe'),
    clean: [ensureBoolean],
  };

  const success = async ({ isSubscribed }: { isSubscribed: boolean }) =>
    AuthService.updateUser({ isSubscribed });
</script>

<Form {success} buttonText={$_('common.form.save')} notificationText={$_('common.form.okNotif')}>
  <Field {field}>
    <CheckboxInput />
  </Field>
</Form>
