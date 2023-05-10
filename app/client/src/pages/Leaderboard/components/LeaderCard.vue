<template>
  <div class="q-px-md">
    <div class="q-px-sm row" :class="$store.username == user.username ? 'isme' : 'notme'">

      <div class="row main justify-evenly items-center r-mx-md q-px-md" :class="rankborder" clickable @click="goProfilPage">

        <div style="" class="press2p rank">#{{ rank + 1 }}</div>

        <!-- <q-separator vertical/> -->

        <div>
          <q-avatar style="" class="LBavatar" :style="`background-color: ${$utils.usernameToColor(user.username)};`">
            <img :src="`/api/avatar/${user.username}/thumbnail`">
            <div :class="getLoginStatus()" class="loginstatush"/>
          </q-avatar>
        </div>

        <div class="q-ml-lg text-bold">
          {{ user.username }}
        </div>

        <div>
          <div class="biggerh victory">
            {{ user.victoriesAsPOne + user.victoriesAsPTwo }}
          </div>
          <q-tooltip transition-show="flip-right" transition-hide="flip-left" class="bg-green text-h6">
            <span>P1: {{ user.victoriesAsPOne }}</span>
            <br/>
            <span>P2: {{ user.victoriesAsPTwo }}</span>
          </q-tooltip>
        </div>

        <div>
          <div class="biggerh defeat">
            {{ user.defeatsAsPOne + user.defeatsAsPTwo }}
          </div>
          <q-tooltip transition-show="flip-right" transition-hide="flip-left" class="bg-red text-h6">
            <span>P1: {{ user.defeatsAsPOne }}</span>
            <br/>
            <span>P2: {{ user.defeatsAsPTwo }}</span>
          </q-tooltip>
        </div>

        <div>
          <div class="biggerh">
            {{ getRatio(user) }}
          </div>
          <q-tooltip transition-show="flip-right" transition-hide="flip-left" class="bg-green text-h6">
            <span>P1: {{ getRatiobyPlayer(user, 'One') }}%</span>
            <br/>
            <span>P2: {{ getRatiobyPlayer(user, 'Two') }}%</span>
          </q-tooltip>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { UserBoard } from 'src/stores/store.types'
import { UserStatus } from 'src/stores/store.types';

export default defineComponent({
  name: 'LeaderCard',
  // components: {},
  props: {
    user: { type: Object as PropType<UserBoard>, required: true },
    rank: { type: Number, required: true },
  },
  data() {
    return {}
  },
  computed: {
    rankborder() {
      switch (this.rank) {
        case 0  : return 'rankborder-gold'
        case 1  : return 'rankborder-silver'
        case 2  : return 'rankborder-bronze'
        default : return 'rankborder-others'
      }
    },
  },
  methods: {
    getRatio(user: UserBoard) : string {
      let ret : string | number = (user.victoriesAsPOne + user.victoriesAsPTwo) / (user.victoriesAsPOne + user.victoriesAsPTwo + user.defeatsAsPOne + user.defeatsAsPTwo)
      if (isNaN(ret))
        ret = '0.00 %'
      else
        ret = (ret * 100).toFixed(2) + ' %'
      return ret
    },
    getRatiobyPlayer(user: UserBoard, player: string) : string {
      const userVictoriesAsP = user[('victoriesAsP' + player) as keyof UserBoard] as number
      const userdefeatsAsP = user[('defeatsAsP' + player) as keyof UserBoard] as number
      return (userVictoriesAsP / (userVictoriesAsP + userdefeatsAsP) * 100).toFixed(2)
    },
    getLoginStatus() {
      const status = this.$store.getStatus(this.user.username)
      if (status === UserStatus.ONLINE)
        return 'ONLINE-status'
      else if (status === UserStatus.WATCHING)
        return 'WATCHING-status'
      else if (status === UserStatus.INGAME)
        return 'INGAME-status'
      return 'OFFLINE-status'
    },
    goProfilPage() {
      this.$router.push({
        path: '/profile/' + this.user.username,
      })
    },
  },
});
</script>

<style lang="sass" scoped>
@use "src/css/interpolate" as r

.main:hover
  background-color: #525252

.main
  width: 60vw
  margin: auto
  border-radius: 2.5em
  flex-flow: row
  height: 8vh
  > div
    width: 100%
  >:nth-child(3)
    min-width: 100px
    @include r.interpolate(font-size, 320px, 2560px, 10px, 35px)
  >:nth-child(2)
    min-width: 3.5vw
    width: 3.5vw
    margin-top: 0.6vw
    margin-bottom: 0.6vw

.rankborder-gold
  border-top:    0.5vw solid gold
  border-bottom: 0.5vw solid gold

.rankborder-silver
  border-top:    0.5vw solid silver
  border-bottom: 0.5vw solid silver

.rankborder-bronze
  border-top:    0.5vw solid $brown-6
  border-bottom: 0.5vw solid $brown-6

.rankborder-others
  border-top:    0.5vw solid $grey-8
  border-bottom: 0.5vw solid $grey-8

.biggerh
  @include r.interpolate(font-size, 320px, 2560px, 8px, 35px)
  @include r.interpolate((padding-top, padding-bottom), 20rem, 70rem, 0rem, .2rem)
  color: $blue-grey-2
  font-weight: bold

.loginstatush
  @include r.interpolate((width, height), 320px, 2560px, 8px, 25px)
  border-radius: 100px
  position: absolute
  @include r.interpolate((margin-top, margin-left), 320px, 2560px, 8px, 50px)

.isme
  border: 4px solid green
  border-radius: 10px

.notme
  border: 4px solid $bg-primary
  border-radius: 10px

.lname
  @include r.interpolate(font-size, 320px, 2560px, 8px, 35px)
  min-width: 150px

.rank
  font-size: 1em
  // @include r.interpolate(width, 320px, 2560px, 40px, 150px)
  max-width: 60px !important
  min-width: 60px !important

.LBavatar
  @include r.interpolate((width, height), 320px, 2560px, 20px, 60px)
</style>
