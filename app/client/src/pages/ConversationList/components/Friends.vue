<template>
	<q-item id="Friends" class="row q-pr-xs">
		<q-item-section style="max-width: 44px;" @click="goProfilePage" id="avatar"><q-tooltip>{{username}}'s profile</q-tooltip>
      <q-avatar size="38px" :style="`background-color: ${$utils.usernameToColor(username)};`">
        <img  :src="`/api/avatar/${username}/thumbnail`">
        <div :class="getLoginStatus()" class="loginstatus" />
      </q-avatar>
		</q-item-section>

		<q-item-section id="name" class="hideable" @click="goProfilePage">
			{{ username }}
		</q-item-section>

		<!-- <q-item-section side class="text-right hideable">
      <div>
			  <q-icon class="q-pr-md" size="20px" name="mdi-gamepad-variant-outline" color="green" />
        <q-icon size="20px" name="chat" color="orange" />
      </div>
		</q-item-section> -->
		<q-item-section id="reqbuttons" class="toggleVisibility">

			<q-btn-group flat class="justify-end  text-right">
				<q-btn v-if="status === UserStatus.INGAME" dense flat no-wrap color="cyan" label="watch" icon="mdi-gamepad-variant-outline" @click="goSpectate"/>
        <q-btn v-else-if="status === UserStatus.ONLINE" dense flat no-wrap color="green" label="play" icon="mdi-gamepad-variant-outline" @click="goGameOptions"/>
        <q-btn v-else disable dense flat no-wrap color="grey" label="play" icon="mdi-gamepad-variant-outline"/>
				<q-btn no-wrap dense flat color="orange" label="chat" icon="chat" @click="goChat"/>
			</q-btn-group>
		</q-item-section>
		<q-item-section  side>
        <q-btn icon="more_vert" flat round padding="none" color="#F7F7FF"><q-tooltip>More</q-tooltip>
          <q-menu class="bg-grey-9 text-white" auto-close>

            <q-list style="min-width: 100px">

              <q-item clickable @click="goProfilePage">
                <q-item-section>Profile</q-item-section>
              </q-item>

              <q-separator dark />

              <q-item clickable class="text-red-7" @click="confirmUnfollow = true">
                <q-item-section>Unfollow</q-item-section>
              </q-item>
              <q-item clickable class="text-red-7" @click="confirmBlock = true">
                <q-item-section>Block</q-item-section>
              </q-item>

            </q-list>

          </q-menu>
        </q-btn>
      </q-item-section>
	</q-item>
	<q-separator />

  <q-dialog v-model="gameOptions">
    <ChooseGameOptions :opponent="username" :closeFunction="closeGameOptions" :inviteType="false" />
  </q-dialog>
  <q-dialog persistent v-model=confirmBlock>
    <Confirm :what="`block ${username}`" :accept="block" />
  </q-dialog>
  <q-dialog persistent v-model=confirmUnfollow>
    <Confirm :what="`unfollow ${username}`" :accept="unfollow" />
  </q-dialog>
</template>

<script lang="ts">
import { UserStatus } from 'src/stores/store.types';
import Confirm from 'src/components/Confirm.vue'
import ChooseGameOptions from 'src/components/ChooseGameOptions.vue'
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
	name: 'Friends',
	components: { Confirm, ChooseGameOptions },
	props: {
		username: { type: String, required: true },
	},
  setup() {
    const gameOptions = ref(false)
    const confirmBlock = ref(false)
    const confirmUnfollow = ref(false)
    return {
      gameOptions,
      confirmBlock,
      confirmUnfollow,
      closeGameOptions() {
        gameOptions.value = false
      },
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
  data () {
    return {
      status: this.$store.getStatus(this.username) as UserStatus,
      UserStatus
    }
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
		getLoginStatus() {
			const status = this.$store.getStatus(this.username)
      if (status === UserStatus.ONLINE)
        return 'ONLINE-status'
      else if (status === UserStatus.WATCHING)
        return 'WATCHING-status'
      else if (status === UserStatus.INGAME)
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
    goChat() {
      if (this.channelId)
        this.$router.push({
          path: `/conversation/${this.channelId}`,
        })
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
		},
	},
});
</script>

<style lang="sass" scoped>

#Friends:hover
  background-color: $blue-grey-14
#Friends:hover .hideable
  display: none

.toggleVisibility
  display: none

#Friends:hover .toggleVisibility
  display: flex
</style>
