<script>
  import FullpageRequest from '$components/user/fullpageRequest.svelte';

  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { loginPath } from '$core/routes';
  import { AuthService } from '$services/auth/authService';

  const redirect = () => goto(loginPath);
</script>

<FullpageRequest
  req={() => AuthService.validateEmail($page.params.token)}
  successMessage={$_('cmps.user.email.verifiedNotif')}
  errorMessage={$_('common.errors.linkExpired')}
  on:success={redirect}
  on:fail={redirect} />
