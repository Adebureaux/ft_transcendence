<template>

    <q-item clickable v-ripple class="usermenu " manual-focus :focused="$store.active_channel === channelId">
      <q-tooltip v-if="muted || banned" style="width: 250px;">
        <span class="text-subtitle2">{{ muted ? 'Muted' : 'Banned' }} until {{ utils.getRelativeDate(new Date(duration)) }}</span>
      </q-tooltip>
      <q-item-section style="max-width: 30px;" @click="goProfilePage" >
        <q-avatar size="38px" class="avatar" :style="`background-color: ${$utils.usernameToColor(username)};`">
          <img :src="`/api/avatar/${username}/thumbnail`">
          <div :class="getLoginStatus()" class="loginstatus"/>
        </q-avatar>
      </q-item-section>
      <q-item-section class="" style="max-width: 25px;">
        <q-icon size="20px" color="red" name="mdi-cancel" v-if="banned"/>
        <q-icon size="20px" color="yellow" name="mdi-microphone-off" v-if="muted"/>
      </q-item-section>
      <q-item-section class="name" @click="goProfilePage">
        <span>{{ username }}</span>
      </q-item-section>

      <q-item-section side thumbnail class="q-mb-xs tata">
        <q-btn icon="more_vert" flat round padding="none" color="#F7F7FF" class="shortcut">
          <q-tooltip>More</q-tooltip>
          <q-menu class="bg-grey-9 text-white" auto-close>
            <q-list style="min-width: 100px">

              <q-item clickable @click="goProfilePage">
                <q-item-section>Profile</q-item-section>
              </q-item>
    
              <q-item v-if="!isMe && status === UserStatus.INGAME" clickable @click="goSpectate">
                <q-item-section>Watch</q-item-section>
              </q-item>
              <q-item v-else-if="!isMe && status === UserStatus.ONLINE" clickable @click="goGameOptions">
                <q-item-section>Play</q-item-section>
              </q-item>

              <q-item v-if="!isMe && !isFriend() && !isBlocked() && !$store.friendRequestSent?.includes(username)" clickable @click="follow">
                <q-item-section>Follow</q-item-section>
              </q-item>

              <q-separator v-if="!isMe" dark />
              <q-item v-if="!isMe && ($store.friendRequestSent?.includes(username) || isFriend())" clickable class="text-red-7" @click="confirmUnfollow = true">
                <q-item-section>Unfollow</q-item-section>
              </q-item>

              <q-item v-if="!isMe && !isBlocked()" clickable class="text-red-7" @click="confirmBlock = true">
                <q-item-section>Block</q-item-section>
              </q-item>
              <q-item v-else-if="!isMe && isBlocked()" clickable class="text-red-7" @click="confirmUnblock = true">
                <q-item-section>Unblock</q-item-section>
              </q-item>

            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    <q-dialog persistent v-model=confirmUnfollow>
      <Confirm :what="`unfollow ${username}`" :accept="unfollow" />
    </q-dialog>
    <q-dialog persistent v-model=confirmBlock>
      <Confirm :what="`block ${username}`" :accept="block" />
    </q-dialog>
    <q-dialog persistent v-model=confirmUnblock>
      <Confirm :what="`unblock ${username}`" :accept="block" />
    </q-dialog>
    <q-dialog v-model="gameOptions">
      <ChooseGameOptions :opponent="username" :closeFunction="closeGameOptions" :inviteType="false"  />
    </q-dialog>
  </q-item>
</template>

<script lang="ts">
import { UserStatus } from 'src/stores/store.types';
import Confirm from 'src/components/Confirm.vue'
import { defineComponent, ref, watch } from 'vue';
import utils from 'src/services/utils.service'
import ChooseGameOptions from 'src/components/ChooseGameOptions.vue'

export default defineComponent({
  name: 'UserCard',
  components: { Confirm, ChooseGameOptions },
  props: {
    username          : { type: String,  required: true },
    icon_name         : { type: String,  default : ''   },
    icon_color        : { type: String,  default : ''   },

    banned            : { type: Boolean, default: false },
    muted             : { type: Boolean, default: false },

    duration          : { type: String, default: '' }
  },
  setup() {
    const confirmUnfollow = ref(false)
    const confirmBlock = ref(false)
    const confirmUnblock = ref(false)
    const gameOptions = ref(false)
    return {
      confirmUnfollow,
      confirmBlock,
      confirmUnblock,
			gameOptions,
			closeGameOptions() {
				gameOptions.value = false
			},
    }
  },
  data() {
    return {
      utils,
      status: this.$store.getStatus(this.username) as UserStatus,
      UserStatus,
      isMe: this.username === this.$store.username ? true : false as Boolean
    }
  },
  created () {
    watch(() => this.$store.getStatus(this.username), val => {
			this.status = this.$store.getStatus(this.username)
		})
  },
  updated () {
    this.status = this.$store.getStatus(this.username)
  },
  computed: {
    channelId() {
      return this.$store.getChannelIDByUsername(this.username)
    },
    channelPath() {
      return `/channel/${this.channelId}`
    }
  },
  methods: {
    isFriend () {
      return (this.$store.friends?.find(e => e === this.username))
    },
    isBlocked () {
      return (this.$store.blocked?.find(e => e === this.username))
    },
    getLoginStatus() {
      const s = this.$store.getStatus(this.username)
      if (s === UserStatus.ONLINE)
        return 'ONLINE-status'
      else if (s === UserStatus.WATCHING)
        return 'WATCHING-status'
      else if (s === UserStatus.INGAME)
        return 'INGAME-status'
      return 'OFFLINE-status'
    },
    goProfilePage() {
      this.$router.push({
        path: '/profile/' + this.username,
      })
    },
    goGameOptions() {
      const status = this.$store.getStatus(this.username)
      if (status === UserStatus.ONLINE) {
        this.$emit('goGameOptions', this.username)
        this.gameOptions = true
      }
      else if (status === UserStatus.WATCHING || status === UserStatus.INGAME)
        this.$q.notify({type: "warning", message: `${this.username} is busy.`})
      else
        this.$q.notify({type: "warning", message: `${this.username} is not connected.`})
    },
    goSpectate () {
      const game = this.$store.getUserGame(this.username)
      if (game != undefined)
        this.$router.push(`/spectate${game.map == '3D' ? '3d' : ''}/${game.gameId}?playerOneName=${game.playerOneName}&playerTwoName=${game.playerTwoName}`)
    },
    follow() {
      this.$api.follow(this.username)
        .then(() => { })
        .catch(() => { })
    },
    unfollow() {
      this.$api.unfollow(this.username)
        .then(() => { })
        .catch(() => { })
    },
    block() {
      this.$api.block(this.username)
        .then(() => { })
        .catch(() => { })
    }
  },
});
</script>

<style lang="sass" scoped>

.name
  margin-left: 0
.avatar
  width: 30px
  height: 30px
  border-radius: 50%
  margin-right: 0

.usermenu .toto
  visibility: hidden
  width: 10px !important
  padding: 0
  padding-left: 5px

.usermenu .tata
  width: auto
  visibility: hidden
  padding: 0
  padding-left: 5px
  display: flex
  justify-content: flex-end

.usermenu:hover .toto
  visibility: visible

.usermenu:hover .tata
  visibility: visible

.shortcut .toto
  visibility: hidden

.shortcut:hover .toto
  visibility: visible

.shortcut
  margin-left: 10px

.shortcut .tata
  visibility: hidden

.shortcut:hover .tata
  visibility: visible

.tata
  width: 80px
  flex-direction: row
</style>
