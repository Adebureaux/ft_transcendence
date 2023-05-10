<template>
  <div class="fullscreen bg-blue-grey-14 text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="text-h2">
        Oupsy
      </div>

      <div class="text-h5" style="opacity:.4">
	  It seems that you are trying to access a game that is finished
      </div>

      <q-btn
        class="q-mt-xl"
        color="#F7F7FF"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GameError'
});
</script>
