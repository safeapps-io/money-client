<script>
  import { moneyFormat } from '$utils/number';

  export let amount: number, assetCode: string;
</script>

<p class="is-size-4" class:has-text-success={amount >= 0} class:has-text-danger={amount < 0}>
  {$moneyFormat(Math.abs(amount), assetCode)}
</p>
