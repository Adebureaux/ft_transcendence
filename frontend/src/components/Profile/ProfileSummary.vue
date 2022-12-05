<template>
<q-item class="padding">
	<ProfileCard
		:name=name
		:avatar=avatar
	></ProfileCard>
</q-item>
<q-item>
	<q-item-section>
		<q-item-label class="label score">Victory<div class="bigger victory">{{victory}}</div></q-item-label>
	</q-item-section>
	<q-separator vertical color="white" spaced></q-separator>
	<q-item-section>
		<q-item-label class="label score">Defeat<div class="bigger defeat">{{defeat}}</div></q-item-label>
	</q-item-section>
	<q-separator vertical color="white" spaced></q-separator>
	<q-item-section> 
		<q-item-label class="label score">Ratio<div class="bigger victory">{{ratio(victory, defeat)}}%</div></q-item-label>
	</q-item-section>
</q-item>
<q-separator color="white" spaced></q-separator>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProfileCard from './ProfileCard.vue'

export default defineComponent({
	name: 'ProfileSummary',
	components: { ProfileCard },
	props: {
		name	: { type: String , default: undefined },
		avatar	: { type: String , required: true },
		victory	: { type: Number , default: 0 },
		defeat	: { type: Number , default: 0 },
	},
	methods: {
		ratio(v: number, d: number): string {
			if (v + d === 0)
				return "0.00"
			return (v / (v + d) * 100).toPrecision(4)
		}
	}
});
</script>

<style lang="sass" scoped>
@mixin interpolate($properties, $min-screen, $max-screen, $min-value, $max-value)
	&
		@each $property in $properties
			#{$property}: $min-value

		@media screen and (min-width: $min-screen)
			@each $property in $properties
				#{$property}: calc-interpolation($min-screen, $min-value, $max-screen, $max-value)

		@media screen and (min-width: $max-screen)
			@each $property in $properties
				#{$property}: $max-value

@function calc-interpolation($min-screen, $min-value, $max-screen, $max-value)
	$a: ($max-value - $min-value) / ($max-screen - $min-screen)
	$b: $min-value - $a * $min-screen

	$sign: "+"
	@if ($b < 0)
		$sign: "-"
		$b: abs($b)
	@return calc(#{$a*100}vw #{$sign} #{$b})

.name
	@include interpolate(font-size, 320px, 2560px, 14px, 40px)
	@include interpolate(padding-left, 320px, 2560px, 0px, 40px)
	font-weight: bold

.score
	text-align: center

.victory
	color: $green

.defeat
	color: $red

.bigger
	@include interpolate(font-size, 320px, 2560px, 14px, 40px)
	@include interpolate((padding-top, padding-bottom), 20rem, 70rem, 0rem, .5rem)
	font-weight: bold

.avatar
	@include interpolate(font-size, 320px, 2560px, 40px, 140px)
	outline: 1.5px solid white
</style>
