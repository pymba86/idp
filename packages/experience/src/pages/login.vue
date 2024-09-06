<template>
  <form method="post">
    <input type="text"  name="email" v-model="email">
    <input type="text"  name="password">
    <button>login</button>
  </form>
  {{error}}
  <Link href="/auth/register">Register</Link>
</template>

<script lang='ts'>

import {defineComponent, ref} from 'vue';
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
  setup(props) {

    const email = ref(props.email)

    return {
      email
    }
  },
});

</script>
