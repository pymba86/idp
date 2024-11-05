<template>
  <div>password</div>
  <div>email: {{ email }}</div>
  <form method="post">
    <input type="text" name="password">
    <button>continue</button>
  </form>
  {{ error }}
  <Link href="/auth/login">back</Link>
</template>

<script lang='ts'>

import {defineComponent} from 'vue';
import {Link} from '@inertiajs/vue3';

export default defineComponent({
  props: {
    error: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    }
  },
  components: {
    Link
  },
});

</script>
