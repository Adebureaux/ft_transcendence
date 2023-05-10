<template>
	<q-page>
		<!-- <q-btn id="viewsidebtn" color="0x242729" @click="changeViewSide" :label="viewside ? 'p1' : 'p2'" padding="xs"></q-btn> -->
		<DrawGame3d :viewside="viewside"></DrawGame3d>
	</q-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import DrawGame3d from './components/DrawGame3d.vue'

export default defineComponent({
	name: 'Spectate',
	components: {DrawGame3d},
	data() {
		return {
			viewside:true,
		}
	},
	methods:
	{
		changeViewSide()
		{
			if (this.viewside)
				this.viewside = false;
			else
				this.viewside = true;
		},
	},
	mounted() {
		this.$ws.socket.emit("watch-game", this.$route.params.gameId, (response : string) => {
			if (response === "NOT_FOUND")
				return
		});
		addEventListener('keypress', (event) => {
			if (event.code == 'Space')
				this.changeViewSide();
			});
	},
	beforeUnmount() {
		this.$ws.socket.emit("unwatch-game", this.$route.params.gameId);
		removeEventListener('keypress', (event) => {
			if (event.code == 'Space')
				this.changeViewSide();
			});
	}

})
</script>