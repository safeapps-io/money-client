<script>
  import { Onboarding, Text } from '$components/onboarding';
  import { Form, MasterPasswordField, Field, CheckboxInput } from '$strict';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { accentTags } from '$utils/accentTags';
  import { ensureBoolean, needValue } from '$validators';

  import { FormError } from '$services/errors';
  import { AuthService } from '$services/auth/authService';

  import { currentChestsStore } from '$stores/wallet';
  import { userDecrStore } from '$stores/decr/user';

  export let isFirstPassword: boolean = true;

  const translationValues = { values: accentTags };
  $: help = `${$_('cmps.masterPassword.setNew.help.common')} ${
    isFirstPassword ? '' : $_('cmps.masterPassword.setNew.help.invite')
  }`;
  $: buttonText = isFirstPassword ? $_('common.form.set') : $_('common.form.change');

  let shouldShowOnboarding = isFirstPassword;

  let shouldShowSecondPassword = false,
    cleanup = false,
    passwordForModal: string | undefined = undefined;

  const setPassword = async ({ password, password2 }: { password: string; password2?: string }) => {
    if (!shouldShowSecondPassword) {
      shouldShowSecondPassword = true;
      setTimeout(() => {
        cleanup = true;
      }, 100);

      return;
    }

    if (password !== password2)
      throw new FormError({
        code: 0,
        fieldErrors: { password2: [$_('cmps.masterPassword.old.pass.samePasswords')] },
      });

    shouldShowOnboarding = false;
    passwordForModal = password;
  };

  const cancel = () => {
      passwordForModal = undefined;
      shouldShowSecondPassword = false;
      cleanup = false;
    },
    savePassword = async () => {
      try {
        await AuthService.setMasterPassword(passwordForModal!, $currentChestsStore, $userDecrStore);
        cancel();
      } catch (err) {
        throw new FormError({
          code: 0,
          message: $_('common.errors.generic'),
        });
      }
    };

  let showPass = false;
  const toggleShowPass = () => (showPass = !showPass);
  let passwordDisplay: string;
  $: if (passwordForModal)
    passwordDisplay = showPass
      ? passwordForModal
      : new Array(passwordForModal.length + 1).join('*');
</script>

