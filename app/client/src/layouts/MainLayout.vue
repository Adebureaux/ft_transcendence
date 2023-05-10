<template>

	<q-layout view="lHh Lpr lFf">

		<q-header elevated>
			<q-toolbar class="toolbar">
				<q-btn flat @click="$store.drawerStatus = !$store.drawerStatus" round dense icon="menu" />

				<q-item class="absolute-center relative-position label thetitle glow" clickable @click="goHome" style="">
          <q-tooltip anchor="bottom middle" self="center middle">Home</q-tooltip>Transcendence&trade;
        </q-item>

				<q-space />

				<q-icon flat round size="25px" v-if="!$store.ws_connected" name="wifi_off" class="isnotconnected" />
				<!-- <q-icon flat round size="25px" v-else name="wifi_on" class="isconnected" /> -->
				<q-btn-group spread class="buttonsgrid items-center justify-center" flat>
					<q-btn class="r-mx-sm" dense round flat color="orange-4" @click="goLeaderBoardPage()"                    icon="mdi-podium"   ><q-tooltip>LeaderBoard</q-tooltip></q-btn>
					<q-btn class="r-mx-sm" dense round flat color="grey-7"   @click="notifyCenterLever = !notifyCenterLever" icon="notifications"><q-tooltip>Notification center</q-tooltip><NotifyCenter /></q-btn>
					<q-btn class="r-mx-sm" dense round flat color="grey-7"   @click="goSettingsNotif"                        icon="settings"     ><q-tooltip>Settings</q-tooltip></q-btn>
					<q-btn class="r-mx-sm" dense round flat color="red-8"    @click="logout"                                 icon="mdi-logout"   ><q-tooltip>Quick Logout</q-tooltip></q-btn>
				</q-btn-group>
			</q-toolbar>
		</q-header>

		<q-drawer v-model="$store.drawerStatus" show-if-above :breakpoint="800" :width="300">
			<q-scroll-area class="scroll">
				<ConversationList />
			</q-scroll-area>
				<!-- <q-img class="absolute-top" src="src/assets/one.jpg" style="height: 90px"> -->

			<q-img @click="goProfilePage" class="absolute-top" src="/material.png" style="height: 90px">
				<q-item clickable class="usercard">
          <q-tooltip anchor="center middle" self="center middle">
            Your profile page
          </q-tooltip>
        <q-item-section v-if="$store.username" avatar>
          <q-avatar class="avatar" :style="`background-color: ${$utils.usernameToColor($store.username)};`" size="60px" >
            <q-img :src="`/api/avatar/${$store.username}/thumbnail`" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="main-name text-orange">{{ $store.username }}</q-item-label>
        </q-item-section>
				</q-item>
			</q-img>
			<q-dialog v-model="settings">
				<settings />
			</q-dialog>
			<q-dialog persistent v-model="invitationFrom">
				<GameInvitation :opponent="opponent" :map="maps" :difficulty="difficulty" />
			</q-dialog>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
	<q-ajax-bar ref="ajaxBar" position="bottom" color="blue-grey-3" size="10px" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ConversationList from "src/pages/ConversationList/ConversationList.vue";
import Settings from "src/components/Settings.vue";
import NotifyCenter from "src/components/NotifyCenter.vue";
import GameInvitation from "src/components/GameInvitation.vue";
import ncc from "src/services/notifyCenter";
import { Convert } from "src/stores/store.validation";
import {
	ChannelSubscription, UserStatus,
} from "src/stores/store.types";
// import { setTimeout } from "timers/promises";

