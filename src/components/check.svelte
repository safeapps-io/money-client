<script>
  let blabla = 'wer';
</script>

<style lang="scss">
  @mixin a($var) {
    font-style: $var;
  }

  .selector {
    @include a('qwd');
  }
</style>

<!-- Messes up everything -->
<div class="selector">Yep {blabla}</div>
