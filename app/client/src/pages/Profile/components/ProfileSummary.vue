<template>
  <div class="r-pa-lg">
    <q-item class="q-pb-lg">
      <q-item-section avatar>
        <q-avatar class="avatar" :style="`background-color: ${$utils.usernameToColor(name)};`">
          <q-img :src="avatar"/>
        </q-avatar>
      </q-item-section>
      <q-item class="q-pa-none">
        <q-item-section>
          <q-item-label class="bigger name">{{ name }}</q-item-label>
        </q-item-section>
        <q-item v-if="interact && name != $store.username && !isBlocked()">
          <q-item-section v-if="$store.getStatus(name) === UserStatus.INGAME">
            <q-btn icon="mdi-gamepad-variant-outline" flat round class="interpolate-btn q-mr-xs" color="cyan" @click="goSpectate"><q-tooltip>Watch</q-tooltip></q-btn>
          </q-item-section>
          <q-item-section v-else-if="$store.getStatus(name) === UserStatus.ONLINE">
            <q-btn icon="mdi-gamepad-variant-outline" flat round class="interpolate-btn q-mr-xs" color="green" @click="goGameOptions"><q-tooltip>Play</q-tooltip></q-btn>
          </q-item-section>
          <q-item-section v-else>
            <q-btn disabled icon="mdi-gamepad-variant-outline" flat round class="interpolate-btn q-mr-xs" color="grey"><q-tooltip>User is not connected</q-tooltip></q-btn>
          </q-item-section>
          <q-item-section v-if="isFriend()">
            <q-btn  class="interpolate-btn" icon="chat" flat round color="orange" @click="userSelected()"><q-tooltip>Chat</q-tooltip></q-btn>
          </q-item-section>
          <q-item-section>
            <q-btn v-if="!isFriend() && !isBlocked() && !$store.friendRequestSent?.includes(name)" flat round class="interpolate-btn"
            :icon="!$store.friendRequestRecevied?.includes(name) ? 'mdi-account-plus-outline' : 'mdi-account-arrow-down-outline'"
            :color="!$store.friendRequestRecevied?.includes(name) ? 'green': 'cyan'" @click="follow">
              <q-tooltip>Add friend</q-tooltip>
            </q-btn>
            <q-btn v-if="$store.friendRequestSent?.includes(name)" flat round class="interpolate-btn" icon="mdi-account-arrow-up-outline" color="orange" @click="unfollow"><q-tooltip>Cancel friend request</q-tooltip></q-btn>
            <q-btn v-else-if="isFriend()" flat round class="interpolate-btn" icon="mdi-account-remove-outline" color="grey-7" @click="confirmUnfollow = true"><q-tooltip>Remove friend</q-tooltip></q-btn>
          </q-item-section>
          <q-item-section>
            <q-btn v-if="!isBlocked()" flat round class="interpolate-btn" icon="mdi-account-cancel-outline" color="grey-7" @click="confirmBlock = true"><q-tooltip>Block</q-tooltip></q-btn>
          </q-item-section>
        </q-item>
        <q-item v-else-if="interact && name != $store.username && isBlocked()">
          <q-item-section>
            <q-btn flat round class="interpolate-btn" icon="mdi-account-cancel-outline" color="red" @click="confirmUnblock = true"><q-tooltip>Unblock</q-tooltip></q-btn>
          </q-item-section>
        </q-item>
      </q-item>
      <q-dialog v-model="gameOptions">
        <ChooseGameOptions :opponent="name" :closeFunction="closeGameOptions" :inviteType="false"  />
      </q-dialog>
    </q-item>
  </div>
  <q-item>
    <q-item-section>
      <q-item-label class="press2p label score">Victories<div class="medium victory">{{victory}}</div></q-item-label>
    </q-item-section>
    <q-separator vertical color="blue-grey-5" spaced/>
    <q-item-section>
      <q-item-label class="press2p label score ">Defeats<div class="defeat medium">{{defeat}}</div></q-item-label>
    </q-item-section>
    <q-separator vertical color="blue-grey-5" spaced/>
    <q-item-section>
      <q-item-label class="press2p label score ">Ratio<div class="medium">{{ratio(victory, defeat)}}%</div></q-item-label>
    </q-item-section>
  </q-item>
  <q-separator color="blue-grey-5" spaced/>
  <q-dialog persistent v-model=confirmBlock>
      <Confirm :what="`block ${name}`" :accept="block" />
    </q-dialog>
    <q-dialog persistent v-model=confirmUnblock>
      <Confirm :what="`unblock ${name}`" :accept="block" />
    </q-dialog>
    <q-dialog persistent v-model=confirmUnfollow>
      <Confirm :what="`unfollow ${name}`" :accept="unfollow" />
    </q-dialog>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue'
