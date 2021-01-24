<script>
  export let triggerText = '?';
</script>

<style lang="scss">
  @import 'src/styles/importable';

  $tooltip-color: $turquoise;

  .tooltip {
    @include mq($from: tablet) {
      display: inline;
    }

    &__trigger {
      display: inline;

      color: $tooltip-color;
      border-bottom: 1px dashed $turquoise;

      cursor: default;
    }

    $width: 350px;

    &__invisible {
      position: absolute;
      top: 75%;
      @include mq($until: tablet) {
        left: -1em;
        right: -1em;
      }
      @include mq($from: tablet) {
        width: $width;
      }

      @include z(tooltip-content);
      visibility: hidden;
      opacity: 0;

      transition: opacity 0.3s ease-in-out;
    }

    &__content {
      background-color: $scheme-main;

      border: 2px solid $turquoise;
      box-shadow: 0 1em 1em -0.6em change-color($turquoise, $alpha: 0.3);

      line-height: 1.2;
    }

    &:hover &__invisible {
      visibility: visible;
      opacity: 1;
    }
  }
</style>

<div class="tooltip is-relative">
  <div class="tooltip__trigger">
    <slot name="trigger">{triggerText}</slot>
  </div>
  <div class="tooltip__invisible">
    <div class="tooltip__content mt-4 px-5 py-4">
      <slot />
    </div>
  </div>
</div>
