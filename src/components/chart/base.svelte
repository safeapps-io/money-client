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
  <svg height={svgHeight} width={svgWidth}>
    <g transform="translate({marginLeft}, {marginTop})">
      <slot {width} {height} />
    </g>
  </svg>
</div>

<style lang="scss">
  svg :global(text) {
    font-family: $family-monospace;
  }
</style>
