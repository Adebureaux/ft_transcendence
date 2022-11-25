<template>
  <!-- <div class=""> -->
    <!-- TODO penser à une reel solution de scroll pour la liste -->
    <!-- <q-scroll-area :visible="true" style="height: 88vh; max-width: 15vw;"> -->
      <q-list bordered class="list">
        <q-item class="item" v-for="item in conversationList" :key="item.identity.id"
          @click="userSelected(item?.identity)" clickable v-ripple :item="item">
          <UserCard
            :name="item?.identity.name"
            :avatar="item?.identity.avatar"
            size="medium"
            nameColor="gray"
            :ratio="0.55"
            :onlineStatus="item?.identity.onlineStatus"
          />
          <q-avatar icon="lock" v-if="isPrivate(item)" class="absolute-right vertical-middle"/>
        </q-item>
      </q-list>
    <!-- </q-scroll-area> -->
  <!-- </div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { IUserBasicInfo, IConvList, IConvItem, OnlineStatus, Scope } from '../../models/models';
import UserCard from '../common/UserCard.vue'
import { fake_IConvList } from '../../models/fakedatas'

export default defineComponent({
  name: 'ConversationList',
  components: { UserCard },
  props: {},
  data() {
    return {
      conversationList : fake_IConvList(15) as IConvList,
    }
  },
  methods: {
    isPrivate(item: IConvItem) {
      return item.scope == Scope.PRIVATE
    },
    userSelected(userItem: IUserBasicInfo) {
      console.log(userItem);
      this.$router.push({
        path: '/conversation',
        query: { user: userItem.name }
      })
    }
  },
  beforeMount () {
    // axios.get('/api/conversation/list')
    // .then (res => {

    // })
  },
});
</script>

<style lang="sass">
.item
  background-color: #303030
  // margin-bottom: 2px
  width: 100%
  height: 1em

.list
  background-color: #404040 !important
  width: 100%
</style>
