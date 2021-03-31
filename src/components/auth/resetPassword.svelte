<script>
  import { Form, PasswordField } from '$components/strict';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { AuthService } from '$services/auth/authService';
  import { getContext } from 'svelte/internal';

  export let token: string;

  const dispatch = createEventDispatcher(),
    successNotif = getContext('success'),
    dangerNotif = getContext('danger'),
    success = async (data: { password: string }) => {
      await AuthService.setPasswordFromToken({ ...data, token });
      successNotif($_('cmps.user.password.changed'));
      dispatch('success');
    };

  let isValid = false;
  $: AuthService.isResetPasswordTokenValid(token)
    .then(() => (isValid = true))
    .catch(() => {
      isValid = false;
      dangerNotif($_('common.errors.linkExpired'));
      dispatch('invalid');
    });
</script>

<Form {success} buttonText={$_('common.form.change')} formDisabled={!isValid}>
  <PasswordField label={$_('cmps.user.password.new')} />
</Form>
