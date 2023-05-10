<template>
	<q-item id="PendingRequest" class="row q-pr-xs">
		<q-item-section style="max-width: 44px;" @click="goProfilPage" id="avatar"><q-tooltip>{{username}}'s profile</q-tooltip>
			<q-avatar size="38px" :style="`background-color: ${$utils.usernameToColor(username)};`">
				<img  :src="`/api/avatar/${username}/thumbnail`">
				<div :class="getLoginStatus()" class="loginstatus" />
			</q-avatar>
		</q-item-section>

		<q-item-section id="name" class="hideable">
			{{ username }}
		</q-item-section>

		<q-item-section side class="text-right hideable">
			<!-- <q-icon v-if="shortcut_profile" class="shortcut" name="person" color="cyan" @click="goProfilPage" />
			<q-icon v-if="shortcut_block" class="shortcut" name="person_off" color="red" @click="block" /> -->
			<!-- <q-icon v-if="category === 'sent'" class="shortcut" name="cancel" color="red" @click="unfollow" />
			<q-icon v-if="category === 'received'" class="shortcut" name="done" color="green" @click="follow" /> -->
			<q-icon v-if="category === 'received'" name="mdi-account-arrow-down-outline" color="cyan" />
			<q-icon v-else-if="category === 'sent'" name="mdi-account-arrow-up-outline" color="orange" />

		</q-item-section>
		<q-item-section id="reqbuttons" class="toggleVisibility">

			<q-btn-group flat class="justify-end  text-right">
				<q-btn  dense flat
				:color="category === 'received' ? 'red' : 'orange'"
				:label="category === 'received' ? 'decline' : 'cancel'"
				:icon="category === 'received' ?  'mdi-cancel' : 'mdi-close'" @click="unfollow"/>
				<q-btn no-wrap dense flat v-if="category === 'received'" color="cyan" label="accept" icon="check" @click="follow"/>
			</q-btn-group>
		</q-item-section>
		<q-item-section  side>
        <q-btn icon="more_vert" flat round padding="none" color="#F7F7FF"><q-tooltip>More</q-tooltip>
          <q-menu class="bg-grey-9 text-white" auto-close>

            <q-list style="min-width: 100px">

              <q-item v-if="menu_profile" clickable @click="goProfilPage">
                <q-item-section>Profile</q-item-section>
              </q-item>

              <q-separator dark />

              <q-item v-if="menu_block" clickable class="text-red-7" @click="confirmBlock = true">
                <q-item-section>Block</q-item-section>
              </q-item>

            </q-list>

          </q-menu>
        </q-btn>
      </q-item-section>
	</q-item>
	<q-separator />
  <q-dialog persistent v-model=confirmBlock>
    <Confirm :what="`block ${username}`" :accept="block" />
  </q-dialog>
</template>

<script lang="ts">
import { UserStatus } from 'src/stores/store.types';
import Confirm from 'src/components/Confirm.vue'
import { defineComponent, ref } from 'vue';

export default defineComponent({
	name: 'PendingRequest',
	components: { Confirm },
	props: {
		username: { type: String, required: true },
		category: { type: String, required: true },

		menu_profile: { type: Boolean, default: false },
		menu_block: { type: Boolean, default: false },

		shortcut_profile: { type: Boolean, default: false },
		shortcut_block: { type: Boolean, default: false },
	},
  setup() {
    const confirmBlock = ref(false)
    return {
      confirmBlock
    }
  },
	data() {
		return {
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
			//TODO: check login status
      if (status === UserStatus.ONLINE)
        return 'ONLINE-status'
      else if (status === UserStatus.WATCHING)
        return 'WATCHING-status'
      else if (status === UserStatus.INGAME)
        return 'INGAME-status'
      return 'OFFLINE-status'
		},
		goProfilPage() {
			this.$router.push({
				path: '/profile/' + this.username,
			})
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
		},
	},
});
</script>

<style lang="sass" scoped>

#PendingRequest:hover
  background-color: $blue-grey-14
#PendingRequest:hover .hideable
  display: none

.toggleVisibility
  display: none

#PendingRequest:hover .toggleVisibility
  display: flex
</style>
