<script>
  import FullpageRequest from '@/components/user/fullpageRequest.svelte';

  import { _ } from 'svelte-i18n';
  import { goto, stores } from '@sapper/app';

  import { appPath } from '@/core/routes';
  import { AuthService } from '@/services/auth/authService';

  const { page } = stores(),
    redirect = () => goto(appPath);
</script>

<FullpageRequest
  req={() => AuthService.unsubscribe($page.params.token)}
  successMessage={$_('common.form.okNotif')}
  errorMessage={$_('common.errors.badLink')}
  on:success={redirect}
  on:fail={redirect} />
