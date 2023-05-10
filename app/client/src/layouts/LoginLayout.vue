<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Auth from '../pages/Auth.vue'

export default defineComponent({
  name: 'LoginLayout',
  components: { Auth },
  props: {
    me: { type: Object, default: {} }
  },  
  data() {
    return {
    }
  },
  methods: {},
  mounted() {
	
  }
});
</script>

<style lang="sass">
body
  background-color: $bg-primary !important
  color: grey
</style>

<style lang="sass" scoped>

</style>
