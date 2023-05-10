<template>
<div class="doc-container" style="margin:auto; margin-bottom:6px;">
  <div class="row">
    <q-item class="col" clickable @click=goProfilePage(pOne)>
      <q-tooltip anchor="center middle">{{ pOne }}'s profile</q-tooltip>
      <q-item-section avatar>
        <q-avatar class="avatar" :style="`background-color: ${$utils.usernameToColor(pOne)};`">
          <q-img :src="`/api/avatar/${pOne}/thumbnail`" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="username label">{{pOne}}</q-item-label>
      </q-item-section>
      </q-item>
      <q-item class="">
        <q-item-section>
          <q-item-label class="bigger centered press2p">VS</q-item-label>
        </q-item-section>
      </q-item>
    <q-item class="col" clickable @click=goProfilePage(pTwo)>
      <q-tooltip anchor="center middle">{{ pTwo }}'s profile</q-tooltip>
      <q-item-section>
        <q-item-label class="right username label">{{pTwo}}</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-avatar class="avatar" :style="`background-color: ${$utils.usernameToColor(pTwo)};`">
          <q-img :src="`/api/avatar/${pTwo}/thumbnail`" />
        </q-avatar>
      </q-item-section>
     </q-item>
     <q-item side>
      <q-item-section>
        <q-btn class="cust-btn" color="secondary" @click="spectate(gameId, map)">Watch</q-btn>
      </q-item-section>
     </q-item>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'


export default defineComponent({
  name: 'SpectateGames.vue',
  props: {
    pOne    : { type: String , required: true},
    pTwo    : { type: String , required: true },
	  gameId : { type: String, required: true },
	  map : { type : String , required : true }
  },
  methods: {
    spectate (gameId: string, map : string) {
      this.$router.push(`/spectate${map == '3D' ? '3d' : ''}/${gameId}?playerOneName=${this.pOne}&playerTwoName=${this.pTwo}`)
    },
    goProfilePage(username : string) {
      this.$router.push({
        path: '/profile/' + username,
      })
    }
  }
})
</script>

<style lang="sass" scoped>
@use "../css/interpolate" as r
.centered
  text-align: center

.right
  text-align: right

.username
  @include r.interpolate(font-size, 320px, 2560px, 6px, 30px)
  color: white
  overflow: hidden

.cust-btn
  @include r.interpolate(width, 320px, 2560px, 60px, 80px)

.avatar
  @include r.interpolate(font-size, 320px, 2560px, 20px, 45px)

.q-item__section--side
  @include r.interpolate(padding, 320px, 2560px, 2px, 15px)

.q-item__section--avatar
  min-width: 2.5rem
.doc-container
  @include r.interpolate(width, 320px, 2560px, 300px, 1200px)
  @include r.interpolate((margin-top, margin-bottom), 320px, 2560px, 12px, 50px)
  @include r.interpolate((margin-left, margin-right), 320px, 2560px, 6px, 25px)
  background-color: $grey-8
  border-radius: 25px


</style>
