<script>
  import Modal from '$components/elements/modal.svelte';
  import ResetPassword from '$components/auth/resetPassword.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { loginPath } from '$core/routes';

  const redirect = () => goto(loginPath);
</script>

<Modal active noBox forceScale canBeVoluntarilyClosed={false}>
  <ResetPassword token={$page.params.token} on:success={redirect} on:invalid={redirect} />
</Modal>
