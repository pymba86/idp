<template>
  <div>register</div>
  <Link href="/auth/login">login</Link>
</template>

<script lang='ts'>

import { defineComponent } from 'vue';
import {Link} from "@inertiajs/vue3";
export default defineComponent({
  components: {Link},
  setup() {

  },
});

</script>
