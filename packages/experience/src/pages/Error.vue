<template>
  <div>error</div>
  {{ error }}
</template>

<script lang='ts'>

import {defineComponent} from 'vue';

export default defineComponent({
  props: {
    error: {
      type: String,
      required: false
    },
  },
  setup() {

  },
});

</script>
