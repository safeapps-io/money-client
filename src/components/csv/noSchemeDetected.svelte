<script context="module">
  const mailtoEmail = 'dkzlv@protonmail.com',
    mailtoSubject = 'Bank statement parsing request',
    mailtoContent =
      'Bank name: \nBank country: \n\n\nPlease, do not forget to attach the downloaded statement!\n',
    mailtoLink = `mailto:${mailtoEmail}?subject=${encodeURIComponent(
      mailtoSubject,
    )}&body=${encodeURIComponent(mailtoContent)}`;
</script>

<script>
  import CrossfadeWrapper from '@/components/elements/crossfadeWrapper.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const startSchemeSetting = () => dispatch('needScheme');
  const enum State {
    isItABankStatement,
    userDecides,
    userWillWait,
  }
  let state = State.isItABankStatement;
</script>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;

    place-items: center;
    place-content: center;
    min-height: 400px;
  }

  .choice {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 1fr auto;
    grid-row-gap: 2em;

    > * {
      padding: 0 2em;
    }
  }

  .wait {
    border-left: 1px dotted rgb(212, 212, 212);
  }

  .instructions-wrapper {
    @include mq($from: tablet) {
      width: 60%;
      margin: 0 auto;
    }
  }

  .instructions {
    > p {
      margin-top: 1em;
    }

    > ol {
      list-style-position: inside;
      > li {
        margin-top: 0.5em;
      }
    }
  }
</style>

<div class="wrapper">
  <CrossfadeWrapper replayAnimationKey={state}>
    {#if state == State.isItABankStatement}
      <div class="has-text-centered">
        <h3>{$_('cmps.csv.scheme.noDetected.isBank')}</h3>

        <button
          class="button is-success is-outlined"
          on:click={() => (state = State.userDecides)}>{$_('common.yes')}</button>
        <button
          class="button is-danger is-outlined"
          on:click={startSchemeSetting}>{$_('common.no')}</button>
      </div>
    {:else if state == State.userDecides}
      <div class="has-text-centered">
        <h3>{$_('cmps.csv.scheme.noDetected.decision.header')}</h3>
        <p>{$_('cmps.csv.scheme.noDetected.decision.options')}</p>

        <div class="choice mt-5">
          <div>
            <!-- © https://teenyicons.com/ button -->
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"><path
                d="M5.5 10V8.5m0 0v-5a1 1 0 012 0v4h3.353c.91 0 1.647.737 1.647 1.647V10A4.5 4.5 0 018 14.5h-.5a4 4 0 01-4-4 2 2 0 012-2zm3.5-3h2a2.5 2.5 0 000-5H4a2.5 2.5 0 000 5"
                stroke="currentColor" /></svg>
            <p class="has-text-weight-bold my-3">
              {$_('cmps.csv.scheme.noDetected.decision.try.header')}
            </p>
            <p>{$_('cmps.csv.scheme.noDetected.decision.try.main')}</p>
          </div>
          <div class="wait">
            <!-- © https://teenyicons.com/ clock -->
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"><path
                d="M7.5 7.5H7a.5.5 0 00.146.354L7.5 7.5zm0 6.5A6.5 6.5 0 011 7.5H0A7.5 7.5 0 007.5 15v-1zM14 7.5A6.5 6.5 0 017.5 14v1A7.5 7.5 0 0015 7.5h-1zM7.5 1A6.5 6.5 0 0114 7.5h1A7.5 7.5 0 007.5 0v1zm0-1A7.5 7.5 0 000 7.5h1A6.5 6.5 0 017.5 1V0zM7 3v4.5h1V3H7zm.146 4.854l3 3 .708-.708-3-3-.708.708z"
                fill="currentColor" /></svg>
            <p class="has-text-weight-bold my-3">
              {$_('cmps.csv.scheme.noDetected.decision.wait.header')}
            </p>
            <p>
              {@html $_('cmps.csv.scheme.noDetected.decision.wait.main', {
                values: {
                  tagO: '<span class="has-text-weight-bold">',
                  tagC: '</span>',
                },
              })}
            </p>
          </div>
          <div>
            <button
              class="button"
              on:click={startSchemeSetting}>{$_('cmps.csv.scheme.noDetected.decision.try.cta')}</button>
          </div>
          <div>
            <button
              class="button"
              on:click={() => (state = State.userWillWait)}>{$_('cmps.csv.scheme.noDetected.decision.wait.cta')}</button>
          </div>
        </div>
      </div>
    {:else if state == State.userWillWait}
      <div class="instructions-wrapper px-3">
        <h3 class="is-size-4 has-text-centered mb-5">
          {$_('cmps.csv.scheme.noDetected.instructions.header')}
        </h3>
        <div class="instructions">
          <p>{$_('cmps.csv.scheme.noDetected.instructions.lead')}</p>
          <ol>
            <li>
              {@html $_('cmps.csv.scheme.noDetected.instructions.first', {
                values: {
                  tagItalicO: '<span class="is-italic">',
                  tagBoldO: '<span class="has-text-weight-bold">',
                  tagC: '</span>',
                },
              })}
            </li>
            <li>
              {@html $_('cmps.csv.scheme.noDetected.instructions.second', {
                values: {
                  tagO: `<a href=${mailtoLink} target="_blank" rel="noopener noreferrer">`,
                  tagC: '</a>',
                },
              })}
            </li>
          </ol>
          <p>{$_('cmps.csv.scheme.noDetected.instructions.fin')}</p>
        </div>
      </div>
    {/if}
  </CrossfadeWrapper>
</div>
