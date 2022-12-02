<template>
  	<div class="row q-pa-md">
		<q-avatar class="propic" size="100px">
			<img :src="avatar">
		</q-avatar>
		<q-item class="flex-center username">
			{{name}}
		</q-item>
  	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
	name: 'ProfileSummary',
	components: {},
	props: {
		name         : { type: String , default: undefined },
		avatar       : { type: String , required:  true    },
	},
	data() {
		return {}
	},
	methods: {}
});
</script>

<style lang="sass">
.row
	border: solid

.propic
	margin-left: 3%

.username
	margin-left: 4%
	font-size: 55px
	color: white
</style>
