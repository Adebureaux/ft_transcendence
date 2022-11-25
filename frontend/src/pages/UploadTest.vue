<template>
  <q-page>
    <div class="q-pa-md">
      <q-uploader
        label="Auto Uploader"
        url="http://localhost:3000/upload"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UploadTest',
  components: {},
  props: {},
  data() {
    return {

    }
  },
  methods: {},
});
</script>

<style lang="sass">

</style>
