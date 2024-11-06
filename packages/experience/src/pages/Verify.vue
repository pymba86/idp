<template>
  <div>verify</div>
  {{ userInfo }}
</template>

<script lang='ts'>

import {defineComponent} from 'vue';

export default defineComponent({
  props: {
    userInfo: {
      type: Object,
      required: false
    },
  },
  setup() {

  },
});

</script>
