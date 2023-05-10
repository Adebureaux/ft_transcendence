<template>
	<div>
				<div id="div3d">
					<canvas  id="canvas_txt"></canvas>
					<div  id='gameCanvas'></div>
				</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import { watch } from 'vue'
import * as THREE from 'three';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass';

let renderscene = undefined as any;
let composer = undefined as any;
let bloomPass = undefined as any;
let glitchPass = undefined as any;
// var	loader = new THREE.TextureLoader();
let		scene = 	undefined as any
let		renderer =	undefined as any
let		camera =	undefined as any

let ball = 			undefined as any
let paddle1 = 		undefined as any
let paddle2 = 		undefined as any
let bigSphere = 	undefined as any
let bigSphere_2 = 	undefined as any
let bigSphere_3 = 	undefined as any
let bigSphere_4 = 	undefined as any
let back = 			undefined as any
let front = 		undefined as any
let left = 			undefined as any
let right = 		undefined as any
let plane = 		undefined as any
let trail0 = 		undefined as any
let trail1 = 		undefined as any
let trail2 = 		undefined as any
let trail3 = 		undefined as any
let trail4 = 		undefined as any
let trail5 = 		undefined as any
let trail6 = 		undefined as any
let trail7 = 		undefined as any
let trail8 = 		undefined as any
let trail9 = 		undefined as any
let trail10 = 		undefined as any
let trail11 = 		undefined as any
let trail12 = 		undefined as any
let trail13 = 		undefined as any
let trail14 = 		undefined as any
let trail15 = 		undefined as any
let trail16 = 		undefined as any
let trail17 = 		undefined as any
let trail18 = 		undefined as any
let trail19 = 		undefined as any


const	fieldWidth = 1150, fieldHeight = 725;
const	paddleWidth = 10, paddleHeight = 90, paddleDepth = 5;
const	radius = 20, segments = 0;
const	bigradius = 2000, bigsegments = 1;
const	VIEW_ANGLE = 50, NEAR = 0.1, FAR = 6000;
const bloomstrength = 1.6
const bloomradius = 0.1
const bloomthreshold = 0

