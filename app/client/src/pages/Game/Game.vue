<template>
	<q-page>
			<DrawGame>
			</DrawGame>
	</q-page>
</template>

<!-- window.innerHeight -->
<script lang="ts">
import { ref, defineComponent, computed } from 'vue'
import DrawGame from './components/DrawGame.vue'
// import { watch } from 'vue'
import { throttle } from 'lodash'

// var timeOutFunctionId = undefined as any;


export default defineComponent({
	name: 'Game',
	components: {DrawGame},
	data() {
		return {
			player_height: 100,
			canvas : <HTMLCanvasElement> document.getElementById('canvas'),
			height_ratio: 1,
			true_player_height: 100,
			gameId: "",
			animResize: 0,
			throttleValue: 10,
			game_paused: false,
		};
	},
	methods:
	{
		getPlayerPosition(event: any): any {
			const canvasLocation = this.canvas.getBoundingClientRect();
			this.height_ratio = this.canvas.height / 720;
			this.true_player_height = this.player_height * this.height_ratio;
			let mouseLocation = (event.type === "touchmove" ? event.changedTouches[0].clientY : event.clientY) - canvasLocation.y;
			let y = 50
			if (mouseLocation < (this.true_player_height / 2)) {
				y = 0;
			} else if (mouseLocation > this.canvas.height - (this.true_player_height / 2)) {
				y = this.canvas.height - (this.true_player_height);
			} else {
				y = mouseLocation - (this.true_player_height) / 2;
			}
			return y / this.height_ratio
		},
		sendPosition(event: any) {
			if (this.game_paused)
				return
			this.$ws.socket.volatile.emit(`${this.gameId}___mousemove`, this.getPlayerPosition(event))
		},
		askForPauseUnpause(){
			this.$ws.socket.volatile.emit(`${this.gameId}___ask_pause`, this.$store.username)
		},
		handleCoundown(data: any) {
			if (data.status == 'done') {
				this.game_paused = false;
			}
			else if (data.status == 'pending') {
				this.game_paused = true;
			}
		},
	},
	beforeMount() {
		this.gameId = this.$route.params.gameId.toString() as string;
	},
	mounted() {
		document.dispatchEvent(new CustomEvent('stop-listening-for-game-invite'));
		this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
		const sendPositionThrottled = throttle(this.sendPosition, this.throttleValue)
		addEventListener('keypress', (event) => {
			if (event.code == 'Space')
				this.askForPauseUnpause();
			});
		this.canvas.addEventListener('mousemove', sendPositionThrottled); // player
	},
	beforeUnmount() {
		this.$ws.emit('quit', {})
		this.canvas.removeEventListener('mousemove', this.sendPosition); // player
		this.canvas.removeEventListener('keypress', (event) => {
			if (event.code == 'Space')
				this.askForPauseUnpause();
			});
		document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));

	}
})
</script>

<style scoped>
main {
	display: flex;
	flex-direction: column;
}

h1,
p,
ul {
	text-align: center;
	list-style: none;
	padding: 0;
	flex-direction: column;
}

li {
	display: inline-block;
}
</style>


