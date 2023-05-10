<template>
  <div class="top-panel row items-center">

    <q-toolbar>
		<span class="titlename" >{{ $store.currentChannelName }}</span>
		<q-space/>
    <div v-if="$store.currentChannelType !== 'ONE_TO_ONE'">
      <q-btn v-if="$store.currentChannelSub?.role === 'OWNER' && $store.current_channel_state === 'ACTIVE'" flat dense round icon="mdi-cog-outline" @click="settings = true"><q-tooltip>Channel settings</q-tooltip></q-btn>
      <q-btn v-if="$store.currentChannelSub?.role !== 'OWNER' && $store.currentChannelType === 'PRIVATE'" flat dense round size="14px" icon="mdi-logout" class="interpolate-btn" @click="confirmLeave = true"><q-tooltip>Leave channel</q-tooltip></q-btn>
      <q-btn v-else-if="$store.currentChannelSub?.role === 'OWNER'" flat dense round size="16px" icon="mdi-delete-forever" class="interpolate-btn" @click="confirmDelete = true"><q-tooltip>Delete channel</q-tooltip></q-btn>
    </div>
    <div class="q-ml-sm" v-if="$store.currentChannelType !== 'ONE_TO_ONE'">
      <q-icon v-if="$store.currentChannelSub?.role === 'ADMIN'" color="grey-6" size="35px" name="mdi-shield-sword-outline" @click="openManual('admin')"><q-tooltip>Admin</q-tooltip></q-icon>
      <q-icon v-else-if="$store.currentChannelSub?.role === 'OWNER'" color="grey-6" size="35px" name="mdi-shield-crown-outline" @click="openManual('owner')"><q-tooltip>Owner</q-tooltip></q-icon>
      <q-icon v-else color="grey-6" size="35px" name="mdi-shield-bug-outline"><q-tooltip>User</q-tooltip></q-icon>
    </div>
    </q-toolbar>

    <q-dialog persistent v-model="settings">
      <CreateChannel settings :closeFn=closeSettings />
    </q-dialog>

    <q-dialog persistent v-model=confirmDelete>
      <Confirm what="delete the channel" :accept=leaveChannel />
    </q-dialog>

    <q-dialog persistent v-model=confirmLeave>
      <Confirm what="leave the channel" :accept=leaveChannel />
    </q-dialog>

    <q-dialog v-model="chatManual">
      <div class="dialog manual q-pa-md">
        <div class="close-cross">
          <q-btn class="cross absolute-right" color="orange" icon="close" flat round v-close-popup />
        </div>
        <div class="q-px-xl r-py-md">
          <q-item-section>
            <q-item-label class="bigger">Chat Manual</q-item-label>
          </q-item-section>
        </div>
        <q-item>
          <q-item-label class="on-left">
            <div class="q-mb-lg">
              <span class="label">
                /ban [username] [minutes]<br/>
              </span>
              <span class="text-blue-grey-4">
                Use this to ban someone from the channel, don't forget to set a duration
                Example: type '/ban tharchen 60' to ban tharchen for an hour<br/>
              </span>
            </div>
            <div class="q-mb-lg">
              <span class="label">
                /mute [username] [minutes]
              </span>
              <br/>
              <span class="text-blue-grey-4">
                Use this to mute someone from the channel, don't forget to set a duration<br/>
                Example: type '/ban tharchen 10' to mute tharchen for 10 minutes
              </span>
            </div>
            <div class="q-mb-lg">
              <span class="label">
                /kick [username]
              </span>
              <br/>
              <span class="text-blue-grey-4">
                Use this to kick someone from the channel<br/>
                Example: type '/kick tharchen' to kick tharchen
              </span>
            </div>
            <div class="q-mb-lg">
              <span class="label">
                /promote [username]
              </span>
              <br/>
              <span class="text-blue-grey-4">
                Use this to set someone as admin of the channel<br/>
                Example: type '/promote rballage' to set rballage as admin
              </span>
            </div>
            <div class="q-mb-lg" v-if="manualRole === 'owner'">
              <span class="label">
                /demote [username]
              </span>
              <br/>
              <span class="text-blue-grey-4">
                Use this to set an admin as simple user<br/>
                Example: type '/demote tharchen' to demote tharchen from his admin role
              </span>
            </div>
            <div class="q-mb-lg">
              <span class="label">
                /pardon [username]
              </span>
              <br/>
              <span class="text-blue-grey-4">
                Use this to remove a kick or a ban on an user<br/>
                Example: type '/pardon ssingevi' to clear ssingevi's current kick or ban
              </span>
            </div>
          </q-item-label>
        </q-item>
      </div>
    </q-dialog>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import Confirm from 'src/components/Confirm.vue'
import CreateChannel from 'src/components/CreateChannel.vue'
import * as storeTypes from "src/stores/store.types";

export default defineComponent({
  name: 'ChatUsersList',
  components: { CreateChannel, Confirm },
  setup () {
    const confirmDelete = ref(false)
    const confirmLeave = ref(false)
    const settings = ref(false)
    const chatManual = ref(false)
    return {
      closeSettings() {
        settings.value = false
      },
      confirmDelete,
      confirmLeave,
      settings,
      chatManual,
      manualRole: '' as string
    }
  },
  data() {
    return {
      minidrawerStatus: false as boolean,
      subs: computed(() => this.$store.currentChannelSub?.channel?.subscribedUsers),
    }
  },
  methods: {
    openManual(role : string) {
      this.manualRole = role
      this.chatManual = true
    },
    lockChannel() {
      this.$emit('lockChannel')
    },
    getLoginStatus(username: string) {
      return 'OFFLINE-status'
    },
    avatarstr(username: string) {
      return `/api/avatar/${username}/thumbnail`
    },
    leaveChannel() {
      const channelId : string = this.$store.active_channel
      this.$router.push('/')
      this.$api.leaveChannel(channelId).catch(() => {})
    }
  },
});
</script>

<style lang="sass" scoped>

.manual
  text-align: left

.image
  width: 42px
  height: 42px
  border-radius: 250px

.top-panel
  display: flexbox
  justify-content: space-between
  padding: 10px 0px 10px 10px
  background-color: #303030
  width: 100%

.titlename
  font-weight: bold
  color: grey
  font-family: 'Press Start 2P'
  font-size: 1.5em

.menuusers-username
  width: 200px
  font-size: 17px
  word-break: break-word

.menuusers
  height: 500px
  display: flexbox
  justify-content: space-between

.q-bg
  background-color: $bg-primary !important

.card
  background-color: #424242
  color: orange
  border-radius: 10px
  padding: 5px 15px
  margin-right: 5px
  margin-top: 0


.userlist
  height: 100%
  margin-top: 50px

.role
  min-width: 80px

.avatar
  max-width: 42px !important
  // margin-top: 10px
  margin-left: 10px
  margin-right: 10px

.loginstatus
  width: 15px
  height: 15px
  border-radius: 100px
  position: absolute
  margin-top: 27px
  margin-left: 27px

.ONLINE-status
  background-color: $onlineStatus-online
  box-shadow: 0px 0px 5px $onlineStatus-online
.OFFLINE-status
  background-color: $onlineStatus-offline
  box-shadow: 0px 0px 5px $onlineStatus-offline
.INGAME-status
  background-color: $onlineStatus-ingame
  box-shadow: 0px 0px 5px $onlineStatus-ingame

.pannel
  position: fixed
  width: 631px
  z-index: 1

</style>
