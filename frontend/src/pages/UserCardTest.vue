<template>
  <!-- items-center justify-evenly -->
  <q-page class="mainposition">
      chat
      <UserCard
        name="Bressack"
        avatar="https://avatars.githubusercontent.com/Bressack"
        content="je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila "
        :timestamp="randomDate()"
        size="small"
        ></UserCard>
      large message
      <UserCard
        name="Bressack"
        avatar="https://avatars.githubusercontent.com/Bressack"
        content="je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. je suis un text, un gros text qui sert a savoir si je suis bien dans mon item ou pas voila. "
        :timestamp="randomDate()"
        size="small"
        ></UserCard>
      conv list / match history
      <UserCard
        name="Bressack djkakjdlsfhlaskjdfhalks"
        avatar="https://cdn.intra.42.fr/users/d1ae701a3af5f3dd3070d5c8406e77fe/tharchen.jpg"
        size="medium"
        nameColor="gray"
        :onlineStatus="onlineS"
        icon="lock"
        ></UserCard>
      <UserCard
        name="Bressack djkakjdlsfhlaskjdfhalks"
        avatar="https://cdn.intra.42.fr/users/d1ae701a3af5f3dd3070d5c8406e77fe/tharchen.jpg"
        size="medium"
        nameColor="gray"
        :onlineStatus="offlineS"
        icon="lock"
        ></UserCard>
      profil
      <UserCard
        name="Bressack djkakjdlsfhlaskjdfhalks"
        avatar="https://cdn.intra.42.fr/users/d1ae701a3af5f3dd3070d5c8406e77fe/tharchen.jpg"
        :mirror="false"
        size="large"
        icon="settings"
        :ratio="1"
        :onlineStatus="onlineS"
        ></UserCard>
      <UserCard
        name="Bressack djkakjdlsfhlaskjdfhalks"
        avatar="https://cdn.intra.42.fr/users/d1ae701a3af5f3dd3070d5c8406e77fe/tharchen.jpg"
        :mirror="false"
        size="large"
        icon="settings"
        :ratio="0.5"
        ></UserCard>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserCard from '../components/common/UserCard.vue'
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
  components: { UserCard, },//LeftBanner, Conversation, Profil, },
  methods: {
    randomDate() {
      return randomDate()
    }
  },
  data ()
  {
    return {
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
</style>