import ChooseGameOptions from 'src/components/ChooseGameOptions.vue'
import Confirm from 'src/components/Confirm.vue'
import { UserStatus } from 'src/stores/store.types'

export default defineComponent({
  name: 'ProfileSummary',
  components: { ChooseGameOptions, Confirm },
  props: {
    name    : { type: String , default: '' },
    avatar  : { type: String , required: true },
    victory : { type: Number , default: 0 },
    defeat  : { type: Number , default: 0 },
    interact : { type: Boolean, default: false }
  },
	setup() {
		const gameOptions = ref(false)
    const confirmBlock = ref(false)
    const confirmUnblock = ref(false)
    const confirmUnfollow = ref(false)
		return {
			gameOptions,
      confirmBlock,
      confirmUnblock,
      confirmUnfollow,
			closeGameOptions() {
				gameOptions.value = false
			},
		}
	},
  data () {
    return {
      status: this.$store.getStatus(this.name) as UserStatus,
      UserStatus,
    }
  },
  created () {
    watch(() => this.$store.getStatus(this.name), val => {
			this.status = this.$store.getStatus(this.name)
		})
  },
  updated () {
    this.status = this.$store.getStatus(this.name)
  },
  methods: {
    ratio(v: number, d: number): string {
      if (v === 0)
        return '0'
      else if (d === 0)
        return '100'
      return (v / (v + d) * 100).toFixed(0)
    },
    isFriend () {
      return (this.$store.friends?.find(e => e === this.name))
    },
    isBlocked () {
      return (this.$store.blocked?.find(e => e === this.name))
    },
    follow() {
      this.$api.follow(this.name)
        .then(() => { })
        .catch((e) => {
          if (e?.response?.data?.message)
            this.$q.notify({type: "warning", message: e.response.data.message })
          else
            this.$q.notify({type: "warning", message: 'unable to follow this user' })
        })
    },
    unfollow() {
      this.$api.unfollow(this.name)
        .then(() => { })
        .catch((e) => {
          if (e?.response?.data?.message)
            this.$q.notify({type: "warning", message: e.response.data.message })
          else
            this.$q.notify({type: "warning", message: 'unable to unfollow this user' })
        })
    },
    userSelected() {
			const channelID = this.$store.getChannelIDByUsername(this.name as string)
			this.$router.push({
				path: `/conversation/${channelID}`,
			})
		},
    goGameOptions() {
      const status = this.$store.getStatus(this.name)
      if (status === UserStatus.ONLINE) {
        this.$emit('goGameOptions', this.name)
        this.gameOptions = true
      }
      else if (status === UserStatus.WATCHING || status === UserStatus.INGAME)
        this.$q.notify({type: "warning", message: `${this.name} is busy.`})
      else
        this.$q.notify({type: "warning", message: `${this.name} is not connected.`})
    },
    goSpectate () {
      const game = this.$store.getUserGame(this.name)
      if (game != undefined)
        this.$router.push(`/spectate${game.map == '3D' ? '3d' : ''}/${game.gameId}?playerOneName=${game.playerOneName}&playerTwoName=${game.playerTwoName}`)
    },
    block() {
      this.$api.block(this.name)
      .then(() => { })
      .catch(() => { })
    }
  }
})
</script>

<style lang="sass" scoped>
@use "../../../css/interpolate" as r

.wrap
  flex-wrap: wrap

.name
  @include r.interpolate(font-size, 320px, 2560px, 20px, 50px)
  @include r.interpolate(padding-left, 320px, 2560px, 0px, 40px)
  font-weight: bold
  overflow: auto
  text-align: left

.avatar
  @include r.interpolate(font-size, 320px, 2560px, 35px, 80px)

.score
  text-align: center

</style>
