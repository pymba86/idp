<template>
  <div>register</div>
  <div v-if="error">{{error}}</div>
  <div v-else>Congratulations! Your account has been activated.</div>
</template>

<script lang='ts'>

import { defineComponent } from 'vue';
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
