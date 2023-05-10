<!--
  This vue file have to handle :
  - Invitation from an other player to you  -> You are requested to accept or decline the invitation, 30s delay before it declines automaticaly
  - Invitation from you to an other player  -> You wait at most 30s to the opponent to accept your game request, you can cancel anytime
  - Matchmaking launch                      -> You will look for other player indefintely, you can cancel anytime. If you find an opponent, you will enter in the game (Aymeric's problem)
-->
<template>
  <div class="dialog">
    <q-item class="r-pt-md flex-center">
      <q-item-label v-if="sent" class="bigger">
        Waiting <span style="color:orange;">{{ opponent }}</span> to accept your game invitation
      </q-item-label>
      <q-item-label v-else class="bigger">
        You recieved a game invitation from <span style="color:orange;">{{ opponent }}</span>
      </q-item-label>
    </q-item>
    <q-item>
      <q-item-section class="q-pt-md flex-center">
      <q-item>
        <q-img class="image" :src="`/maps/${map}.png`" />
      </q-item>
        <q-item-label class="label press2p q-pt-md">
            {{ difficulty }}
        </q-item-label>
      </q-item-section>
      <q-item-section class="flex-center">
        <Rank v-if="userFetched"
          :victory="(profile.victoriesAsPOne+profile.victoriesAsPTwo)"
          :defeat="(profile.defeatsAsPOne+profile.defeatsAsPTwo)"
        />
      </q-item-section>
    </q-item>
      <!-- <q-inner-loading v-if="sent" size="50px" class="load" :showing="visible" color="orange" ref="load" />
      <q-item v-else> -->
    <q-item class="q-py-xl flex-center">
      <q-btn v-if="!sent" class="q-mx-lg" label="Decline" color="red" @click="gameInviteResponse('DECLINED')"
        v-close-popup />
      <q-btn v-if="!sent" class="q-mx-lg" label="Accept" color="green" @click="gameInviteResponse('ACCEPTED')"
        v-close-popup />
      <q-btn v-else label="Cancel" color="red" @click="gameInviteCancel" v-close-popup />
    </q-item>
    <q-linear-progress instant-feedback ref="bar" color="orange" size="20px" :value="progress"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Rank from '../pages/Profile/components/Rank.vue'

export default defineComponent({
  components: { Rank },
  name: 'GameInvitation',
  setup() {
    const visible = ref(false)
    const progress = ref(0.00)
    return {
      visible,
      loader() {
        visible.value = true
      },
    progress
    }
  },
  data() {
    return {
      $refs: undefined as any,
      profile: [] as any,
      avatar: '/api/avatar/' as string,
      userFetched: false as Boolean
    }
  },
  props: {
    opponent: { type: String, default: null },
    sent: { type: Boolean, default: false },
    map: { type: String, default: '0' },
    difficulty: { type: String, default: '0' }
  },
  mounted() {
  },
  created() {
    this.recursiveProgress()
    this.loader()
    this.fetchUserProfile(this.opponent)
    this.avatar += `${this.opponent}/thumbnail`
    document.dispatchEvent(new CustomEvent('stop-listening-for-game-invite'));
  },
  methods: {
    async recursiveProgress() {
      this.progress += 0.011
      if (this.progress < 1.0)
        setTimeout(this.recursiveProgress, 300)
    },
    gameInviteResponse(res: string) {
      if (res === 'ACCEPTED')
        document.dispatchEvent(new CustomEvent('invite-response-accept', { detail: { status: res } }));
      else
      {
        document.dispatchEvent(new CustomEvent('invite-response-decline', { detail: { status: res } }));
        document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));
      }
    },
    gameInviteCancel() {
      document.dispatchEvent(new CustomEvent('invite-response-canceled'));
      document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));

    },
    fetchUserProfile(username : string) {
      this.$api.userProfile(username)
      .then((result) => {
        this.profile = result
        this.userFetched = true
      })
      .catch(()=>{
        this.$store.notifCenter.send({
          message: `Unable to fetch ${username}'s profile`,
          type: 'warning',
        })
      })
    },
  },
  beforeUnmount() {
    document.dispatchEvent(new CustomEvent('invite-response-canceled'));
    document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));
  },
  unmounted() {
    document.dispatchEvent(new CustomEvent('invite-response-canceled'));
    document.dispatchEvent(new CustomEvent('can-listen-for-game-invite'));
  }
})
</script>

<style lang="sass" scoped>
@use "../css/interpolate" as r

.load
  background: 0

.relative
  position: relative

.image
  @include r.interpolate(width, 320px, 2560px, 45px, 75px)

</style>
