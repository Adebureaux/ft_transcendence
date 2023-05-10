<template>
	<q-page>
			<DrawGame>
			</DrawGame>
	</q-page>
</template>


<script lang="ts">
import {defineComponent} from 'vue'
import DrawGame from './components/DrawGame.vue'
import DrawGame3d from './components/DrawGame3d.vue'


export default defineComponent({
	name: 'Spectate',
	components: {DrawGame,DrawGame3d},
	mounted() {
		this.$ws.socket.emit("watch-game", this.$route.params.gameId, (response : string) => {
			if (response === "NOT_FOUND")
				return
		});
	},
	beforeUnmount() {
		this.$ws.socket.emit("unwatch-game", this.$route.params.gameId);
	}

})
</script>