export default defineComponent({
	name: 'DrawGame',
	data() {
		return {
			game_paused: true,
			info_value: null,
			canvas: <HTMLCanvasElement> document.getElementById('gameCanvas'),
			canvas_txt : <HTMLCanvasElement>document.getElementById('canvas'),
			gameId: "",
			player1_score: 0,
			player2_score: 0,
			// storeMe: useMeStore(),
			playerOneName: "p1",
			playerTwoName: "p2",
			prevviewside: false,
			context: null as any,
			namedisplay : "",
			frame : undefined as any,
			start_game : false,
			timeOutFunctionId : undefined as any,
		}
	},
	props: 
	{
		viewside: {type: Boolean, default: false}
	},
	methods:
	{
		setupMaterial()
		{
			const	planeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});
			const	borderMaterial = new THREE.MeshBasicMaterial({color: 0xDF740C, wireframe: true});
			const	paddle1Material = new THREE.MeshBasicMaterial({color: 0x7DFDFE, wireframe: true});
			const	paddle2Material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
			const	sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xFFFFFF , wireframe: true} );

			const	sphereMaterial0 = new THREE.MeshBasicMaterial( {color: 0x56618d , wireframe: true} );
			const	sphereMaterial1 = new THREE.MeshBasicMaterial( {color: 0x53628d, wireframe: true} );
			const	sphereMaterial2 = new THREE.MeshBasicMaterial( {color: 0x4f628d, wireframe: true} );
			const	sphereMaterial3 = new THREE.MeshBasicMaterial( {color: 0x4b638e, wireframe: true} );
			const	sphereMaterial4 = new THREE.MeshBasicMaterial( {color: 0x48638d, wireframe: true} );
			const	sphereMaterial5 = new THREE.MeshBasicMaterial( {color: 0x44648d, wireframe: true} );
			const	sphereMaterial6 = new THREE.MeshBasicMaterial( {color: 0x40648d, wireframe: true} );
			const	sphereMaterial7 = new THREE.MeshBasicMaterial( {color: 0x3c648d, wireframe: true} );
			const	sphereMaterial8 = new THREE.MeshBasicMaterial( {color: 0x39658c, wireframe: true} );
			const	sphereMaterial9 = new THREE.MeshBasicMaterial( {color: 0x35658c, wireframe: true} );
			const	sphereMaterial10 = new THREE.MeshBasicMaterial( {color: 0x30668b, wireframe: true} );
			const	sphereMaterial11 = new THREE.MeshBasicMaterial( {color: 0x2c668a, wireframe: true} );
			const	sphereMaterial12 = new THREE.MeshBasicMaterial( {color: 0x286689, wireframe: true} );
			const	sphereMaterial13 = new THREE.MeshBasicMaterial( {color: 0x246789, wireframe: true} );
			const	sphereMaterial14 = new THREE.MeshBasicMaterial( {color: 0x1f6788, wireframe: true} );
			const	sphereMaterial15 = new THREE.MeshBasicMaterial( {color: 0x1a6786, wireframe: true} );
			const	sphereMaterial16 = new THREE.MeshBasicMaterial( {color: 0x156785, wireframe: true} );
			const	sphereMaterial17 = new THREE.MeshBasicMaterial( {color: 0x106884, wireframe: true} );
			const	sphereMaterial18 = new THREE.MeshBasicMaterial( {color: 0x096882, wireframe: true} );
			const	sphereMaterial19 = new THREE.MeshBasicMaterial( {color: 0x036881 , wireframe: true} );

			const	BigsphereMaterial0 = new THREE.MeshBasicMaterial( {color: 0x0f1af0 , wireframe: true} );
			const	BigsphereMaterial1 = new THREE.MeshBasicMaterial( {color: 0x0089ff , wireframe: true} );
			const	BigsphereMaterial2 = new THREE.MeshBasicMaterial( {color: 0x00c9ff , wireframe: true} );
			const	BigsphereMaterial3 = new THREE.MeshBasicMaterial( {color: 0x7dfdfe , wireframe: true} );

			back =  new THREE.Mesh(new THREE.CylinderGeometry(5, 5, fieldHeight + 5, 3, 25), borderMaterial);
			front =  new THREE.Mesh(new THREE.CylinderGeometry(5, 5, fieldHeight + 5, 3, 25),borderMaterial);
			left =  new THREE.Mesh(new THREE.CylinderGeometry(5, 5, fieldWidth + 5, 3, 25), borderMaterial);
			right =  new THREE.Mesh(new THREE.CylinderGeometry(5, 5, fieldWidth + 5, 3, 25),borderMaterial);

			let i = 2
			trail0 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial0);
			trail1 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial1);
			trail2 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial2);
			trail3 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial3);
			trail4 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial4);
			trail5 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial5);
			trail6 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial6);
			trail7 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial7);
			trail8 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial8);
			trail9 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial9);
			trail10 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial10);
			trail11 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial11);
			trail12 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial12);
			trail13 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial13);
			trail14 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial14);
			trail15 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial15);
			trail16 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial16);
			trail17 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial17);
			trail18 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial18);
			trail19 =  new THREE.Mesh(new THREE.IcosahedronGeometry(20/(i++) + 0.2, segments), sphereMaterial19);

			trail0.position.z = radius + 5
			trail1.position.z = radius + 5
			trail2.position.z = radius + 5
			trail3.position.z = radius + 5
			trail4.position.z = radius + 5
			trail5.position.z = radius + 5
			trail6.position.z = radius + 5
			trail7.position.z = radius + 5
			trail8.position.z = radius + 5
			trail9.position.z = radius + 5
			trail10.position.z = radius + 5
			trail11.position.z = radius + 5
			trail12.position.z = radius + 5
			trail13.position.z = radius + 5
			trail14.position.z = radius + 5
			trail15.position.z = radius + 5
			trail16.position.z = radius + 5
			trail17.position.z = radius + 5
			trail18.position.z = radius + 5
			trail19.position.z = radius + 5

			ball =  new THREE.Mesh(new THREE.IcosahedronGeometry(radius, segments), sphereMaterial);
			bigSphere =  new THREE.Mesh(new THREE.IcosahedronGeometry(bigradius - 200, bigsegments), BigsphereMaterial0);
			bigSphere_2 =  new THREE.Mesh(new THREE.IcosahedronGeometry(bigradius - 400 , bigsegments), BigsphereMaterial1);
			bigSphere_3 =  new THREE.Mesh(new THREE.IcosahedronGeometry(bigradius - 600, bigsegments), BigsphereMaterial2);
			bigSphere_4 =  new THREE.Mesh(new THREE.IcosahedronGeometry(bigradius, bigsegments), BigsphereMaterial3);
			paddle1=  new THREE.Mesh(new THREE.CylinderGeometry(paddleWidth,paddleWidth, paddleHeight, 3, 4), paddle1Material);
			paddle2 =  new THREE.Mesh(new THREE.CylinderGeometry(paddleWidth,paddleWidth, paddleHeight, 3, 4),paddle2Material);
			plane =  new THREE.Mesh(new THREE.BoxGeometry(fieldWidth - 10, fieldHeight - 10, 10 ), planeMaterial);

		},
		setup()
		{	
			this.setupMaterial();
			this.createScene();
		},
		createScene()
		{
			let HEIGHT = window.innerWidth / 1.5 / 1.6;
			let WIDTH = window.innerWidth / 1.5;
			camera = new THREE.PerspectiveCamera( VIEW_ANGLE,  WIDTH / HEIGHT, NEAR, FAR);
			// scene.background = loader.load( 'https://cdn.sortiraparis.com/images/1001/94880/721017-espace-un-objet-mysterieux.jpg' );
			scene.backgroundIntensity = 0.3;
			renderer.setSize(WIDTH, HEIGHT);
			renderer.domElement.id = 'testid';
			scene.add(back);
			scene.add(front);
			scene.add(left);
			scene.add(right);
			scene.add(bigSphere);
			scene.add(bigSphere_2);
			scene.add(bigSphere_3);
			scene.add(bigSphere_4);
			scene.add(camera);
			scene.add(paddle1);
			scene.add(paddle2);
			scene.add(ball);
			scene.add(plane);
			scene.add(trail0)
			scene.add(trail1)
			scene.add(trail2)
			scene.add(trail3)
			scene.add(trail4)
			scene.add(trail5)
			scene.add(trail6)
			scene.add(trail7)
			scene.add(trail8)
			scene.add(trail9)
			scene.add(trail10)
			scene.add(trail11)
			scene.add(trail12)
			scene.add(trail13)
			scene.add(trail14)
			scene.add(trail15)
			scene.add(trail16)
			scene.add(trail17)
			scene.add(trail18)
			scene.add(trail19)

			this.canvas.appendChild(renderer.domElement);	
			camera.position.x = (this.$store.username == this.playerOneName) ? -3500 : 3500;
			camera.rotation.y = (this.$store.username == this.playerOneName) ? -70 * Math.PI/180 : 70 * Math.PI/180;
			camera.rotation.z = (this.$store.username == this.playerOneName) ? -90 * Math.PI/180 : 90 * Math.PI/180;
			ball.position.x = 0;
			ball.position.y = 0;
			ball.position.z = radius + 5;
			back.position.x = -fieldWidth/2;
			front.position.x = fieldWidth/2;
			left.position.y = -fieldHeight/2;
			right.position.y = fieldHeight/2;
			back.position.z = 10
			front.position.z = 10
			left.position.z = 10
			right.position.z = 10
			left.rotation.z = 90 * Math.PI/180
			right.rotation.z = 90 * Math.PI/180
			paddle1.position.x = -fieldWidth/2 + paddleWidth + 15;
			paddle2.position.x = fieldWidth/2 - paddleWidth - 15;
			paddle1.position.z = 15;
			paddle2.position.z = 15;
			camera.position.z = 1050;
			this.cameraPhysics()
			renderscene = new RenderPass( scene, camera );
			composer = new EffectComposer(renderer);
			composer.addPass(renderscene);
			bloomPass = new UnrealBloomPass(
				new THREE.Vector2(WIDTH, HEIGHT),
				bloomstrength,
				bloomradius,
				bloomthreshold
			)
			composer.addPass(bloomPass);
			composer.addPass(glitchPass);	
		},
		draw()
		{
			const elementsColor: string = "white";
        	this.context = <CanvasRenderingContext2D>this.canvas_txt.getContext("2d");
			this.context.clearRect(0,0,this.canvas_txt.width,this.canvas_txt.height)
			this.context.font = `${this.canvas.height * 0.03}px 'Press Start 2P'`;
			this.context.fillStyle = elementsColor;
			this.context.strokeStyle = 'black';
			this.context.fillText(
				this.playerOneName,
        	    this.canvas_txt.width / 2 -
        	        (this.canvas_txt.width * 0.2 + this.context.measureText(this.playerOneName).width),
        	    this.canvas_txt.height * 0.08
        	);
			this.context.fillText(
				this.playerTwoName,
        	    this.canvas_txt.width / 2 + this.canvas_txt.width * 0.2,
        	    this.canvas_txt.height * 0.08
        	);
        	this.context.fillStyle = elementsColor;
        	this.context.fill();
        	this.context.font = `${this.canvas_txt.height * 0.07}px 'Press Start 2P'`;
        	this.context.fillText(
        	    this.player1_score.toString(),
        	    this.canvas_txt.width / 2 -
        	        (this.canvas_txt.width * 0.05 + this.context.measureText(this.player1_score.toString()).width),
        	    this.canvas_txt.height * 0.1
        	);
        	this.context.fillText(
        	    this.player2_score.toString(),
        	    this.canvas_txt.width / 2 + this.canvas_txt.width * 0.05,
        	    this.canvas_txt.height * 0.1
        	);
        	if (this.game_paused && this.info_value) {
        	    const textSize = this.context.measureText(this.info_value);
				const textSize_name = this.context.measureText(this.namedisplay);
        	    this.context.fillStyle = "white";
        	    this.context.fillText(this.info_value, this.canvas_txt.width / 2 - textSize.width / 2, this.canvas_txt.height / 2);
				this.context.fillText(this.namedisplay, this.canvas_txt.width / 2 - textSize_name.width / 2, this.canvas_txt.height * 0.60);
				if (this.$route.name?.toString().startsWith("spectate3d"))
				{
					this.context.font = `${this.canvas.height * 0.02}px 'Press Start 2P'`;
				// this.context.fillStyle = 'white';
				this.context.fillText("press space to change side", this.canvas.width * 0.05 , this.canvas.height * 0.75);
				this.context.fillText("double-click to go full screen", this.canvas.width * 0.05 , this.canvas.height * 0.80);
				}
				else
				{
					this.context.font = `${this.canvas.height * 0.02}px 'Press Start 2P'`;
					// this.context.fillStyle = 'white';
					this.context.fillText("press space to pause", this.canvas.width * 0.05 , this.canvas.height * 0.75);
					this.context.fillText("double-click to go full screen", this.canvas.width * 0.05 , this.canvas.height * 0.80);
				}
        	}
			// renderer.render(scene, camera);
			this.cameraPhysics();
			renderscene.camera = camera
			composer.render();
			this.frame = requestAnimationFrame(this.draw);
		},
		cameraPhysics()
		{
			if (!this.start_game)
			{
				this.openingTraveling(this.$store.username == this.playerOneName);
			}
			else if (this.prevviewside != this.viewside)
				this.travelingdesesmort()
			else if (this.$store.username == this.playerOneName || this.viewside)
			{
				// p1 position
				camera.position.y += (paddle1.position.y - camera.position.y) * 0.001;
				camera.position.x = paddle1.position.x - 300;
				camera.rotation.x = 0;
				// camera.position.z = paddleDepth + 800;
				camera.rotation.y = -40 * Math.PI/180;
				camera.rotation.z = -90 * Math.PI/180;
			}
			else
			{
				// p2 position
				camera.position.y += (paddle2.position.y - camera.position.y) * 0.001;
				camera.position.x = paddle2.position.x + 300;
				camera.rotation.x = 0;
				// camera.position.z = paddleDepth + 800;
				camera.rotation.y = 40 * Math.PI/180;
				camera.rotation.z = 90 * Math.PI/180;
			}
		},
		openingTraveling(player : boolean)
		{
			if (player)
			{
				camera.position.z -=  0.006 * (1050 -  (805));
				camera.position.x -=  0.006 * (-3500 -  (paddle1.position.x - 300));
				camera.rotation.y -= 0.006 * ((-70 * Math.PI/180) - (-40 * Math.PI/180));
				if (camera.position.x >= paddle1.position.x - 300)
					this.start_game = true;
			}
			else
			{
				camera.position.z -=  0.006 * (950 -  (805));
				camera.position.x -=  0.006 * (3500 -  (paddle2.position.x + 300));
				camera.rotation.y -= 0.006 * ((70 * Math.PI/180) - (40 * Math.PI/180));
				if (camera.position.x <= paddle2.position.x + 300)
					this.start_game = true;
			}
		},
		travelingdesesmort()
		{
			if (!this.viewside)
			{
				if (camera.position.x < (paddle2.position.x + 300))
				{
					camera.position.x += ((paddle2.position.x + 300) - (paddle1.position.x - 300)) * 0.01
					camera.position.y = Math.sqrt(Math.pow(paddle1.position.x - 300, 2) - Math.pow(camera.position.x, 2))
					camera.rotation.z = ((camera.position.x >= 0 ) ? 90 * Math.PI/180 : -90 * Math.PI/180) + Math.atan(camera.position.y / camera.position.x)
					camera.rotation.y = -40 * Math.PI/180 * Math.sin(-camera.rotation.z)
					camera.rotation.x = 40 * Math.PI/180 * Math.cos(-camera.rotation.z)
				}
				else
					this.prevviewside = this.viewside
			}
			else
			{
				if (camera.position.x > (paddle1.position.x - 300))
				{
					camera.position.x -= ((paddle2.position.x + 300) - (paddle1.position.x - 300)) * 0.01 
					camera.position.y = -Math.sqrt(Math.pow(paddle1.position.x - 300, 2) - Math.pow(camera.position.x, 2))
					camera.rotation.z = ((camera.position.x >= 0 ) ? 90 * Math.PI/180 : -90 * Math.PI/180) + Math.atan(camera.position.y / camera.position.x)
					camera.rotation.y = -40 * Math.PI/180 * Math.sin(-camera.rotation.z)
					camera.rotation.x = 40 * Math.PI/180 * Math.cos(-camera.rotation.z)
				}
				else
					this.prevviewside = this.viewside
			}
		},
		toggle(e: any) {
			const target = <HTMLElement>document.getElementById('div3d')
			this.$q.fullscreen.toggle(target)
				.then(() => {
				})
				.catch((err) => {
					alert(err)
				})
		},
		waitEndResize() {
			clearTimeout(this.timeOutFunctionId);
			this.timeOutFunctionId = setTimeout(this.onResize, 200);
		},
		onResize() {
			if (this.$q.fullscreen.isActive == true) {

				if (window.screen.orientation.type == "portrait-primary") {
					renderer.setSize(window.innerWidth, window.innerHeight / 1.6);
					this.canvas.height = window.innerWidth / 1.6;
					this.canvas.width = window.innerWidth;
					this.canvas_txt.height = window.innerWidth / 1.6;
					this.canvas_txt.width = window.innerWidth;					
				}
				else {
					renderer.setSize(window.innerWidth * 0.99, window.innerHeight * 0.99);
					this.canvas.width = window.innerWidth * 0.99;
					this.canvas.height = window.innerHeight * 0.99;
					this.canvas_txt.width = window.innerWidth * 0.99;
					this.canvas_txt.height = window.innerHeight * 0.99;
				}
			}
			else {
				renderer.setSize( window.innerWidth / 1.5, window.innerWidth / 1.5 / 1.6);
				this.canvas.height = window.innerWidth / 1.5 / 1.6;
				this.canvas.width = window.innerWidth / 1.5;
				this.canvas_txt.height = window.innerWidth / 1.5 / 1.6;
				this.canvas_txt.width = window.innerWidth / 1.5;
				camera.aspect = this.canvas_txt.width / this.canvas_txt.height;				
			}
			this.canvas.style.top = this.$q.fullscreen.isActive ? "0%" : "5%";
			this.canvas_txt.style.top = this.$q.fullscreen.isActive ? "0%" : "5%";
			renderscene = new RenderPass( scene, camera );
			composer = new EffectComposer(renderer);
			composer.addPass(renderscene);
			bloomPass = new UnrealBloomPass(
				new THREE.Vector2(this.canvas.width, this.canvas.height),
				bloomstrength,
				bloomradius,
				bloomthreshold
			)
			composer.addPass(bloomPass);
			composer.addPass(glitchPass);
		},
		update_and_draw(data: any) {
			this.updateTrail()
			let bidule = new Uint16Array(data.gamedata)
			paddle1.position.y = -1 * (bidule[0]) + 310
			paddle2.position.y = -1 * (bidule[1]) + 310
			ball.position.x =  bidule[2] - 550
			ball.position.y = -1 * (bidule[3]) + 360			
			if (this.player1_score != bidule[4] ||  this.player2_score != bidule[5])
			{
				glitchPass.enabled = true;
				glitchPass.curF = 0;
				setTimeout(() => {
					glitchPass.enabled = false;
					// glitchPass.goWild = false
				}, 500);
			}
			this.player1_score = bidule[4]
			this.player2_score = bidule[5]
			
			
		},
		updateTrail()
		{
			ball.rotation.x += 0.5 * Math.PI/180;
			bigSphere.rotation.x += 0.1 * Math.PI/180;
			bigSphere.rotation.y += 0.1 * Math.PI/180;
			bigSphere.rotation.z += 0.1 * Math.PI/180;
			bigSphere_2.rotation.x += 0.1 * Math.PI/180;
			bigSphere_2.rotation.y -= 0.1 * Math.PI/180;
			bigSphere_2.rotation.z += 0.1 * Math.PI/180;
			bigSphere_3.rotation.x -= 0.1 * Math.PI/180;
			bigSphere_3.rotation.y += 0.1 * Math.PI/180;
			bigSphere_3.rotation.z += 0.1 * Math.PI/180;
			bigSphere_4.rotation.x -= 0.1 * Math.PI/180;
			bigSphere_4.rotation.y -= 0.1 * Math.PI/180;
			bigSphere_4.rotation.z += 0.1 * Math.PI/180;
			trail19.position.x = trail18.position.x  
			trail19.position.y = trail18.position.y  
			trail18.position.x = trail17.position.x  
			trail18.position.y = trail17.position.y  
			trail17.position.x = trail15.position.x  
			trail17.position.y = trail15.position.y  
			trail15.position.x = trail14.position.x  
			trail15.position.y = trail14.position.y  
			trail14.position.x = trail13.position.x  
			trail14.position.y = trail13.position.y  
			trail13.position.x = trail16.position.x  
			trail13.position.y = trail16.position.y  
			trail16.position.x = trail12.position.x  
			trail16.position.y = trail12.position.y  
			trail12.position.x = trail11.position.x  
			trail12.position.y = trail11.position.y  
			trail11.position.x = trail10.position.x  
			trail11.position.y = trail10.position.y
			trail10.position.x = trail9.position.x  
			trail10.position.y = trail9.position.y 
			trail9.position.x = trail8.position.x  
			trail9.position.y = trail8.position.y  
			trail8.position.x = trail7.position.x  
			trail8.position.y = trail7.position.y  
			trail7.position.x = trail5.position.x  
			trail7.position.y = trail5.position.y  
			trail5.position.x = trail4.position.x  
			trail5.position.y = trail4.position.y  
			trail4.position.x = trail3.position.x  
			trail4.position.y = trail3.position.y  
			trail3.position.x = trail6.position.x  
			trail3.position.y = trail6.position.y  
			trail6.position.x = trail2.position.x  
			trail6.position.y = trail2.position.y  
			trail2.position.x = trail1.position.x  
			trail2.position.y = trail1.position.y  
			trail1.position.x = trail0.position.x  
			trail1.position.y = trail0.position.y  
			trail0.position.x = ball.position.x
			trail0.position.y = ball.position.y
		},
		handleCoundown(data: any) {
			if (data.status == 'done') {
				this.start_game = true;
				this.game_paused = false;
				this.info_value = null;
				this.namedisplay = "";

			}
			else if (data.status == 'pending') {
				this.game_paused = true;
				this.info_value = data.value;
				this.namedisplay = (data.name == undefined) ? "": data.name;
			}
			// this.draw()
		},
		handleGameEnd(data: any) {
			this.game_paused = true;
			this.info_value = data.value;
			glitchPass.enabled = true;
			glitchPass.curF = 0;
			setTimeout(() => {
				glitchPass.enabled = false;
			}, 500);
			setTimeout(() => {
				this.$router.push("/profile/me")
			}, 1000)
		},
		ft_mounted() {
			scene = new THREE.Scene();
			renderer = new THREE.WebGLRenderer();
			glitchPass = new GlitchPass();
			glitchPass.enabled = false
			this.canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
			this.canvas_txt = <HTMLCanvasElement>document.getElementById('canvas_txt');
			this.$ws.listen(`${this.gameId}___countdown`, this.handleCoundown);
			this.$ws.listen(`${this.gameId}___game-end`, this.handleGameEnd);
			this.$ws.listen(`${this.gameId}___frame-update`, this.update_and_draw);
			this.canvas_txt.addEventListener('dblclick', this.toggle);
			window.addEventListener('resize', this.waitEndResize);
			watch(() => this.$q.fullscreen.isActive, val => {
				this.waitEndResize();
			})
			this.setup();
			this.onResize();
			this.draw()
		},
	},
	created() {
		this.gameId = this.$route.params.gameId.toString() as string;
		this.playerOneName = this.$route.query.playerOneName as string;
		this.playerTwoName = this.$route.query.playerTwoName as string;
	},
	mounted() {
		this.prevviewside = this.viewside;
		this.ft_mounted()
		
	},
	beforeUnmount() {
		window.cancelAnimationFrame(this.frame)
		this.$ws.removeListener(`${this.gameId}___countdown`)
		this.$ws.removeListener(`${this.gameId}___game-end`)
		this.$ws.removeListener(`${this.gameId}___frame-update`)
		this.canvas_txt.removeEventListener('dblclick',this.toggle )
		window.removeEventListener('resize', this.waitEndResize);
		this.$ws.emit('quit', {})
	}
})
</script>

<style scoped>
#canvas_txt {
	opacity: 1;
	position:absolute;
	left: 50%;
	transform: translateX(-50%);
	z-index: 1;
	border: 5px solid white;
}
#gameCanvas {
	position:absolute;
	left: 50%;
	transform: translateX(-50%);
	z-index: 0;
	border: 5px solid white;
}
/* body {
	background-color: #242729;
} */
main {
	display: flex;
	flex-direction: column;
}

/* .normalscreen{
	top:5%;
}

.fullscreen {
	top:0%;

} */

</style>