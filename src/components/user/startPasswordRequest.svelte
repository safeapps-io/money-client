<script lang="typescript">
  import type { UserEncrState } from '$stores/user';

  import Modal from '$components/elements/modal.svelte';
  import EnterMasterPassword from './enterMasterPassword.svelte';
  import SetNewMasterPassword from './setNewMasterPassword.svelte';
  import Logout from './logout.svelte';

  import { _ } from 'svelte-i18n';

  import { encryptionKeysStateStore } from '$stores/encr/keysState';

  export let user: UserEncrState;

  let userId: string,
    userHasSetPasswordInPast: boolean,
    b64salt: string,
    b64InvitePublicKey: string,
    b64EncryptedInvitePrivateKey: string;
  $: userHasSetPasswordInPast = !!user.b64salt;
  $: {
    userId = user.id;
    if (user.b64salt) {
      b64salt = user.b64salt;
      b64InvitePublicKey = user.b64InvitePublicKey!;
      b64EncryptedInvitePrivateKey = user.b64EncryptedInvitePrivateKey!;
    }
  }

  // Basically, we disable the modal as soon as the encryption key is set.
  $: active = !$encryptionKeysStateStore.encryptionKeySet;
</script>

<Modal bind:active noBox forceScale canBeVoluntarilyClosed={false}>
  {#if userHasSetPasswordInPast}
    <h1 class="title">
      {$_('cmps.masterPassword.old.hey', { values: { username: user.username } })}
      👋

      <Logout class="has-text-dotted has-text-link is-size-7 pl-3" display="inline" />
    </h1>
    <EnterMasterPassword {b64salt} {b64InvitePublicKey} {b64EncryptedInvitePrivateKey} />
  {:else}
    <h1 class="title">{$_('cmps.masterPassword.old.pass.set')}</h1>
    <SetNewMasterPassword {userId} isFirstPassword />
  {/if}
</Modal>
