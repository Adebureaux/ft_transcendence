<template>
<q-page>
		<div id="mainProfileContainer">

		<div class="r-px-xl">
		  <ProfileSummary v-if="userFetched"
			:name=profile.username
			:avatar=avatar
			:victory=(profile.victoriesAsPOne+profile.victoriesAsPTwo)
			:defeat=(profile.defeatsAsPOne+profile.defeatsAsPTwo)
			interact
		  />
		</div>
		<q-item class="r-px-xl">
		  <q-item-section>
			<div>
			  <LevelProgress v-if="userFetched"
				:victory="(profile.victoriesAsPOne+profile.victoriesAsPTwo)"
				:defeat="(profile.defeatsAsPOne+profile.defeatsAsPTwo)"
			  />
			</div>
		  </q-item-section>
		  <q-item-section class="col-3">
			<Rank v-if="userFetched"
			  :victory="(profile.victoriesAsPOne+profile.victoriesAsPTwo)"
			  :defeat="(profile.defeatsAsPOne+profile.defeatsAsPTwo)"
			/>
		  </q-item-section>
		</q-item>
		<div class="r-py-md q-px-md">
			<q-item>
			  <q-item-section>
				<q-item-label v-if="games.total" class="bigger press2p text-center" style="opacity:0.3; font-size: medium;">Match History</q-item-label>
				<q-item-label v-else-if="gameFetched && userFetched" class="bigger press2p" style="opacity:0.3; font-size: medium;">No game history</q-item-label>
			  </q-item-section>
			</q-item>
		  <div v-for="game in games.result" :key="game">
			<MatchHistory
			  :status="gameStatus(game)"
			  :pOne=game.playerOneName
			  :pTwo=game.playerTwoName
			  :scoreOne=game.score_playerOne
			  :scoreTwo=game.score_playerTwo
			/>
		  </div>
		</div>
		<q-item class="flex-center" v-if="!userFetched">
		  <q-item-label class="bigger press2p" style="opacity:0.3; font-size: medium;">
			This profile does not exist
		  </q-item-label>
		</q-item>
	</div>
</q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IGameQuery } from '../../services/api.models'
import ProfileSummary from './components/ProfileSummary.vue'
import MatchHistory from './components/MatchHistory.vue'
import LevelProgress from './components/LevelProgress.vue'
import Rank from './components/Rank.vue'

export default defineComponent({
  name: 'Profile',
  components: { ProfileSummary, MatchHistory, LevelProgress, Rank },
  data() {
    return {
      username: this.$route.params.username.toString() as string,
      avatar: '' as string,
      profile: [] as any,
      games: [] as any,
      userFetched: false as boolean,
      gameFetched : false as boolean
    }
  },
  mounted () {
    this.fetchUserProfile()
  },
  updated() {
    this.username = this.$route.params.username.toString()
    this.fetchUserProfile()
  },
  methods: {
    fetchUserProfile() {
      this.$api.userProfile(this.username)
      .then((result) => {
        this.profile = result
        this.avatar = `/api/avatar/${result.username}/large`
        this.userFetched = true
        this.fetchGameHistory()
      })
      .catch(() => {})
    },
    fetchGameHistory() {
      const searchQuery : IGameQuery = {
        skip: '0',
        take: '20',
        order: 'desc',
      }
      this.$api.userGame(this.username, searchQuery)
      .then((result) => {
        this.games = result
        this.gameFetched = true
      })
      .catch((error) => { })
    },
    gameStatus(game : any) : string {
      if (game.score_playerOne === game.score_playerTwo)
        return ('Draw')
      else if (game.score_playerOne > game.score_playerTwo && game.playerOneName === this.profile.username)
        return ('Victory')
      else if (game.score_playerOne < game.score_playerTwo && game.playerTwoName === this.profile.username)
        return ('Victory')
      return ('Defeat')
    }
  }
})
</script>
<style lang="sass">
#mainProfileContainer
  max-width: 90%
  margin: auto
  height: 100%
</style>