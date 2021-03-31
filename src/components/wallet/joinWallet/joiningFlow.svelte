<script>
  import Modal from '$components/elements/modal.svelte';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { AuthService, InvitePurpose, InviteStringTypes } from '$services/auth/authService';
  import { joiningError, launchWalletJoin } from '$services/invite/inviteWsActions';
  import { InviteService } from '$services/invite/inviteService';
  import { InviteResolutions, inviteResolutionStore } from '$services/invite/inviteStages';

  const dispatch = createEventDispatcher();

  export let invite: string;

  const enum JoinStages {
    validatingInvite,
    notWalletInvite,
    ask,
    joinLaunched,
    triggerError,

    joinError,
    joinRejected,
    joinAccepted,
  }

  let active = true,
    stage = JoinStages.validatingInvite;

  const validateInvite = async (inviteString: string) => {
      stage = JoinStages.validatingInvite;
      try {
        const { json: res } = await AuthService.isInviteValid(
          inviteString,
          InvitePurpose.walletJoin,
        );
        if (res.type != InviteStringTypes.wallet) throw new Error();
        stage = JoinStages.ask;
      } catch (error) {
        stage = JoinStages.notWalletInvite;
      }
    },
    finish = () => {
      active = false;
      stage = JoinStages.validatingInvite;
      hashData = undefined;
      $inviteResolutionStore = null;
      dispatch('success');
    };

  let hashData: { emojiString: string; hashHex: string } | undefined = undefined;
  const launchJoin = async () => {
    hashData = undefined;
    try {
      const { ecdhPublicKeyHash, ...requestData } = await InviteService.joiningInitial(invite);
      $launchWalletJoin({ ...requestData, b64InviteString: invite });

      stage = JoinStages.joinLaunched;
      hashData = ecdhPublicKeyHash;
    } catch (error) {
      stage = JoinStages.joinError;
    }
  };

  $: validateInvite(invite);
  $: {
    const state = $inviteResolutionStore;
    if (state) {
      switch (state.type) {
        case InviteResolutions.error:
          stage = JoinStages.joinError;
          break;

        case InviteResolutions.reject:
          stage = JoinStages.joinRejected;
          break;

        case InviteResolutions.accept:
          InviteService.joiningFinal(state.payload)
            .then(() => (stage = JoinStages.joinAccepted))
            .catch(() => {
              $joiningError({ b64InviteString: invite });
              stage = JoinStages.joinError;
            });
          break;
      }
    }
  }
</script>

<Modal canBeVoluntarilyClosed={false} bind:active noBox forceScale>
  <CrossfadeWrapper replayAnimationKey={stage}>
    {#if stage == JoinStages.validatingInvite}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.validate')}</h2>
        <button class="button is-text is-color-loading is-large" readonly />
      </div>
    {:else if stage == JoinStages.notWalletInvite}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.notWallet.title')}</h2>
        <p>{$_('cmps.wallet.userAccess.invite.join.notWallet.main')}</p>
        <button class="button" on:click={finish}>{$_('common.form.close')}</button>
      </div>
    {:else if stage == JoinStages.ask}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.ask.callOwner')}</h2>
        <p>{$_('cmps.wallet.userAccess.invite.join.ask.expl')}</p>
        <button class="button is-outlined is-success" on:click={launchJoin}
          >{$_('cmps.wallet.userAccess.invite.join.ask.go')}</button>
      </div>
    {:else if stage == JoinStages.joinLaunched}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.waitOwnerConfirm')}</h2>
        <p>{$_('cmps.wallet.userAccess.invite.keySecurity')}</p>
        <p title={`SHA-512: ${(hashData || {}).hashHex}`}>{(hashData || {}).emojiString}</p>
        <button class="button is-text is-color-loading is-large centered" readonly />
      </div>
    {:else if stage == JoinStages.joinError}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.error.title')}</h2>
        <p>{$_('cmps.wallet.userAccess.invite.join.error.main')}</p>
        <button class="button" on:click={finish}>{$_('common.form.close')}</button>
      </div>
    {:else if stage == JoinStages.joinRejected}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.reject.title')}</h2>
        <p>{$_('cmps.wallet.userAccess.invite.join.reject.expl')}</p>
        <button class="button" on:click={finish}>{$_('common.form.close')}</button>
      </div>
    {:else if stage == JoinStages.joinAccepted}
      <div class="item">
        <h2>{$_('cmps.wallet.userAccess.invite.join.accept.title')}</h2>
        <p>{$_('cmps.wallet.userAccess.invite.join.accept.main')} 👌</p>
        <button class="button is-success is-outlined" on:click={finish}
          >{$_('cmps.wallet.userAccess.invite.join.accept.cta')}</button>
      </div>
    {/if}
  </CrossfadeWrapper>
</Modal>

<style lang="scss">
  .item {
    @include mq($until: tablet) {
      width: 95%;
    }
    @include mq($from: tablet) {
      width: 350px;
    }

    margin: 0 auto;
    text-align: center;
  }

  h2 {
    font-weight: bold;
  }

  p {
    margin: 1.2em 0;
  }
</style>
