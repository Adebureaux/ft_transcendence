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
	</q-page>
</template>


<script lang="ts">
	import { api } from 'boot/axios'
	import { defineComponent } from 'vue'
	import ProfileSummary from '../components/common/ProfileSummary.vue'

	
	// Should be replaced by parent authentication
	api.request({method: 'POST', url: '/api/auth/login', data: {username: 'TrucMuche', password: 'superstrongpassword'}})
	.then()
	.catch(function (error) {console.error(error);});

	const me = await api.get(`/api/users/me`)
	
	export default defineComponent({
		name: 'Profile',
		components: { ProfileSummary },
		data() {
			console.log(this.$route.params)
			return {
				username: '' as string,
				profile: [] as any,
				games: [] as object
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
