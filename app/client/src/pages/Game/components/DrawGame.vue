<template>
	<div>

		<ul>
			<div class="q-ml-md q-gutter-sm">
				<!-- <q-btn color="blue" @click="toggle" icon="fullscreen" padding="xs"></q-btn> -->
				<!-- <p> {{ gameId }}</p> -->
				<div id="2ddiv">
					<canvas :class="$q.fullscreen.isActive ? `fullscreen` : `normalscreen`" id="canvas"></canvas>
					<!-- <q-btn id="fullscreen-btn" color="light-grey" @click="toggle" icon="fullscreen" padding="xs"></q-btn> -->
				</div>
			</div>
		</ul>
	</div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import { watch } from 'vue'
// import { throttle, uniqueId } from 'lodash'

var timeOutFunctionId = undefined as any;
let test = undefined as any

export default defineComponent({
	name: 'DrawGame',
	data() {
		return {
			game_paused: true,
			info_value: null,
			canvas: <HTMLCanvasElement> document.getElementById('canvas'),
			gameId: "",
			throttleValue: 15,
			height_ratio: 1,
			width_ratio: 1,
			player_height: 90,
			player_width: 5,
			ball_x: 550,
			ball_y: 360,
			ball_r: 5,
			player1_y: 310,
			player2_y: 310,
			player1_score: 0,
			player2_score: 0,
			playerOneName: "p1",
			playerTwoName: "p2",
			namedisplay : ""
		};
	},
	methods:
	{
		draw() {
			const elementsColor: string = this.game_paused && this.info_value ? "#F7F7FF" : "#F7F7FF";
        	var context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
        	// Draw field
			context.fillStyle = "#242729";
        	context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        	// Draw middle line
        	context.strokeStyle = elementsColor;
        	context.beginPath();
        	context.moveTo(this.canvas.width / 2, 0);
        	context.lineTo(this.canvas.width / 2, this.canvas.height);
        	context.stroke();

			context.font = `${this.canvas.height * 0.05}px 'Press Start 2P'`;
			context.fillStyle = '#6C757D';
			context.fillText(
				this.playerOneName,
        	    this.canvas.width / 2 -
        	        (this.canvas.width * 0.05 + context.measureText(this.playerOneName).width),
        	    this.canvas.height * 0.95
        	);
			context.fillText(
				this.playerTwoName,
        	    this.canvas.width / 2 + this.canvas.width * 0.05,
        	    this.canvas.height * 0.95
        	);
        	// Draw players
        	context.fillStyle = elementsColor;
			context.fillRect(
        	    2,
        	    (this.player1_y + 5) * this.height_ratio,
        	    this.player_width * this.width_ratio,
        	    this.player_height * this.height_ratio
        	);
			context.fillStyle = elementsColor;
        	context.fillRect(
        	    (this.canvas.width - this.player_width * this.width_ratio)- 2,
        	    (this.player2_y + 5) * this.height_ratio,
        	    this.player_width * this.width_ratio,
        	    this.player_height * this.height_ratio
        	);
        	// Draw ball
        	context.beginPath();
        	context.fillStyle = elementsColor;
        	context.arc(
        	    this.ball_x * this.width_ratio,
        	    this.ball_y * this.height_ratio,
        	    this.ball_r * this.height_ratio,
        	    0,
        	    7,
        	    false
        	);
        	context.fill();
        	context.font = `${this.canvas.height * 0.07}px 'Press Start 2P'`;
        	context.fillText(
        	    this.player1_score.toString(),
        	    this.canvas.width / 2 -
        	        (this.canvas.width * 0.05 + context.measureText(this.player1_score.toString()).width),
        	    this.canvas.height * 0.1
        	);
        	context.fillText(
        	    this.player2_score.toString(),
        	    this.canvas.width / 2 + this.canvas.width * 0.05,
        	    this.canvas.height * 0.1
        	);
        	if (this.game_paused && this.info_value) {
        	    const textSize = context.measureText(this.info_value);
				const textSize_name = context.measureText(this.namedisplay);
        	    context.fillStyle = "#F7F7FF";
        	    context.fillText(this.info_value, this.canvas.width / 2 - textSize.width / 2, this.canvas.height / 2);
				context.fillText(this.namedisplay, this.canvas.width / 2 - textSize_name.width / 2, this.canvas.height * 0.60);


				context.font = `${this.canvas.height * 0.02}px 'Press Start 2P'`;
				context.fillStyle = '#6C757D';
				if (this.$route.name?.toString().startsWith("spectate"))
				{
					context.font = `${this.canvas.height * 0.02}px 'Press Start 2P'`;
				context.fillText("double-click to go full screen", this.canvas.width * 0.05 , this.canvas.height * 0.80);
				}
				else
				{
					context.font = `${this.canvas.height * 0.02}px 'Press Start 2P'`;
					context.fillText("press space to pause", this.canvas.width * 0.05 , this.canvas.height * 0.75);
					context.fillText("double-click to go full screen", this.canvas.width * 0.05 , this.canvas.height * 0.80);
				}
        	}
    	},
		waitEndResize() {
			clearTimeout(timeOutFunctionId);
			timeOutFunctionId = setTimeout(this.onResize, 200);
		},
		onResize() {
			if (this.$q.fullscreen.isActive == true) {

				if (window.screen.orientation.type == "portrait-primary") {
					this.canvas.height = window.innerWidth / 1.6;
					this.canvas.width = window.innerWidth;
				}
				else {
					this.canvas.width = window.innerWidth;
					this.canvas.height = window.innerHeight;
				}
			}
			else {
				this.canvas.height = window.innerWidth / 1.5 / 1.6;
				this.canvas.width = window.innerWidth / 1.5;
			}
			this.height_ratio = this.canvas.height / 720;
        	this.width_ratio = this.canvas.width / 1100;
			this.draw();
		},

		toggle(e: any) {
			const target = <HTMLElement>document.getElementById('2ddiv')
			this.$q.fullscreen.toggle(target)
				.then(() => {
				})
				.catch((err) => {
					alert(err)
				})
			this.draw();
		},
		update_and_draw(data: any) {
			let bidule = new Uint16Array(data.gamedata)
			this.player1_y = bidule[0]
			this.player2_y = bidule[1]
			this.ball_x =  bidule[2]
			this.ball_y = bidule[3]
			this.player1_score = bidule[4]
			this.player2_score = bidule[5]
			this.draw();
		},
		handleCoundown(data: any) {
			if (data.status == 'done') {
				this.game_paused = false;
				this.info_value = null;
				this.namedisplay = "";

			}
			else if (data.status == 'pending') {
				this.game_paused = true;
				this.info_value = data.value;
				this.namedisplay = (data.name == undefined) ? "": data.name
			}
			this.draw()
		},
		handleGameEnd(data: any) {
			this.game_paused = true;
			this.info_value = data.value;
			this.draw()
			setTimeout(() => {
				this.$router.push("/profile/me")
			}, 1000)
		}
	},
	created() {
		this.gameId = this.$route.params.gameId.toString() as string;
		this.playerOneName = this.$route.query.playerOneName as string;
		this.playerTwoName = this.$route.query.playerTwoName as string;
	},
	mounted() {
		this.canvas = <HTMLCanvasElement>document.getElementById('canvas')
		this.$ws.listen(`${this.gameId}___countdown`, this.handleCoundown);
		this.$ws.listen(`${this.gameId}___game-end`, this.handleGameEnd);
		this.$ws.listen(`${this.gameId}___frame-update`, this.update_and_draw);
		this.canvas.addEventListener('dblclick', this.toggle);
		window.addEventListener('resize', this.onResize);
		watch(() => this.$q.fullscreen.isActive, val => {
			this.onResize();
		})
		this.onResize();
	},
	beforeUnmount() {
		this.$ws.removeListener(`${this.gameId}___countdown`)
		this.$ws.removeListener(`${this.gameId}___game-end`)
		this.$ws.removeListener(`${this.gameId}___frame-update`)
		this.canvas.removeEventListener('dblclick',this.toggle )
		window.removeEventListener('resize', this.onResize);
		this.$ws.emit('quit', {})
	}
})
</script>

<style scoped>
main {
	display: flex;
	flex-direction: column;
}
#canvas {
	position:absolute;
	left:50%;
    transform: translateX(-50%);
	z-index: 0;
	border: 5px solid white;
}

.normalscreen{
	top:5%;
}

.fullscreen {
	top:0%;

}

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


