<script>
  export let header: boolean = false,
    right = false;
</script>

<style lang="scss">
  $box-shadow-size: 5px;

  .header {
    font-weight: 700;
    font-size: 110%;
    text-decoration: underline;
  }

  .back {
    background-color: #fff;
    box-shadow: 0 0 0 $box-shadow-size #fff;
  }

  .left {
    padding-left: $box-shadow-size;

    span {
      box-decoration-break: clone;
    }
  }

  .right {
    padding-right: $box-shadow-size;
  }
</style>

<p class:header class:right class:left={!right}>
  <span class="back"><slot /></span>
</p>
