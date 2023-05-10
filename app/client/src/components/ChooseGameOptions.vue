<template>
	<div class="dialog">
		<div class="close-cross">
			<q-btn class="cross absolute-right" color="orange" icon="close" flat round v-close-popup />
		</div>
		<div class="q-px-xl r-py-md">
			<q-item-label class="press2p bigger">Game Options</q-item-label>
		</div>
		<q-item-section class="q-pa-md">
			<q-separator color="grey-9" />
			<q-option-group inline v-model="map" :options="maps" color="grey-9" keep-color>
				<template v-slot:label="map">
					<div class="row items-center">
						<!-- <q-item-label class="label">{{ map.label }}</q-item-label> -->
						<q-img class="image q-ma-md" :src="`/maps/${map.value}.png`" />
					</div>
				</template>
			</q-option-group>
			<q-separator color="grey-9" />
			<div class="q-pa-md rounded-borders">
				<q-item-label class="label press2p" style="opacity: 0.4; font-size:10px !important;">
					Difficulty level
				</q-item-label>
				<q-option-group inline v-model="opt" :options="opts" color="grey-9" keep-color>
					<template v-slot:label="dif">
						<div class="row items-center">
							<q-item-label class="q-pa-auto label">{{ dif.label }}</q-item-label>
						</div>
					</template>
				</q-option-group>
			</div>
		</q-item-section>
		<q-item class="justify-center centers q-mb-lg">
			<q-btn class="label press2p" :label="inviteType ? 'Start matchmaking' :`Play against ${opponent}`" color="orange" dense outline
				@click="clickfct" />
		</q-item>
        <q-dialog persistent v-model="MatchMakingStart">
		    <WaitForPairing sent :map=map :difficulty=opt />
	    </q-dialog>
		<q-dialog persistent v-model="InviteNotif">
			<GameInvitation :opponent="opponent" sent :map=map :difficulty=opt />
		</q-dialog>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import GameInvitation from './GameInvitation.vue'
import WaitForPairing from './WaitForPairing.vue'


export default defineComponent({
	components: { GameInvitation , WaitForPairing},
	name: 'GameOptions',
	setup() {
		const InviteNotif = ref(false)
        const MatchMakingStart = ref(false)
		return {
            MatchMakingStart,
			map: ref('2D'),
			maps: [
				{ label: '2D', value: '2D' },
				{ label: '3D', value: '3D' }
			],
			opt: ref('Easy'),
			opts: [
				{ label: 'Easy', value: 'Easy' },
				{ label: 'Medium', value: 'Medium' },
				{ label: 'Hard', value: 'Hard' },
			],
			InviteNotif,
		}
	},
	props: {
		opponent: { type: String, default: null },
        inviteType: {type: Boolean, default: false},
		closeFunction: { type: Function, default: null },
	},
	methods: {
		async invite() {
			document.dispatchEvent(new CustomEvent('stop-listening-for-game-invite'));

			return new Promise((resolve, reject) => {
				const that = this;
				const cancel = () => {
					that.$ws.emit('game-invite-canceled', {})
					document.removeEventListener('invite-response-canceled', cancel);
					reject({ status: 'CANCELED', gameOptions: null });
				}
				document.addEventListener('invite-response-canceled', cancel) // listening cancel action from inviter
				this.$ws.emit('game-invite', { target_user: this.opponent, map: this.map, difficulty: this.opt })
				this.$ws.socket.once('game-invite-accepted', (data: object) => {

					document.removeEventListener('invite-response-canceled', cancel);

					resolve({ status: 'ACCEPTED', gameOptions: data })
				})
				this.$ws.socket.once('game-invite-declined', (reason: string) => {
					document.removeEventListener('invite-response-canceled', cancel);
					reject({ status: reason, gameOptions: null })
				})
			})
		},
		async sendInviteAndOpen() {
			this.InviteNotif = true
			document.dispatchEvent(new CustomEvent('stop-listening-for-game-invite'));
			try {
				await this.invite()
				this.InviteNotif = false
				this.$ws.removeListener('game-invite-accepted')
				this.$ws.removeListener('game-invite-declined')
				this.$ws.socket.once('game-setup-and-init-go-go-power-ranger', (gameOptions: any, callback: Function) => {
					callback("OK")
					if (gameOptions.map == "3D")
						this.$router.push(`/game3d/${gameOptions.gameId}?playerOneName=${gameOptions.playerOneName}&playerTwoName=${gameOptions.playerTwoName}`)
					else
						this.$router.push(`/game/${gameOptions.gameId}?playerOneName=${gameOptions.playerOneName}&playerTwoName=${gameOptions.playerTwoName}`)
				})
			}
			catch (err: any) {
				this.InviteNotif = false
				this.$ws.removeListener('game-invite-accepted')
				this.$ws.removeListener('game-invite-declined')
				if (err.status === "DECLINED")
					this.$store.notifCenter.send({ type: 'warning', avatar: `/api/avatar/${this.opponent}/thumbnail`, message: this.opponent + " refused your invitation" })
				else if (err.status === "NOT_CONNECTED")
					this.$store.notifCenter.send({ type: 'warning', avatar: `/api/avatar/${this.opponent}/thumbnail`, message: this.opponent + " is not connected" })
				else if (err.status === "TIMEOUT")
					this.$store.notifCenter.send({ type: 'warning', avatar: `/api/avatar/${this.opponent}/thumbnail`, message: this.opponent + " did not respond" })
				document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));
				this.closeFunction()
			}
		},
        startMatch()
        {
            this.MatchMakingStart = true;
			this.$ws.socket.once("already-in-matchmacking", () => {
				this.MatchMakingStart = false;
				this.$store.notifCenter.send({ type: 'warning', message: "your are already in matchmacking" })
			})
        },
        clickfct()
        {
            if(this.inviteType)
                this.startMatch()
            else
                this.sendInviteAndOpen()
        }

	},
    mounted(){
			document.dispatchEvent(new CustomEvent('stop-listening-for-game-invite'));
	},
	unmounted() {
		document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));
	}
})
</script>

<style lang="sass" scoped>
@use "../css/interpolate" as r

.image
  @include r.interpolate(width, 320px, 2560px, 30px, 60px)
</style>