export default defineComponent({
	name: "MainLayout",
	components: {
		ConversationList,
		Settings,
		GameInvitation,
    NotifyCenter,
	},
	setup() {
		const invitationFrom = ref(false);
		const settings = ref(false);
		const notifyCenterLever = ref(false);
		const ajaxBar = ref(null)

		return {
			notifyCenterLever,
			settings,
			openSettings() {
				settings.value = true;
			},
			invitationFrom,
			ajaxBar
		};
	},
	data() {
		return {
      nc: ncc,
			opponent: "",
			maps: "",
			difficulty: "",
			listening_for_game_invite: false,
		};
	},
	methods: {
		    onGameAnnouncement(running_games: any[]) {
			this.$store.running_games = running_games;
		},
		fetchGames() {
			this.$api.games()
				.then((result) => {
					this.$store.running_games = result.data
				})
				.catch(() => {})
		},
		goProfilePage() {
			this.$router.push({
				path: "/profile/me",
			});
		},
    	goLeaderBoardPage() {
			this.$router.push({
				path: "/leaderboard",
			});
		},
		goSettingsNotif() {
			this.openSettings();
		},
		logout() {
			this.$router.push("/logout");
		},
		goHome() {
			this.$router.push("/");
		},
		onGameInviteBusy(data: any, callback: Function) {
			callback("DECLINED");
		},
		onGameInvite(data: any, callback: Function) {
			const that = this;
			this.opponent = data.from;
			this.maps = data.map;
			this.difficulty = data.difficulty;
			this.$ws.removeListener("game-invite");
			this.$ws.socket.once("game-invite-canceled", (res: any) => {
				that.invitationFrom = false;
				document.removeEventListener("invite-response-accept", accept);
				document.removeEventListener("invite-response-decline", decline);
				that.$ws.listen("game-invite", that.onGameInvite);
			});
			const accept = function (res: any) {
				callback("ACCEPTED");
				that.invitationFrom = false;
				that.$ws.socket.once(
					"game-setup-and-init-go-go-power-ranger",
					(gameOptions: any, callback: Function) => {
						callback("OK");
						if (gameOptions.map == "3D")
							that.$router.push(
								`/game3d/${gameOptions.gameId}?playerOneName=${gameOptions.playerOneName}&playerTwoName=${gameOptions.playerTwoName}`
							);
						else
							that.$router.push(
								`/game/${gameOptions.gameId}?playerOneName=${gameOptions.playerOneName}&playerTwoName=${gameOptions.playerTwoName}`
							);
						document.removeEventListener("invite-response-accept", accept);
					}
				);
				document.removeEventListener("invite-response-decline", decline);
				that.$ws.removeListener("game-invite-canceled");
				that.$ws.listen("game-invite", that.onGameInvite); //might need to remove this until the game is finished
			};
			const decline = (res: any) => {
				callback("DECLINED");
				this.invitationFrom = false;
				document.removeEventListener("invite-response-accept", accept);
				document.removeEventListener("invite-response-decline", decline);
				this.$ws.removeListener("game-invite-canceled");
				this.$ws.listen("game-invite", this.onGameInvite);
			};
			this.invitationFrom = true;
			document.addEventListener("invite-response-accept", accept);
			document.addEventListener("invite-response-decline", decline);
		},
		listenForGameInvite() {
			if (!this.listening_for_game_invite) {
				this.$ws.removeListener("game-invite");
				this.$ws.listen("game-invite", this.onGameInvite);
				this.listening_for_game_invite = true;
			}
		},
		stopListeningForGameInvite() {
			if (this.listening_for_game_invite) {
				this.$ws.removeListener("game-invite");
				this.$ws.listen("game-invite", this.onGameInviteBusy);

				this.listening_for_game_invite = false;
			}
		},
		handleNotifMessageEvent(payload: any) {
			interface __NotifMessage {
				username: string;
				message: string;
			}
			const notif: __NotifMessage = payload as __NotifMessage;

			this.nc.send({
				message: `New message from ${notif.username}: ${notif.message}`,
				type: "message",
				avatar: `/api/avatar/${notif.username}/thumbnail`,
        timeout: 3000,
			});
		},
		listenForMatchmaking() {
			this.stopListeningForGameInvite();
			this.$ws.socket.once(
				"game-setup-and-init-go-go-power-ranger",
				(gameOptions: any, callback: Function) => {
					callback("OK");
					this.$router.push(
						`/game${gameOptions.map == "3D" ? "3d" : ""}/${gameOptions.gameId
						}?playerOneName=${gameOptions.playerOneName}&playerTwoName=${gameOptions.playerTwoName
						}`
					);
					this.StoplisteningForMatchmaking();
					this.stopListeningForGameInvite();
				}
			);
		},
		StoplisteningForMatchmaking() {
			this.listenForGameInvite();
			this.$ws.socket.removeListener("game-setup-and-init-go-go-power-ranger");
		},
	},
	created() {
		let first_connection = this.$store.first_connection;
		this.$store.$reset()
		this.$store.first_connection = first_connection;
   		this.$store.notifCenter?.clear()
	},
	async beforeCreate() {
		await this.$api.axiosInstance
		.get("/users/me")
		.then((response) => {
			this.$store.setStoreData(Convert.toStoreData2(response.data));
		})
		.catch((error) => {
			this.$router.push("/force-logout");
		})
		await this.$ws.connect().catch(() => {});
		this.$ws.socket.on("fetch_me", async () => {
			await this.$api.fetchMe()
		})
		this.$ws.listen('game-announcement', this.onGameAnnouncement);
		this.$ws.socket.on("logout", async () => {
			this.$store.ws_connected = false;
			this.$router.push("/force-logout");
		})
		this.$ws.socket.on("channel_deleted", (channelId: string) => {
			this.$store.deleteChannel(channelId);
		})
		this.$ws.listen("notifmessage", this.handleNotifMessageEvent);
		this.$ws.listen("altered_subscription", (payload: ChannelSubscription) => {
			this.$api.fetchMe();
		});
		this.$ws.listen("users-status", (payload: { username: string; status: UserStatus }[]) => {
			if (payload)
				this.$store.setUsersStatus(payload);
		});
		this.listenForGameInvite();
		this.nc.init(this.$q);
		if (this.$route.query?.refreshed === "true" && this.$route.query?.from) {
			this.$router.push({path: this.$route.query.from as string || "", replace: true});
		}
		document.addEventListener(
			"can-listen-for-game-invite",
			this.listenForGameInvite
		);
		document.addEventListener(
			"stop-listening-for-game-invite",
			this.stopListeningForGameInvite
		);
		document.addEventListener(
			"ready-for-matchmaking",
			this.listenForMatchmaking
		);
		document.addEventListener(
			"stop-for-matchmaking",
			this.StoplisteningForMatchmaking
		);
	},
  	mounted () {
		if (this.$store.first_connection) {
			this.openSettings();
			this.$store.first_connection = false;
		}
		this.$api.axiosInstance.get("/games/running").then((response) => {
			this.$store.running_games = response.data;
		}).catch((error) => {});
  	},
	beforeUnMount() {
		this.$ws.removeListener("users-status");
		this.$ws.removeListener("notifmessage");
		this.$ws.removeListener("logout");
		this.$ws.removeListener("fetch_me");
		this.$ws.removeListener("game-invite");
		this.$ws.removeListener('game-announcement');

		document.removeEventListener(
			"can-listen-for-game-invite",
			this.listenForGameInvite
		);
		document.removeEventListener(
			"stop-listening-for-game-invite",
			this.stopListeningForGameInvite
		);
		document.removeEventListener(
			"ready-for-matchmaking",
			this.listenForMatchmaking
		);
		document.removeEventListener(
			"stop-for-matchmaking",
			this.StoplisteningForMatchmaking
		);
	},
	unmounted() {
		this.$store.$reset();
		this.$ws.disconnect();

        // this.nc.destroy();
    },
});
</script>

