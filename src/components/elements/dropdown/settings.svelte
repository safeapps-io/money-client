<script>
  import GenericDropdown from '@/components/elements/dropdown/generic.svelte';

  import { _ } from 'svelte-i18n';
  import cogIcon from 'teenyicons/outline/cog.svg';

  export let show = false;
</script>

<div class="popover">
  <GenericDropdown right bind:show>
    <div slot="trigger" let:id let:onTriggerClick>
      <button
        class="button is-small shake"
        class:is-focused={show}
        aria-haspopup="true"
        aria-controls={id}
        on:click={onTriggerClick}>
        <span class="icon is-small">
          <img src={cogIcon} alt="cog" height="15" width="15" />
        </span>
        <span>{$_('cmps.nav.menu.settings')}</span>
      </button>
    </div>

    <div class="px-4 py-3">
      <slot />
    </div>
  </GenericDropdown>
</div>

<style lang="scss">
  @import 'src/styles/importable';

  @keyframes shake {
    0% {
      transform: rotate(3deg);
    }
    50% {
      transform: rotate(-3deg);
    }
  }

  .shake {
    animation: 1s steps(2) shake;
    animation-iteration-count: 3;
  }

  .popover {
    @include mq($until: tablet) {
      --dropdown-min-width: 90vw;
    }
    @include mq($from: tablet) {
      --dropdown-min-width: 300px;
    }
  }
</style>
