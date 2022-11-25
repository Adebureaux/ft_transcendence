<template>
  <q-page>
    Index :) mais c'est vide :)
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Index',
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

<!-- <template>
  <q-page class="mainposition">
    TOTO
      <LeftBanner :me="me" @updateSelectedConversation="updateSelectedConversation" @profilClicked="profilClicked" class="banner"/>
      <Conversation :conversationItem="selectedUser" v-if="isCurrentViewis_CONVERSATION()" class="IPcontent"/>
      <Profil class="IPcontent" v-else-if="isCurrentViewis_PROFIL()"></Profil>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IUserBasicInfo, OnlineStatus } from '../models/models'
import { randomDate } from '../models/fakedatas'

// GET users/me
let _me = {
  name: 'tharchen',
  avatar: 'https://cdn.intra.42.fr/users/d1ae701a3af5f3dd3070d5c8406e77fe/tharchen.jpg',
  onlineStatus: OnlineStatus.INGAME,
} as IUserBasicInfo

export enum EViewsList {
  LOGIN,
  CONVERSATION,
  GAME,
  PROFIL,
  SETTINGS,
  NONE,
}

let _onlineS: OnlineStatus = OnlineStatus.ONLINE;
let _offlineS: OnlineStatus = OnlineStatus.OFFLINE;
let _ingameS: OnlineStatus = OnlineStatus.INGAME;
let _noneS: OnlineStatus = OnlineStatus.NONE;

export default defineComponent({
  name: 'IndexPage',
  components: {
    // LeftBanner,
    // Conversation,
    // Profil,
   },
  methods: {
    isCurrentViewis_LOGIN()        { return this.currentView == EViewsList.LOGIN },
    isCurrentViewis_CONVERSATION() { return this.currentView == EViewsList.CONVERSATION },
    isCurrentViewis_GAME()         { return this.currentView == EViewsList.GAME },
    isCurrentViewis_PROFIL()       { return this.currentView == EViewsList.PROFIL },
    isCurrentViewis_SETTINGS()     { return this.currentView == EViewsList.SETTINGS },
    isCurrentViewis_NONE()         { return this.currentView == EViewsList.NONE },

    updateSelectedConversation(userItem: IUserBasicInfo) {
      this.selectedUser = userItem
      this.currentView =  EViewsList.CONVERSATION
    },
    profilClicked() {
      this.currentView =  EViewsList.PROFIL
    },
    randomDate() {
      return randomDate()
    }
  },
  data ()
  {
    return {
      me: _me as IUserBasicInfo,
      currentView: EViewsList.PROFIL as EViewsList,
      selectedUser: Object() as IUserBasicInfo,

      onlineS: _onlineS as OnlineStatus,
      offlineS: _offlineS as OnlineStatus,
      ingameS: _ingameS as OnlineStatus,
      noneS: _noneS as OnlineStatus,
    }
  },
})
</script>

<style lang="sass" scoped>

.mainposition
  display: flex
  background-color: #404040
  flex-direction: column

.banner
  min-width: 15%

.IPcontent
  min-width: 85%
  // margin-left: 15%
</style>
-->
