<script>
  export let marginTop = 30,
    marginBottom = 30,
    marginLeft = 30,
    marginRight = 30;

  export let svgHeight: number;
  let svgWidth: number;

  $: width = svgWidth - marginLeft - marginRight;
  $: height = svgHeight - marginTop - marginBottom;
</script>

<div class="wrapper" bind:clientWidth={svgWidth}>
  {#if svgWidth && svgHeight}
    <svg height={svgHeight} width={svgWidth}>
      <g transform="translate({marginLeft}, {marginTop})">
        <slot {width} {height} />
      </g>
    </svg>
  {/if}
  <slot name="overlay-div" />
</div>

<style lang="scss">
  .wrapper {
    position: relative;
  }

  svg {
    :global(text) {
      font-family: $family-monospace;
    }

    :global(tspan.value) {
      font-size: 110%;
      font-weight: bold;
    }
  }
</style>
