<template>
  <form method="post" action="">
    <button>login</button>
  </form>
  <Link href="/auth/register">Register</Link>
</template>

<script lang='ts'>

import { defineComponent } from 'vue';
import {Link} from '@inertiajs/vue3';
export default defineComponent({
  components: {
    Link
  },
  setup() {

  },
});

</script>