<Onboarding shouldShow={shouldShowOnboarding}>
  <CrossfadeWrapper key={passwordForModal ? passwordForModal : ''}>
    {#if passwordForModal}
      <div class="wrapper">
        <Form
          cleanup
          success={savePassword}
          notificationText={isFirstPassword ? undefined : $_('routes.user.masterPassOk')}>
          <div class="has-background-danger-light py-2 px-3">
            <h2 class="subtitle">{$_('cmps.masterPassword.setNew.failproof.attention')}</h2>

            <p>
              {@html $_('cmps.masterPassword.setNew.failproof.cantRestore', translationValues)}
            </p>
            <p class="my-2">
              {@html $_('cmps.masterPassword.setNew.failproof.cantAccess', translationValues)}
            </p>
            <p>
              {@html $_('cmps.masterPassword.setNew.failproof.writeDown', translationValues)}
            </p>
          </div>

          <div class="my-5">
            <p class="password-label">
              {$_('cmps.masterPassword.setNew.failproof.label')}

              <button
                class="button is-primary is-light is-small ml-2"
                type="button"
                on:click={toggleShowPass}>
                <span class="icon">
                  {#if showPass}
                    <svg viewBox="0 0 15 15" fill="none"
                      ><path
                        d="M7.5 9C5.186 9 3.561 7.848 2.497 6.666a9.368 9.368 0 01-1.449-2.164 5.065 5.065 0 01-.08-.18l-.004-.007v-.001L.5 4.5l-.464.186v.002l.003.004a2.107 2.107 0 00.026.063l.078.173a10.367 10.367 0 001.61 2.406C2.94 8.652 4.814 10 7.5 10V9zm7-4.5a68.887 68.887 0 01-.464-.186l-.003.008-.015.035-.066.145a9.37 9.37 0 01-1.449 2.164C11.44 7.848 9.814 9 7.5 9v1c2.686 0 4.561-1.348 5.747-2.666a10.365 10.365 0 001.61-2.406 6.164 6.164 0 00.104-.236l.002-.004v-.001h.001L14.5 4.5zM8 12V9.5H7V12h1zm-6.646-1.646l2-2-.708-.708-2 2 .708.708zm10.292-2l2 2 .708-.708-2-2-.708.708z"
                        fill="currentColor" /></svg>
                  {:else}
                    <svg viewBox="0 0 15 15" fill="none"
                      ><path
                        d="M.5 7.5l-.464-.186a.5.5 0 000 .372L.5 7.5zm14 0l.464.186a.5.5 0 000-.372L14.5 7.5zm-7 4.5c-2.314 0-3.939-1.152-5.003-2.334a9.368 9.368 0 01-1.449-2.164 5.065 5.065 0 01-.08-.18l-.004-.007v-.001L.5 7.5l-.464.186v.002l.003.004a2.107 2.107 0 00.026.063l.078.173a10.368 10.368 0 001.61 2.406C2.94 11.652 4.814 13 7.5 13v-1zm-7-4.5l.464.186.004-.008a2.62 2.62 0 01.08-.18 9.368 9.368 0 011.449-2.164C3.56 4.152 5.186 3 7.5 3V2C4.814 2 2.939 3.348 1.753 4.666a10.367 10.367 0 00-1.61 2.406 6.05 6.05 0 00-.104.236l-.002.004v.001H.035L.5 7.5zm7-4.5c2.314 0 3.939 1.152 5.003 2.334a9.37 9.37 0 011.449 2.164 4.705 4.705 0 01.08.18l.004.007v.001L14.5 7.5l.464-.186v-.002l-.003-.004a.656.656 0 00-.026-.063 9.094 9.094 0 00-.39-.773 10.365 10.365 0 00-1.298-1.806C12.06 3.348 10.186 2 7.5 2v1zm7 4.5a68.887 68.887 0 01-.464-.186l-.003.008-.015.035-.066.145a9.37 9.37 0 01-1.449 2.164C11.44 10.848 9.814 12 7.5 12v1c2.686 0 4.561-1.348 5.747-2.665a10.366 10.366 0 001.61-2.407 6.164 6.164 0 00.104-.236l.002-.004v-.001h.001L14.5 7.5zM7.5 9A1.5 1.5 0 016 7.5H5A2.5 2.5 0 007.5 10V9zM9 7.5A1.5 1.5 0 017.5 9v1A2.5 2.5 0 0010 7.5H9zM7.5 6A1.5 1.5 0 019 7.5h1A2.5 2.5 0 007.5 5v1zm0-1A2.5 2.5 0 005 7.5h1A1.5 1.5 0 017.5 6V5z"
                        fill="currentColor" /></svg>
                  {/if}
                </span>
              </button>
            </p>
            <p class="password mt-3 is-size-3">
              {#each passwordDisplay as letter}<span class="has-background-white-ter px-1 m-1"
                  >{letter}</span
                >{/each}
            </p>
          </div>

          <div class="my-5">
            <Field
              field={{
                name: '',
                hideLabel: true,
                label: $_('cmps.masterPassword.setNew.failproof.agree'),
                clean: [ensureBoolean],
                validate: [needValue(true)],
              }}>
              <CheckboxInput />
            </Field>
          </div>

          <svelte:fragment slot="submit" let:loading let:disabled>
            <div class="buttons">
              <button
                class="button is-danger"
                class:is-color-loading={loading}
                type="button"
                on:click={cancel}>
                {$_('common.back')}
              </button>
              <button class="button ml-3" class:is-color-loading={loading} {disabled}
                >{buttonText}</button>
            </div>
          </svelte:fragment>
        </Form>
      </div>
    {:else}
      <Form {cleanup} {buttonText} success={setPassword}>
        <MasterPasswordField {help} />
        {#if shouldShowSecondPassword}
          <div class="field" in:slide>
            <MasterPasswordField isSecond label={$_('cmps.user.password.labelRepeat')} />
          </div>
        {/if}
      </Form>
    {/if}
  </CrossfadeWrapper>

  <svelte:fragment slot="text">
    <Text header>{$_('cmps.masterPassword.setNew.onboarding.header')}</Text>
    <Text>
      {@html $_('cmps.masterPassword.setNew.onboarding.main', translationValues)}
    </Text>
  </svelte:fragment>
</Onboarding>

<style>
  .wrapper {
    position: relative;

    max-height: 80vh;
    overflow: scroll;
  }

  .password {
    display: flex;
    flex-wrap: wrap;

    user-select: none;
  }

  .password-label {
    display: flex;
    align-items: baseline;

    font-weight: bold;
    font-size: 120%;
  }
</style>
