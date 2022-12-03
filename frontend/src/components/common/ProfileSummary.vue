<template>
	<q-item>
		<q-item-section avatar>
			<q-avatar size="5vw">
				<q-img :src="avatar"/>
			</q-avatar>
		</q-item-section>
		<q-item-section class="tochange">
			{{name}}
		</q-item-section>
	</q-item>
	<q-item>
		<q-item-section>
			Victory : {{victory}}
		</q-item-section>
		<q-separator vertical spaced></q-separator>
		<q-item-section>
			Defeat : {{defeat}}
		</q-item-section>
		<q-separator vertical spaced></q-separator>
		<q-item-section>
			Ratio V/D : {{ratio(victory, defeat)}}
		</q-item-section>
	</q-item>
	<q-separator></q-separator>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'ProfileSummary',
	components: {},
	props: {
		name	: { type: String , default: undefined },
		avatar	: { type: String , required: true },
		victory	: { type: Number , default: 0 },
		defeat	: { type: Number , default: 0 },
	},
	methods: {
		ratio(v: number, d: number): string {
			return (v / (v + d) * 100).toPrecision(4)
		}
	}
});
</script>

<style lang="sass">
.tochange
	color: white
	font-weight: bold
	font-size: 4vw
	padding-left: 2vw
</style>
