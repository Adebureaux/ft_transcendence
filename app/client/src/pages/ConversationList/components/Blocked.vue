<template>
	<q-item id="Blocked" class="row q-pr-xs">
		<q-item-section style="max-width: 44px;" @click="goProfilePage" id="avatar"><q-tooltip>{{username}}'s profile</q-tooltip>

			<q-avatar size="38px" :style="`background-color: ${$utils.usernameToColor(username)};`">
				<img :src="`/api/avatar/${username}/thumbnail`">
				<div :class="getLoginStatus()" class="loginstatus" />
			</q-avatar>
		</q-item-section>

		<q-item-section id="name" class="hideable" @click="goProfilePage">
			{{ username }}
		</q-item-section>

		<q-item-section side class="text-right hideable">
      <div>
			  <q-btn dense flat class="q-pr-md" icon="mdi-account-cancel-outline" color="red" />
      </div>
		</q-item-section>
		<q-item-section id="reqbuttons" class="toggleVisibility">

			<q-btn-group flat class="justify-end  text-right">
				<q-btn no-wrap dense flat color="red" label="cancel" icon="mdi-cancel" @click="confirmUnblock = true"/>
			</q-btn-group>
		</q-item-section>
		<q-item-section  side>
        <q-btn icon="more_vert" flat round padding="none" color="#F7F7FF"><q-tooltip>More</q-tooltip>
          <q-menu class="bg-grey-9 text-white" auto-close>

            <q-list style="min-width: 100px">

              <q-item clickable @click="goProfilePage">
                <q-item-section>Profile</q-item-section>
              </q-item>




            </q-list>
         </q-menu>
        </q-btn>
      </q-item-section>
	</q-item>
	<q-separator />


  <q-dialog persistent v-model=confirmUnblock>
    <Confirm :what="`unblock block ${username}`" :accept="block" />
  </q-dialog>
</template>

<script lang="ts">
import { UserStatus } from 'src/stores/store.types';
import Confirm from 'src/components/Confirm.vue'
import ChooseGameOptions from 'src/components/ChooseGameOptions.vue'
import { defineComponent, ref } from 'vue';

export default defineComponent({
	name: 'Blocked',
	components: { Confirm, ChooseGameOptions },
	props: {
		username: { type: String, required: true },
	},
  setup() {
    const confirmUnblock = ref(false)
    return {
      confirmUnblock,
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
		goProfilePage() {
			this.$router.push({
				path: '/profile/' + this.username,
			})
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
#Blocked:hover
  background-color: $blue-grey-14
#Blocked:hover .hideable
  display: none

.toggleVisibility
  display: none

#Blocked:hover .toggleVisibility
  display: flex
</style>
