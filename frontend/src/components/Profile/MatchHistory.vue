<template>
<ProfileCard
	:name=pOne
	:avatar=avatarOne
	thumb="yes"
></ProfileCard>
<q-separator vertical color="white" spaced></q-separator>
<q-item-section>
	<q-item-label>Victory</q-item-label>
</q-item-section>
<q-separator vertical color="white" spaced></q-separator>
	<ProfileCard
		:name=pTwo
		:avatar=avatarTwo
		thumb="yes"
	></ProfileCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProfileCard from './ProfileCard.vue'

export default defineComponent({
	name: 'MatchHistory',
	components: { ProfileCard },
	props: {
		pOne : { type: String , default: undefined },
		pTwo : { type: String , default: undefined },
		scoreOne : { type: Number, default: undefined },
		scoreTwo : { type: Number, default: undefined },
		avatarOne : { type: String, default: undefined },
		avatarTwo : { type: String, default: undefined },
	},
	methods: {}
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
</style>
