<script>
  import Generic from '$components/elements/dropdown/generic.svelte';
  import { Onboarding, Text } from '$components/onboarding';
  import { Form, EmailField, Field, TextareaInput, TextInput } from '$strict';

  import { _ } from 'svelte-i18n';

  import { createFormStore } from '$strict/base';
  import {
    emailFormat,
    ensureString,
    maxLength,
    minLength,
    optionalString,
    trim,
  } from '$validators';

  import { userEncrStore } from '$stores/user';
  import { AuthService } from '$services/auth/authService';
  import { accentTags } from '$utils/accentTags';
  import { media } from 'svelte-match-media';

  let show: boolean;
  $: showEmailField = !$userEncrStore?.email;

  const formStore = createFormStore();

  let descriptionCachedValue: string, emailCachedValue: string | undefined;

  // Caching the value when the form gets hidden
  $: if (!show) {
    descriptionCachedValue = $formStore.fields?.description?.inputValue;
    emailCachedValue = $formStore.fields?.email?.inputValue;
  }

  $: descriptionField = {
    name: 'description',
    label: $_('cmps.nav.feedback.textLabel'),
    inputValue: descriptionCachedValue,
    required: true,
    clean: [ensureString, trim],
    validate: [minLength(10), maxLength(2000)],
  };

  $: emailField = {
    name: 'email',
    label: 'Email',
    inputValue: emailCachedValue,
    help: $_('cmps.nav.feedback.email'),
    clean: [optionalString, trim],
    validate: [emailFormat],
  };

  const success = async (data: { description: string; email?: string }) => {
    await AuthService.leaveFeedback(data);
    show = false;
  };
</script>

<div class="wrapper">
  <Generic bind:show right>
    <svelte:fragment slot="trigger" let:id let:onTriggerClick>
      <Onboarding
        right
        bottom
        preventSlotClick
        key="contactUs"
        shouldShow={!$media.mobile}
        let:finishOnboarding
        let:show={onbShow}>
        <button
          class="button is-ghost is-small"
          class:has-background-white={onbShow}
          class:is-focused={show}
          aria-haspopup="true"
          aria-controls={id}
          on:click={onTriggerClick}>
          <span class="icon">
            <!-- © https://teenyicons.com/ question-circle -->
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              ><path
                d="M7.5 9V7.5H8A1.5 1.5 0 009.5 6v-.1a1.4 1.4 0 00-1.4-1.4h-.6A1.5 1.5 0 006 6m1 4.5h1m-.5 4a7 7 0 110-14 7 7 0 010 14z"
                stroke="currentColor" /></svg>
          </span>
          <span>{$_('cmps.nav.feedback.cta')}</span>
        </button>

        <svelte:fragment slot="text">
          <Text header>{$_('cmps.wallet.onboarding.contactUs.title')}</Text>
          <Text
            >{@html $_('cmps.wallet.onboarding.contactUs.text', {
              values: accentTags,
            })}</Text>
          <button class="button mt-3" on:click={finishOnboarding}
            >{$_('cmps.wallet.onboarding.contactUs.cta')}</button>
        </svelte:fragment>
      </Onboarding>
    </svelte:fragment>

    <div class="py-3 px-4">
      <Form
        cleanup
        {formStore}
        {success}
        buttonText={$_('common.form.submit')}
        notificationText={$_('common.form.okNotif')}>
        {#if showEmailField}
          <Field field={emailField}>
            <TextInput type="email" autocomplete="email" />
          </Field>
        {/if}
        <Field field={descriptionField}>
          <TextareaInput rows={3} placeholder={$_('cmps.nav.feedback.text')} />
        </Field>
      </Form>
    </div>
  </Generic>
</div>

<style lang="scss">
  .wrapper {
    --dropdown-min-width: 340px;
  }
</style>
