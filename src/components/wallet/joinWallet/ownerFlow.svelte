<script>
  import type { OwnerInviteValidate } from '@/services/invite/inviteStages';
  import type { Wallet } from '@/stores/wallet';

  import Modal from '@/components/elements/modal.svelte';

  import { _ } from 'svelte-i18n';

  import { invitationError, invitationResolution } from '@/services/invite/inviteWsActions';
  import { InviteService } from '@/services/invite/inviteService';
  import { walletDataStore } from '@/stores/decr/wallet';
  import { removeInvite } from '@/services/invite/inviteStages';

  export let inviteToValidate: OwnerInviteValidate | undefined, userId: string;

  let active = false,
    modalData:
      | {
          hash: { emojiString: string; hashHex: string };
          joiningUsername: string;
          walletName: string;
        }
      | undefined = undefined,
    wallet: Wallet | undefined = undefined;

  const validateInvite = async (data: OwnerInviteValidate) => {
    try {
      const { hash, wallet: _wallet } = await InviteService.ownerValidateInitialRequest({
        b64InviteString: data.b64InviteString,
        b64PublicECDHKey: data.joiningUser.b64PublicECDHKey,
      });
      wallet = _wallet;
      modalData = {
        hash,
        joiningUsername: data.joiningUser.username,
        walletName: Object.values($walletDataStore).find(wd => wd.walletId == wallet!.id)!.decr
          .name,
      };
      active = true;
    } catch (error) {
      $invitationError({
        joiningUserId: data.joiningUser.id,
        b64InviteSignatureByJoiningUser: data.b64InviteSignatureByJoiningUser,
        b64InviteString: data.b64InviteString,
      });
    }
  };

  let loading = false,
    error = false;

  const resolution = async (allowJoin: boolean) => {
      loading = true;

      const { joiningUser, b64InviteString, b64InviteSignatureByJoiningUser } = inviteToValidate!;
      let obj = {
        joiningUserId: joiningUser.id,
        b64InviteSignatureByJoiningUser: b64InviteSignatureByJoiningUser,
        b64InviteString: b64InviteString,
      };
      try {
        if (allowJoin)
          obj = {
            ...obj,
            ...(await InviteService.ownerAllowJoin({
              walletChest: wallet?.users.find(u => u.id == userId)?.WalletAccess.chest || '',
              b64PublicECDHKey: joiningUser.b64PublicECDHKey,
            })),
          };

        $invitationResolution({ ...obj, allowJoin });
        close();
      } catch (error) {
        error = true;
        $invitationError(obj);
      }
    },
    close = () => {
      active = false;
      error = false;
      loading = false;
      modalData = undefined;

      /**
       * TODO: get rid of this workaround when it's clarified if Svelte has a bug.
       * https://github.com/sveltejs/svelte/issues/5394
       */
      setTimeout(() => removeInvite(inviteToValidate!.b64InviteString), 700);
    };

  $: inviteToValidate && validateInvite(inviteToValidate);

  // Sometimes I hate TS. Active and modalData are always synced
  $: modalDataChecked = modalData!;
</script>

<Modal bind:active canBeVoluntarilyClosed={false} noBox forceScale>
  <div class="has-text-centered">
    <p class="has-text-weight-bold">{$_('cmps.wallet.userAccess.invite.owner.title')}</p>
    <p>
      {@html $_('cmps.wallet.userAccess.invite.owner.userData', {
        values: {
          username: modalDataChecked.joiningUsername,
          walletName: modalDataChecked.walletName,
          tagO: '<span class="has-text-weight-bold">',
          tagC: '</span>',
        },
      })}
    </p>
    <div class="columns is-centered is-mobile my-3">
      <div class="column is-narrow">
        <button
          class="button is-success is-outlined"
          class:is-color-loading={loading}
          disabled={error}
          on:click={() => resolution(true)}>{$_('cmps.wallet.userAccess.invite.owner.allow')}</button>
      </div>
      <div class="column is-narrow">
        <button
          class="button is-danger is-outlined ml-3"
          class:is-color-loading={loading}
          disabled={error}
          on:click={() => resolution(false)}>{$_('cmps.wallet.userAccess.invite.owner.disallow')}</button>
      </div>
    </div>
    <p>{$_('cmps.wallet.userAccess.invite.keySecurity')}</p>

    <p title={`SHA-512: ${modalDataChecked.hash.hashHex}`}>{modalDataChecked.hash.emojiString}</p>

    {#if error}
      <p class="has-text-danger">{$_('common.errors.tryLater')}</p>
    {/if}
  </div>
</Modal>
