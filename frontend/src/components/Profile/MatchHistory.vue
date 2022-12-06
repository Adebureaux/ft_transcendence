<template>
<q-item class="padding">
	<ProfileCard
		:name=pOne
		:avatar=avatarOne
		thumb="yes"
	></ProfileCard>
</q-item>
<q-separator vertical color="white"></q-separator>
<q-item class="padding">
<q-item-section>
	<q-item-label>Victory</q-item-label>
</q-item-section>
</q-item>
<q-separator vertical color="white"></q-separator>
<q-item class="padding">
	<ProfileCard
		:name=pTwo
		:avatar=avatarTwo
		thumb="yes"
	></ProfileCard>
</q-item>
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

})
</script>

<style lang="sass" scoped>
@use "../../css/interpolate" as r
</style>