<style lang="sass">
.main-name
  font-size: 20px
  font-weight: bold

.usercard-image
  border-radius: 1000px
  z-index: 2

.notifmenu
  width: 420px !important
  background-color: $bg-primary

body
  background-color: $bg-primary !important
  color: grey
</style>

<style lang="sass" scoped>
@use "../css/interpolate" as r

.toolbar
  height: 90px
  background-color: $bg-secondary !important
  color: grey

.scroll
  height: calc(100% - 90px)
  margin-top: 90px
  background-color: $bg-secondary
  overflow-x: hidden


.usercard
  display: flex
  height: 90px
  width: 300px

.thetitle
  font-family: 'Press Start 2P'
  font-weight: bold
  @include r.interpolate(font-size, 320px, 2560px, 10px, 40px)

.glow
  text-shadow: -1px 1px 2px $grey-9
  color: transparent
  --bg-size: 200%
  background: -webkit-linear-gradient(45deg, #ff7300, #9e9e9e9e, #9e9e9e9e  ,#ff7300,#ff7300)  0 0 / var(--bg-size) 100%
  -webkit-background-clip: text
  background-clip: text
  -webkit-text-fill-color: transparent
  animation: glowing 18s infinite linear


@keyframes glowing
  0%
    background-position: 0 0
  50%
    background-position: 400% 0
  100%
    background-position: 0 0

.isnotconnected
  margin-right: 5px
  color: red

.isconnected
  margin-right: 5px
  color: green
.buttonsgrid
  display: grid
  grid-template-columns: 1fr 1fr
  grid-template-rows: 1fr 1fr
  // grid-gap: 10px
  > *
    @include r.interpolate((width, height), 320px, 2560px, 25px, 48px)
</style>
