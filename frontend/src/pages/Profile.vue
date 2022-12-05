<template>
<q-page>
	<div class="q-pa-lg">
		<ProfileSummary
			:name=profile.username
			avatar="https://avatars.githubusercontent.com/adebureaux"
			:victory=(profile.victoriesAsPOne+profile.victoriesAsPTwo)
			:defeat=(profile.defeatsAsPOne+profile.defeatsAsPTwo)
		></ProfileSummary>
	</div>
	<div class="q-pa-md">
		<q-item v-if="games.total">
			<q-item-section>
				<q-item-label class="label">Match History</q-item-label>
			</q-item-section>
		</q-item>
		<q-item v-for="game in games.result">
			<MatchHistory
			:pOne=game.playerOneName
			:pTwo=game.playerTwoName
			:scoreOne=game.score_playerOne
			:scoreTwo=game.score_playerTwo
			avatarOne="https://avatars.githubusercontent.com/adebureaux"
			avatarTwo="https://cdn.intra.42.fr/users/d1ae701a3af5f3dd3070d5c8406e77fe/tharchen.jpg"
			></MatchHistory>
		</q-item>
	</div>
</q-page>
</template>


<script lang="ts">
import { api } from 'boot/axios'
import { defineComponent } from 'vue'

import MatchHistory from '../components/Profile/MatchHistory.vue'
import ProfileSummary from '../components/Profile/ProfileSummary.vue'


// Should be replaced by parent authentication
api.request({method: 'POST', url: '/api/auth/login', data: {username: 'TrucMuche', password: 'superstrongpassword'}})
.then()
.catch(function (error) {console.error(error);});

const me = await api.get(`/api/users/me`)

export default defineComponent({
	name: 'Profile',
	components: { ProfileSummary, MatchHistory },
	data() {
		console.log(this.$route.params)
		return {
			username: '' as string,
			profile: [] as any,
			games: [] as any
		}
	},
	methods: {
		async fetchUserProfile() {
			const response = await api.get(`/api/users/${me.data.username}/profile`)
			console.log(response.data)
			this.profile = response.data
		},
		async fetchGameHistory() {
			const response = await api.get(`/api/users/${me.data.username}/games?skip=0&take=20&order=desc`)
			console.log(response.data)
			this.games = response.data
		},
	},
	async mounted() {
		await this.fetchUserProfile()
		await this.fetchGameHistory()
	}
})
</script>

<syle lang="sass">
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

.padding
	@include interpolate((padding-left, padding-bottom), 320px, 2560px, 20px, 50px)

.label
	@include interpolate(font-size, 320px, 2560px, 12px, 30px)
	color: white
</syle>
