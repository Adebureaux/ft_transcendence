<template>
  <q-page>
    <q-card class="q-ma-lg q-pa-lg" style="max-width: 400px">
      <q-form
        @submit="onSubmit"
        class="q-gutter-md"
      >
        <q-input
          filled
          v-model="UsersCount"
          label="User Count"
          :rules="[ val => val >= 0 || 'Please enter non null positive count of users']"
          lazy-rules
        />

        <div>
          <q-btn label="Submit" type="submit" color="primary"/>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { createUsers } from '../models/postFakeDatasToAPI'

export default defineComponent({
  name: 'FeedDB',
  components: {},
  props: {},
  data() {
    return {
      UsersCount: 1 as number,
    }
  },
  methods: {
    onSubmit() {
      if (this.UsersCount > 0)
        createUsers(this.UsersCount)
    },
  },
});
</script>

<style lang="sass">

</style>
