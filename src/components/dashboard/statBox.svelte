<script>
  import { moneyFormat, percentFormat } from '@/utils/number';
  import { defaultAssetStore } from '@/stores/decr/asset';

  export let label: string,
    labelClass: string,
    betterToIncrease: boolean,
    currentValue: number,
    previousValue: number;

  $: diff = currentValue - previousValue;
  $: gotBetter = betterToIncrease ? diff >= 0 : diff <= 0;
  $: classes = `number-stat overflow-ellipsis ${labelClass}`;

  $: percent = previousValue ? diff / previousValue : -Infinity;
</script>

<div class="stat-box">
  <p class="has-text-grey-light is-lowercase">{label}</p>
  <p class={classes}>{$moneyFormat(currentValue, $defaultAssetStore.decr.code)}</p>
  {#if previousValue !== undefined}
    <p class:has-text-success={gotBetter} class:has-text-danger={!gotBetter}>
      {$moneyFormat(diff, $defaultAssetStore.decr.code)}
      ({$percentFormat(percent)})
    </p>
  {/if}
</div>

<style lang="scss">
  .stat-box {
    text-align: center;
    @include mq($from: desktop) {
      font-size: $size-6;
    }
    @include mq($until: desktop) {
      font-size: $size-7;
    }
  }

  .number-stat {
    @include mq($from: desktop) {
      font-size: $size-3;
    }
    @include mq($until: desktop) {
      font-size: $size-5;
    }
  }
</style>
