<script>
  import { goto, stores } from '@sapper/app';

  import { loginPath } from '@/core/routes';

  import Modal from '@/components/elements/modal.svelte';
  import ResetPassword from '@/components/auth/forms/resetPassword.svelte';

  const { page } = stores(),
    redirect = () => goto(loginPath);

  let token: string;
  $: token = $page.params.token;
</script>

<Modal active canBeVoluntarilyClosed={false}>
  <ResetPassword {token} on:success={redirect} on:invalid={redirect} />
</Modal>
