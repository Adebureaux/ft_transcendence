<template>
  <q-item class="profilitem" clickable v-ripple :item="me">
    <UserCard :item="me" class="text-h5 text-bold"/>
    <q-item-section class="absolute-right">
      <q-avatar icon="settings"/>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IUserBasicInfo, OnlineStatus, Scope } from '../../models/models';
import UserCard from '../common/UserCard.vue'

export default defineComponent({
  name: 'ProfilItem',
  components: { UserCard },
  props: {
    me: { type: Object as PropType<IUserBasicInfo>, required: true as boolean }
  },
  data() {
    return {

    }
  },
  methods: {
  },
});
</script>

<style lang="sass">
.profilitem
  background-color: #303030
  height: 70px
</style>
