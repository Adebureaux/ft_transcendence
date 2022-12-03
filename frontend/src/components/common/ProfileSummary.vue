<template>
	<q-item>
		<q-item-section avatar>
			<q-avatar size="6vw">
				<q-img :src="avatar"/>
			</q-avatar>
		</q-item-section>
		<q-item-section>
			<q-item-label class="label name">{{name}}</q-item-label>
		</q-item-section>
	</q-item>
	<q-item>
		<q-item-section>
			<q-item-label class="label score">Victory : {{victory}}</q-item-label>
		</q-item-section>
		<q-separator vertical color="white"></q-separator>
		<q-item-section>
			<q-item-label class="label score">Defeat : {{defeat}}</q-item-label>
		</q-item-section>
		<q-separator vertical color="white"></q-separator>
		<q-item-section>
			<q-item-label class="label score">Ratio : {{ratio(victory, defeat)}}</q-item-label>
		</q-item-section>
	</q-item>
	<q-separator color="white"></q-separator>
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

<style lang="scss" scoped>
@mixin interpolate($properties, $min-screen, $max-screen, $min-value, $max-value) {
	& {
		@each $property in $properties {
			#{$property}: $min-value;
		}

		@media screen and (min-width: $min-screen) {
			@each $property in $properties {
				#{$property}: calc-interpolation($min-screen, $min-value, $max-screen, $max-value); 
			}
		}

		@media screen and (min-width: $max-screen) {
			@each $property in $properties {
				#{$property}: $max-value;
			}
		}
	}
}

// Requires the calc-interpolation function which can also be used independently

@function calc-interpolation($min-screen, $min-value, $max-screen, $max-value) {
	$a: ($max-value - $min-value) / ($max-screen - $min-screen);
	$b: $min-value - $a * $min-screen; 

	$sign: "+";
	@if ($b < 0) {
		$sign: "-";
		$b: abs($b);
	}
	@return calc(#{$a*100}vw #{$sign} #{$b});
}

// Indrek Pass also has a fantastic mixin here: http://sassmeister.com/gist/7f22e44ace49b5124eec


/* Single property */

.label {
	@include interpolate(font-size, 320px, 2560px, 12px, 30px);
	@include interpolate((padding-top, padding-bottom), 20rem, 70rem, 0rem, .5rem);
	color: white;
}

.name {
	padding-left: 1vw;
}
.score {
	text-align: center;
}
</style>
