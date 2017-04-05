<style lang="scss">
  $color-gold: #ffcc00;
  .red {
    color: $color-light-grey;
  }
</style>

<template>
  <h1 class="red">{{msg}}</h1>
</template>

<script>
export default {
  data () {
    console.log(512);
    return {
      msg: 'Hello world!'
    }
  }
}
</script>
