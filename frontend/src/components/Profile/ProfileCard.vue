<template>
<q-item-section avatar>
	<q-avatar v-if="(!thumb)" class="avatar">
		<q-img :src="avatar"/>
	</q-avatar>
	<q-avatar v-else class="thumb-avatar">
		<q-img :src="avatar"/>
	</q-avatar>
</q-item-section>
<q-item-section>
	<q-item-label v-if="(!thumb)" class="label name">{{name}}</q-item-label>
	<q-item-label v-else class="thumb-name">{{name}}</q-item-label>
</q-item-section>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'ProfileCard',
	props: {
		name : { type: String , default: undefined },
		avatar : { type: String , default: undefined },
		thumb : { type: String, default: '' }
	}
})

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

.avatar
	@include interpolate(font-size, 320px, 2560px, 40px, 140px)
	outline: 1.5px solid white
</style>
